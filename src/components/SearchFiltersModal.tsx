import React from 'react';
import { useApp } from '../context/AppContext';
import { MAHARASHTRA_DISTRICTS } from '../data/initialData';
import { X, Filter, RotateCcw, Check, Sparkles, ShieldCheck, Camera, Compass } from 'lucide-react';
import { Gender } from '../types';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

export const SearchFiltersModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { t, searchFilters, setSearchFilters, resetFilters, language, siteConfig } = useApp();

  useModalScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn pt-safe pb-safe">
      <div className="relative w-full h-full sm:h-auto max-w-xl bg-slate-900 border-0 sm:border-2 border-amber-400/40 rounded-none sm:rounded-3xl shadow-2xl text-white overflow-hidden sm:my-auto max-h-none sm:max-h-[88vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-amber-500/20 shrink-0">
          <div className="flex items-center gap-2 text-amber-400 font-black text-sm sm:text-base">
            <Filter className="w-5 h-5 text-orange-400" />
            <span>{language === 'mr' ? 'प्रगत वधू-वर शोध व फिल्टर (Search & Filters)' : 'Advanced Matrimonial Search Filters'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1 pr-4">
          
          {/* Gender Filter */}
          {siteConfig?.filterShowGender !== false && (
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                {t('looking_for')} (लिंग):
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSearchFilters((p) => ({ ...p, gender: 'all' }))}
                  className={`py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                    searchFilters.gender === 'all'
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'mr' ? 'सर्व (दोन्ही)' : 'Both'}
                </button>
                <button
                  type="button"
                  onClick={() => setSearchFilters((p) => ({ ...p, gender: 'bride' }))}
                  className={`py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                    searchFilters.gender === 'bride'
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  👰 {t('bride')}
                </button>
                <button
                  type="button"
                  onClick={() => setSearchFilters((p) => ({ ...p, gender: 'groom' }))}
                  className={`py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                    searchFilters.gender === 'groom'
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🤵 {t('groom')}
                </button>
              </div>
            </div>
          )}

          {/* Age Range Filter */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
            <label className="block font-bold text-amber-300 text-xs">
              वय मर्यादा (Age Range): {searchFilters.minAge} वर्षे ते {searchFilters.maxAge} वर्षे
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">किमान वय:</span>
                <select
                  value={searchFilters.minAge}
                  onChange={(e) =>
                    setSearchFilters((p) => ({ ...p, minAge: Number(e.target.value) }))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 outline-none text-xs"
                >
                  {Array.from({ length: 40 }, (_, i) => 18 + i).map((num) => (
                    <option key={num} value={num}>
                      {num} वर्षे
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">कमाल वय:</span>
                <select
                  value={searchFilters.maxAge}
                  onChange={(e) =>
                    setSearchFilters((p) => ({ ...p, maxAge: Number(e.target.value) }))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 outline-none text-xs"
                >
                  {Array.from({ length: 50 }, (_, i) => 21 + i).map((num) => (
                    <option key={num} value={num}>
                      {num} वर्षे
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Occupation / Profession Dropdown */}
          <div className="p-3.5 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl space-y-2">
            <label className="block text-amber-300 font-bold text-xs">
              🔍 नोकरी / व्यवसाय / पद (Profession):
            </label>
            <select
              value={searchFilters.occupation}
              onChange={(e) => setSearchFilters((p) => ({ ...p, occupation: e.target.value }))}
              className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2.5 text-white font-bold text-xs outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              <option value="">-- सर्व नोकरी / व्यवसाय (All Profiles) --</option>
              <option value="govt">🏛️ सरकारी नोकरी / अधिकारी (Govt Job / MPSC / UPSC)</option>
              <option value="doctor">🩺 डॉक्टर / वैद्यकीय (Doctor / MBBS / BAMS / MD)</option>
              <option value="engineer">💻 इंजिनिअर / आयटी (Engineer / BE / B.Tech / Software)</option>
              <option value="teacher">👨‍🏫 शिक्षक / प्राध्यापक (Teacher / Professor)</option>
              <option value="business">🏢 व्यवसाय / उद्योग (Business / Contractor)</option>
              <option value="farmer">🌾 शेतकरी / कृषी (Farmer / Agriculture)</option>
              <option value="lawyer_ca">⚖️ वकील / सीए (Lawyer / Advocate / CA)</option>
              <option value="private">💼 कॉर्पोरेट / खाजगी नोकरी (Private Sector)</option>
            </select>
          </div>

          {/* District & Taluka */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">{t('district')} (जिल्हा):</label>
              <select
                value={searchFilters.district}
                onChange={(e) => setSearchFilters((p) => ({ ...p, district: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 outline-none text-xs"
              >
                <option value="">-- {t('select_district')} --</option>
                {MAHARASHTRA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">तालुका / शहर (Taluka/City):</label>
              <input
                type="text"
                placeholder="उदा. पाथर्डी, बीड, नाशिक, पुणे..."
                value={searchFilters.taluka}
                onChange={(e) => setSearchFilters((p) => ({ ...p, taluka: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 outline-none text-xs"
              />
            </div>
          </div>

          {/* Education & Subcaste */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">{t('education')} (शिक्षण):</label>
              <input
                type="text"
                placeholder="उदा. MBBS, BE, MPSC, B.Sc, MBA..."
                value={searchFilters.education}
                onChange={(e) => setSearchFilters((p) => ({ ...p, education: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">उपजात / गोत्र (Subcaste/Gotra):</label>
              <input
                type="text"
                placeholder="उदा. वंजारी, रावजी, लाडजी..."
                value={searchFilters.subCaste}
                onChange={(e) => setSearchFilters((p) => ({ ...p, subCaste: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 outline-none text-xs"
              />
            </div>
          </div>

          {/* Marital Status & Manglik */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">{t('marital_status')}:</label>
              <select
                value={searchFilters.maritalStatus}
                onChange={(e) => setSearchFilters((p) => ({ ...p, maritalStatus: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 outline-none text-xs"
              >
                <option value="">-- सर्व स्थिती --</option>
                <option value="never_married">{t('never_married')}</option>
                <option value="divorced">{t('divorced')}</option>
                <option value="widowed">{t('widowed')}</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">मंगळ / पत्रिका (Manglik):</label>
              <select
                value={searchFilters.manglik || 'all'}
                onChange={(e) => setSearchFilters((p) => ({ ...p, manglik: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 outline-none text-xs"
              >
                <option value="all">सर्व (All)</option>
                <option value="no">मंगळ नसलेले (Non-Manglik)</option>
                <option value="yes">मंगळ असलेले (Manglik)</option>
              </select>
            </div>
          </div>

          {/* Checkboxes for Photo Available & Verified Only */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-amber-500/40 transition-colors">
              <input
                type="checkbox"
                checked={searchFilters.photoOnly || false}
                onChange={(e) =>
                  setSearchFilters((p) => ({ ...p, photoOnly: e.target.checked }))
                }
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
              <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>फक्त फोटो असणारे प्रोफाईल्स</span>
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-amber-500/40 transition-colors">
              <input
                type="checkbox"
                checked={searchFilters.verifiedOnly}
                onChange={(e) =>
                  setSearchFilters((p) => ({ ...p, verifiedOnly: e.target.checked }))
                }
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
              <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>केवळ प्रमाणित (Verified) प्रोफाईल्स</span>
              </span>
            </label>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={resetFilters}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>सर्व रीसेट करा (Reset)</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-black flex items-center gap-1.5 shadow cursor-pointer transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>लागू करा ({language === 'mr' ? 'फिल्टर' : 'Apply Filters'})</span>
          </button>
        </div>

      </div>
    </div>
  );
};
