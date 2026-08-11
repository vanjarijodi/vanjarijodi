import React from 'react';
import { useApp } from '../context/AppContext';
import { MAHARASHTRA_DISTRICTS } from '../data/initialData';
import { X, Filter, RotateCcw, Check } from 'lucide-react';
import { Gender } from '../types';

export const SearchFiltersModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { t, searchFilters, setSearchFilters, resetFilters, language, siteConfig } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl text-white overflow-hidden my-auto max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-amber-500/20">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Filter className="w-5 h-5 text-orange-400" />
            <span>{language === 'mr' ? 'प्रगत वधू-वर शोध फिल्टर' : 'Advanced Search Filters'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1 pr-4">
          
          {/* Info Badge */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300 font-bold leading-relaxed flex items-start gap-2">
            <span className="text-base shrink-0">💡</span>
            <span>
              सध्या सर्व बायोडाटा सहज दिसण्यासाठी <strong>लिंग (वधू/वर)</strong> व <strong>नोकरी/व्यवसाय (Profession)</strong> हे प्रमुख शोध पर्याय सक्रिय आहेत.
            </span>
          </div>

          {/* Gender */}
          {siteConfig?.filterShowGender !== false && (
            <div>
              <label className="block font-semibold text-slate-300 mb-2">
                {t('looking_for')}
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSearchFilters((p) => ({ ...p, gender: 'all' }))}
                  className={`py-2 rounded-lg font-bold text-xs ${
                    searchFilters.gender === 'all'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'mr' ? 'सर्व (दोन्ही)' : 'Both'}
                </button>
                <button
                  type="button"
                  onClick={() => setSearchFilters((p) => ({ ...p, gender: 'bride' }))}
                  className={`py-2 rounded-lg font-bold text-xs ${
                    searchFilters.gender === 'bride'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  👰 {t('bride')}
                </button>
                <button
                  type="button"
                  onClick={() => setSearchFilters((p) => ({ ...p, gender: 'groom' }))}
                  className={`py-2 rounded-lg font-bold text-xs ${
                    searchFilters.gender === 'groom'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🤵 {t('groom')}
                </button>
              </div>
            </div>
          )}

          {/* Occupation / Profession Dropdown (PRIMARY FILTER) */}
          <div className="p-3 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl space-y-2">
            <label className="block text-amber-300 font-black text-xs sm:text-sm">
              🔍 नोकरी / व्यवसाय / पद (Profession Filter):
            </label>
            <select
              value={searchFilters.occupation}
              onChange={(e) => setSearchFilters((p) => ({ ...p, occupation: e.target.value }))}
              className="w-full bg-slate-950 border-2 border-amber-500/50 rounded-xl px-3 py-2.5 text-white font-black text-xs outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              <option value="">-- सर्व नोकरी / व्यवसाय (All Profiles) --</option>
              <option value="govt">🏛️ सरकारी नोकरी / अधिकारी (Govt Job / MPSC / UPSC)</option>
              <option value="doctor">🩺 डॉक्टर / वैद्यकीय (Doctor / MBBS / BAMS / MD)</option>
              <option value="engineer">💻 इंजिनिअर / आयटी (Engineer / BE / B.Tech / Software)</option>
              <option value="teacher">👨‍🏫 शिक्षक / प्राध्यापक (Teacher / Professor)</option>
              <option value="business">🏢 व्यवसाय / उद्योग (Business / Contractor)</option>
              <option value="farmer">🌾 शेतकरी / कृषी (Farmer / Agriculture)</option>
              <option value="lawyer_ca">⚖️ वकील / सीए (Lawyer / Advocate / CA)</option>
              <option value="private">💼 कॉर्पोरेट / खाजगी नोकरी (Private Job)</option>
            </select>
          </div>

          {/* Age Range - Only if explicitly enabled by admin */}
          {siteConfig?.filterShowAge === true && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">किमान वय:</label>
                <select
                  value={searchFilters.minAge}
                  onChange={(e) =>
                    setSearchFilters((p) => ({ ...p, minAge: Number(e.target.value) }))
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                >
                  {Array.from({ length: 40 }, (_, i) => 18 + i).map((num) => (
                    <option key={num} value={num}>
                      {num} वर्ष
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">कमाल वय:</label>
                <select
                  value={searchFilters.maxAge}
                  onChange={(e) =>
                    setSearchFilters((p) => ({ ...p, maxAge: Number(e.target.value) }))
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                >
                  {Array.from({ length: 45 }, (_, i) => 25 + i).map((num) => (
                    <option key={num} value={num}>
                      {num} वर्ष
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* District */}
          {siteConfig?.filterShowDistrict !== false && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">{t('district')}</label>
              <select
                value={searchFilters.district}
                onChange={(e) => setSearchFilters((p) => ({ ...p, district: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
              >
                <option value="">-- {t('select_district')} --</option>
                {MAHARASHTRA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Education */}
          {siteConfig?.filterShowEducation !== false && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">{t('education')}</label>
              <input
                type="text"
                placeholder="उदा. M.Tech, MBBS, BE, MPSC, B.Sc, MBA..."
                value={searchFilters.education}
                onChange={(e) => setSearchFilters((p) => ({ ...p, education: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
              />
            </div>
          )}

          {/* Marital Status */}
          {siteConfig?.filterShowMaritalStatus !== false && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">{t('marital_status')}</label>
              <select
                value={searchFilters.maritalStatus}
                onChange={(e) => setSearchFilters((p) => ({ ...p, maritalStatus: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
              >
                <option value="">-- सर्व स्थिती --</option>
                <option value="never_married">{t('never_married')}</option>
                <option value="divorced">{t('divorced')}</option>
                <option value="widowed">{t('widowed')}</option>
              </select>
            </div>
          )}

          {/* Verified Checkbox */}
          {siteConfig?.filterShowVerified !== false && (
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  checked={searchFilters.verifiedOnly}
                  onChange={(e) =>
                    setSearchFilters((p) => ({ ...p, verifiedOnly: e.target.checked }))
                  }
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span className="font-semibold text-slate-200">
                  केवळ प्रमाणित (Verified Badged) प्रोफाईल दाखवा
                </span>
              </label>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>रीसेट</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>लागू करा ({language === 'mr' ? 'फिल्टर' : 'Apply Filters'})</span>
          </button>
        </div>

      </div>
    </div>
  );
};
