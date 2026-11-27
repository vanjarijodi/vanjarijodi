import React, { useState } from 'react';
import { X, Search, ShieldCheck, BookOpen, Users, Info, HeartHandshake } from 'lucide-react';
import { VANJARI_FOUR_DIVISIONS, VANJARI_KULI_LIST, VanjariKuliItem } from '../data/vanjariKuliData';

interface WadheBhauModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WadheBhauModal: React.FC<WadheBhauModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedKuli, setSelectedKuli] = useState<VanjariKuliItem | null>(null);

  if (!isOpen) return null;

  const filteredKulis = VANJARI_KULI_LIST.filter(item => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const matchesKuli = item.kuliName.toLowerCase().includes(term);
    const matchesGotra = item.gotra.toLowerCase().includes(term);
    const matchesVeda = item.veda.toLowerCase().includes(term);
    const matchesSurnames = item.surnames.some(s => s.toLowerCase().includes(term));
    return matchesKuli || matchesGotra || matchesVeda || matchesSurnames;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#800C1E] via-[#5C0815] to-[#3a030c] text-white rounded-3xl border border-amber-400/40 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-amber-400/30 bg-[#800C1E] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-[#800C1E] flex items-center justify-center font-black text-xl shadow-lg border border-amber-200 shrink-0">
              🚩
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-200 tracking-wide flex items-center gap-2">
                वंजारी जातकुळी, वंशावळ व वाढे भाऊ मार्गदर्शिका
              </h2>
              <p className="text-xs text-amber-100/90 font-medium">
                कुळी, वेद, गोत्र आणि सगोत्र उपनावे (वाढे भाऊ) सविस्तर माहिती
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-slate-100">
          
          {/* Banner: 4 Divisions */}
          <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-3.5 sm:p-4">
            <div className="flex items-center gap-2 text-amber-300 font-extrabold text-sm mb-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>वंजारी समाज ४ मुख्य विभागात विभागलेला आहे:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {VANJARI_FOUR_DIVISIONS.map(div => (
                <div 
                  key={div.code}
                  className="bg-[#800C1E]/80 border border-amber-400/40 rounded-xl px-3 py-2 text-center text-xs font-bold text-amber-200 shadow-sm"
                >
                  ✅ {div.name}
                </div>
              ))}
            </div>
          </div>

          {/* Info Banner on Wadhe Bhau */}
          <div className="bg-white/5 border border-amber-300/20 rounded-2xl p-3.5 text-xs text-amber-100 space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>वाढे भाऊ (सगोत्र उपनावे) म्हणजे काय?</span>
            </div>
            <p className="text-slate-200">
              वंजारी परंपरेनुसार एकाच कुळीतील आणि एकाच गोत्रातील विविध उपनावे ही एकमेकांची <strong>'वाढे भाऊ'</strong> मानली जातात. एकाच कुळीतील उपनावांमध्ये आपसात विवाह जुळवला जात नाही. खालील यादीत तुमचे आडनाव शोधून तुमची कुळी, वेद, गोत्र व वाढे भाऊ पाहा.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-300" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="तुमचे आडनाव, कुळी किंवा गोत्र शोधा (उदा. सानप, मुंडे, आंधळे, कश्यप)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-amber-400/40 rounded-xl text-xs sm:text-sm text-white placeholder-amber-200/50 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Kuli Cards List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300 px-1">
              <span>एकूण कुळी नोंदी: {filteredKulis.length}</span>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="text-amber-200 hover:underline cursor-pointer"
                >
                  क्लियर शोध
                </button>
              )}
            </div>

            {filteredKulis.length === 0 ? (
              <div className="text-center py-8 bg-slate-900/50 rounded-2xl border border-amber-400/20 text-slate-300 text-xs">
                '<strong>{searchTerm}</strong>' या शोधासाठी कोणतीही नोंद सापडली नाही. कृपया स्पेलिंग तपासा.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredKulis.map((kuli) => {
                  const isHighlighted = searchTerm && (
                    kuli.surnames.some(s => s.toLowerCase().includes(searchTerm.toLowerCase().trim())) ||
                    kuli.kuliName.toLowerCase().includes(searchTerm.toLowerCase().trim())
                  );

                  return (
                    <div
                      key={kuli.id}
                      className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                        isHighlighted 
                          ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 shadow-lg' 
                          : 'bg-slate-900/70 border-amber-400/25 hover:border-amber-400/60'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Kuli Title */}
                        <div className="flex items-start justify-between gap-2 border-b border-amber-400/20 pb-2">
                          <h3 className="font-extrabold text-sm text-amber-200 flex items-center gap-1.5">
                            <span className="text-amber-400">🚩</span> {kuli.kuliName}
                          </h3>
                        </div>

                        {/* Veda & Gotra */}
                        <div className="flex flex-wrap gap-2 text-xs font-medium">
                          <span className="bg-amber-400/10 text-amber-200 border border-amber-400/30 px-2.5 py-0.5 rounded-lg">
                            📖 वेद: <strong className="text-white">{kuli.veda}</strong>
                          </span>
                          <span className="bg-amber-400/10 text-amber-200 border border-amber-400/30 px-2.5 py-0.5 rounded-lg">
                            🔱 गोत्र: <strong className="text-white">{kuli.gotra}</strong>
                          </span>
                        </div>

                        {/* Surnames / Wadhe Bhau */}
                        <div className="pt-1">
                          <span className="text-[11px] font-bold text-amber-300/90 block mb-1">
                            वाढे भाऊ उपनावे ({kuli.surnames.length}):
                          </span>
                          <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-1.5 bg-black/30 rounded-xl border border-white/5 text-xs">
                            {kuli.surnames.map((sur, idx) => {
                              const match = searchTerm && sur.toLowerCase().includes(searchTerm.toLowerCase().trim());
                              return (
                                <span
                                  key={idx}
                                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                                    match 
                                      ? 'bg-amber-400 text-slate-950 font-extrabold scale-105' 
                                      : 'bg-amber-950/60 text-amber-100 border border-amber-400/20'
                                  }`}
                                >
                                  {sur}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-[#800C1E] border-t border-amber-400/30 flex items-center justify-between text-xs text-amber-200 shrink-0">
          <div className="flex items-center gap-1.5 font-bold">
            <HeartHandshake className="w-4 h-4 text-amber-400" />
            <span>॥ जय भगवान बाबा ॥</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-[#800C1E] font-extrabold rounded-xl hover:from-amber-300 hover:to-amber-400 transition cursor-pointer shadow-md"
          >
            बंद करा
          </button>
        </div>

      </div>
    </div>
  );
};
