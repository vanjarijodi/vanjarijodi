import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import {
  calculateAshtakootMilan,
  KundaliMilanResult,
  RASHIS_LIST,
  NAKSHATRAS_LIST,
} from '../utils/kundaliCalculator';
import {
  X,
  Sparkles,
  Scroll,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Heart,
  ChevronDown,
  ChevronUp,
  Info,
  Printer,
  Share2,
} from 'lucide-react';

interface KundaliMilanModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateProfile?: UserProfile | null;
}

export const KundaliMilanModal: React.FC<KundaliMilanModalProps> = ({
  isOpen,
  onClose,
  candidateProfile,
}) => {
  const { currentUser, profiles } = useApp();

  // Determine Groom & Bride initial values based on gender
  const isCandidateBride = candidateProfile?.gender === 'bride';

  const [groomName, setGroomName] = useState(
    isCandidateBride ? currentUser?.fullName || 'वर (Groom)' : candidateProfile?.fullName || 'वर (Groom)'
  );
  const [groomRashi, setGroomRashi] = useState(
    isCandidateBride ? currentUser?.rashi || 'मकर (Capricorn)' : candidateProfile?.rashi || 'मकर (Capricorn)'
  );
  const [groomNakshatra, setGroomNakshatra] = useState(
    isCandidateBride ? currentUser?.nakshatra || 'श्रवण (Shravana)' : candidateProfile?.nakshatra || 'श्रवण (Shravana)'
  );
  const [groomGan, setGroomGan] = useState(
    isCandidateBride ? currentUser?.gan || 'देव गण' : candidateProfile?.gan || 'देव गण'
  );
  const [groomNadi, setGroomNadi] = useState(
    isCandidateBride ? currentUser?.nadi || 'अंत्य नाडी' : candidateProfile?.nadi || 'अंत्य नाडी'
  );
  const [groomManglik, setGroomManglik] = useState<'non_manglik' | 'manglik'>(
    (isCandidateBride ? currentUser?.horoscopeManglik : candidateProfile?.horoscopeManglik) === 'manglik'
      ? 'manglik'
      : 'non_manglik'
  );

  const [brideName, setBrideName] = useState(
    isCandidateBride ? candidateProfile?.fullName || 'वधू (Bride)' : currentUser?.fullName || 'वधू (Bride)'
  );
  const [brideRashi, setBrideRashi] = useState(
    isCandidateBride ? candidateProfile?.rashi || 'वृषभ (Taurus)' : currentUser?.rashi || 'वृषभ (Taurus)'
  );
  const [brideNakshatra, setBrideNakshatra] = useState(
    isCandidateBride ? candidateProfile?.nakshatra || 'रोहिणी (Rohini)' : currentUser?.nakshatra || 'रोहिणी (Rohini)'
  );
  const [brideGan, setBrideGan] = useState(
    isCandidateBride ? candidateProfile?.gan || 'मनुष्य गण' : currentUser?.gan || 'मनुष्य गण'
  );
  const [brideNadi, setBrideNadi] = useState(
    isCandidateBride ? candidateProfile?.nadi || 'मध्य नाडी' : currentUser?.nadi || 'मध्य नाडी'
  );
  const [brideManglik, setBrideManglik] = useState<'non_manglik' | 'manglik'>(
    (isCandidateBride ? candidateProfile?.horoscopeManglik : currentUser?.horoscopeManglik) === 'manglik'
      ? 'manglik'
      : 'non_manglik'
  );

  const [expandedKootaIndex, setExpandedKootaIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const result: KundaliMilanResult = calculateAshtakootMilan(
    {
      rashi: groomRashi,
      nakshatra: groomNakshatra,
      gan: groomGan,
      nadi: groomNadi,
      isManglik: groomManglik,
    },
    {
      rashi: brideRashi,
      nakshatra: brideNakshatra,
      gan: brideGan,
      nadi: brideNadi,
      isManglik: brideManglik,
    }
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FFFDF9] w-full max-w-4xl rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] text-white p-4 sm:p-5 flex items-center justify-between shadow-md border-b border-amber-300/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-amber-100 flex items-center gap-2">
                <span>वैदिक ३६ गुणमेलन व कुंडली पत्रिका जुळवणी</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full font-mono">
                  Ashtakoot Milan
                </span>
              </h2>
              <p className="text-xs text-amber-200/90 font-medium">
                अष्टकूट पद्धतीनुसार वर आणि वधू यांच्या पत्रिकांचे सविस्तर गुण विश्लेषण
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="बंद करा"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Important Astrological Disclaimer / महत्त्वाची सूचना */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300/90 rounded-2xl p-4 shadow-xs space-y-2">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs sm:text-sm font-black text-[#800C1E] flex items-center gap-1.5">
                  <span>⚠️ महत्त्वाची सूचना व मार्गदर्शन (Astrological Disclaimer):</span>
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium mt-1">
                  हे गुणमेलन संगणकीय व सामान्य ज्योतिषीय नियमांवर (अष्टकूट पद्धती) आधारित आहे. हे अंतिम किंवा १००% अचूक असेलच असे नाही. विवाह निश्चित करण्यापूर्वी कुंडलीतील प्रत्यक्ष ग्रहांची स्थिती, महादशा-अंतर्दशा, गुरु-शुक्र बल, पापकर्तरी योग आणि प्रत्यक्ष मंगळ/नाडी दोष निवारणासाठी <strong>आपल्या कुलज्योतिषी किंवा अनुभवी ज्योतिषांचा प्रत्यक्ष सल्ला अवश्य घ्यावा.</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Details Inputs (Groom & Bride) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Groom Details Card */}
            <div className="bg-gradient-to-br from-amber-50/70 to-white rounded-2xl p-4 border-2 border-amber-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🤵</span>
                  <h3 className="font-black text-sm text-[#800C1E]">वर तपशील (Groom's Kundali)</h3>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                  {groomName}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">राशी (Rashi)</label>
                  <select
                    value={groomRashi}
                    onChange={(e) => setGroomRashi(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-[#800C1E]"
                  >
                    {RASHIS_LIST.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">नक्षत्र (Nakshatra)</label>
                  <select
                    value={groomNakshatra}
                    onChange={(e) => setGroomNakshatra(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-[#800C1E]"
                  >
                    {NAKSHATRAS_LIST.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">गण (Gan)</label>
                  <select
                    value={groomGan}
                    onChange={(e) => setGroomGan(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-[#800C1E]"
                  >
                    <option value="देव गण">देव गण</option>
                    <option value="मनुष्य गण">मनुष्य गण</option>
                    <option value="राक्षस गण">राक्षस गण</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">नाडी (Nadi)</label>
                  <select
                    value={groomNadi}
                    onChange={(e) => setGroomNadi(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-[#800C1E]"
                  >
                    <option value="आद्य नाडी">आद्य नाडी</option>
                    <option value="मध्य नाडी">मध्य नाडी</option>
                    <option value="अंत्य नाडी">अंत्य नाडी</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">मांगलिक पत्रिका</label>
                  <select
                    value={groomManglik}
                    onChange={(e) => setGroomManglik(e.target.value as 'non_manglik' | 'manglik')}
                    className="w-full p-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-[#800C1E]"
                  >
                    <option value="non_manglik">निर्दोष (Non-Manglik)</option>
                    <option value="manglik">मांगलिक (Manglik)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bride Details Card */}
            <div className="bg-gradient-to-br from-rose-50/50 to-white rounded-2xl p-4 border-2 border-rose-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-rose-200">
                <div className="flex items-center gap-2">
                  <span className="text-xl">👰</span>
                  <h3 className="font-black text-sm text-[#800C1E]">वधू तपशील (Bride's Kundali)</h3>
                </div>
                <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md">
                  {brideName}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">राशी (Rashi)</label>
                  <select
                    value={brideRashi}
                    onChange={(e) => setBrideRashi(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-[#800C1E]"
                  >
                    {RASHIS_LIST.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">नक्षत्र (Nakshatra)</label>
                  <select
                    value={brideNakshatra}
                    onChange={(e) => setBrideNakshatra(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-[#800C1E]"
                  >
                    {NAKSHATRAS_LIST.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">गण (Gan)</label>
                  <select
                    value={brideGan}
                    onChange={(e) => setBrideGan(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-[#800C1E]"
                  >
                    <option value="देव गण">देव गण</option>
                    <option value="मनुष्य गण">मनुष्य गण</option>
                    <option value="राक्षस गण">राक्षस गण</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">नाडी (Nadi)</label>
                  <select
                    value={brideNadi}
                    onChange={(e) => setBrideNadi(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-[#800C1E]"
                  >
                    <option value="आद्य नाडी">आद्य नाडी</option>
                    <option value="मध्य नाडी">मध्य नाडी</option>
                    <option value="अंत्य नाडी">अंत्य नाडी</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">मांगलिक पत्रिका</label>
                  <select
                    value={brideManglik}
                    onChange={(e) => setBrideManglik(e.target.value as 'non_manglik' | 'manglik')}
                    className="w-full p-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-[#800C1E]"
                  >
                    <option value="non_manglik">निर्दोष (Non-Manglik)</option>
                    <option value="manglik">मांगलिक (Manglik)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Grand Score Display Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-[#800C1E] to-slate-950 rounded-3xl p-6 text-white shadow-xl border-2 border-amber-400/40 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/15">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>एकूण अष्टकूट गुणमेलन निकाल</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 justify-center sm:justify-start">
                  <span>{result.compatibilityVerdict}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 max-w-xl font-medium">
                  {result.recommendationMr}
                </p>
              </div>

              {/* Big Score Gauge */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border-2 border-amber-300/40 flex flex-col items-center justify-center min-w-[160px] shadow-inner text-center">
                <span className="text-[11px] font-bold text-amber-200 uppercase tracking-wider">प्राप्त गुण (Score)</span>
                <div className="text-4xl sm:text-5xl font-black text-amber-300 font-mono my-1 drop-shadow">
                  {result.totalScore}
                  <span className="text-xl text-white/70">/३६</span>
                </div>
                <span className="text-xs font-bold bg-amber-400 text-slate-950 px-3 py-0.5 rounded-full font-mono shadow-xs">
                  {result.percentage}% जुळवणी
                </span>
              </div>
            </div>
          </div>

          {/* Important Vedic Astrology Disclaimer & Advisory Notice */}
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-start gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              <Info className="w-5 h-5 text-[#800C1E]" />
            </div>
            <div className="space-y-1">
              <h5 className="text-xs sm:text-sm font-black text-[#800C1E] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>महत्त्वाची सूचना (Important Astrological Advisory)</span>
              </h5>
              <p className="text-[11px] sm:text-xs text-slate-700 leading-relaxed font-medium">
                हे ३६ गुणमेलन वैदिक अष्टकूट नियमांवर आधारित संगणकीय (अल्गोरिदम) अंदाजित विश्लेषण आहे. हे गुण १००% तंतोतंत बरोबरच असतील असे नाही, कारण प्रत्यक्ष विवाह ठरवताना वर-वधूचे स्वभाव, शिक्षण, संस्कार, विचार आणि कौटुंबिक समजूतदारपणा हे सर्वात महत्त्वाचे असतात. अंतिम निर्णयापूर्वी आपल्या अनुभवी ज्योतिषी किंवा गुरुजींचा प्रत्यक्ष सल्ला घ्यावा.
              </p>
            </div>
          </div>

          {/* Dosha Analysis Cards (Nadi, Bhakoot, Gana & Manglik) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Nadi Dosha */}
            <div
              className={`p-3.5 rounded-2xl border-2 transition ${
                result.doshaAnalysis.nadiDosha.present
                  ? 'bg-rose-50 border-rose-300'
                  : 'bg-emerald-50 border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-900">नाडी विचार (Nadi)</span>
                {result.doshaAnalysis.nadiDosha.present ? (
                  <span className="px-2 py-0.5 bg-rose-200 text-rose-900 font-bold text-[10px] rounded-full">
                    दोष संभवतो
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 font-bold text-[10px] rounded-full flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    निर्दोष
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-700 leading-snug font-medium">
                {result.doshaAnalysis.nadiDosha.descriptionMr}
              </p>
            </div>

            {/* Bhakoot Dosha */}
            <div
              className={`p-3.5 rounded-2xl border-2 transition ${
                result.doshaAnalysis.bhakootDosha.present
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-emerald-50 border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-900">भकूट विचार (Bhakoot)</span>
                {result.doshaAnalysis.bhakootDosha.present ? (
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-bold text-[10px] rounded-full">
                    भकूट फरक
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 font-bold text-[10px] rounded-full flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    अनुकूल
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-700 leading-snug font-medium">
                {result.doshaAnalysis.bhakootDosha.descriptionMr}
              </p>
            </div>

            {/* Gana Dosha */}
            <div
              className={`p-3.5 rounded-2xl border-2 transition ${
                result.doshaAnalysis.ganaDosha.present
                  ? 'bg-rose-50 border-rose-300'
                  : 'bg-emerald-50 border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-900">गण विचार (Gana)</span>
                {result.doshaAnalysis.ganaDosha.present ? (
                  <span className="px-2 py-0.5 bg-rose-200 text-rose-900 font-bold text-[10px] rounded-full">
                    गण दोष
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 font-bold text-[10px] rounded-full flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    उत्तम मेळ
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-700 leading-snug font-medium">
                {result.doshaAnalysis.ganaDosha.descriptionMr}
              </p>
            </div>

            {/* Manglik Match */}
            <div
              className={`p-3.5 rounded-2xl border-2 transition ${
                result.doshaAnalysis.manglikCompatibility.compatible
                  ? 'bg-emerald-50 border-emerald-300'
                  : 'bg-amber-50 border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-900">मंगळ पत्रिका (Manglik)</span>
                {result.doshaAnalysis.manglikCompatibility.compatible ? (
                  <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 font-bold text-[10px] rounded-full flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    जुळते
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-bold text-[10px] rounded-full">
                    सल्ला घ्यावा
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-700 leading-snug font-medium">
                {result.doshaAnalysis.manglikCompatibility.statusMr}
              </p>
            </div>
          </div>

          {/* 8 Kootas Detailed Table / Accordion */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-amber-200 shadow-sm space-y-3">
            <h4 className="text-sm sm:text-base font-bold text-[#800C1E] flex items-center justify-between">
              <span>📊 अष्टकूट ८ घटकांचे सविस्तर गुण विश्लेषण (Detailed 8 Koota Points)</span>
              <span className="text-xs text-slate-500 font-normal">३६ पैकी मिळालेले गुण</span>
            </h4>

            <div className="divide-y divide-slate-200">
              {result.kootaBreakdown.map((koota, idx) => {
                const isExpanded = expandedKootaIndex === idx;
                const pct = (koota.obtainedScore / koota.maxScore) * 100;
                return (
                  <div key={koota.name} className="py-3 space-y-2">
                    <div
                      onClick={() => setExpandedKootaIndex(isExpanded ? null : idx)}
                      className="flex items-center justify-between cursor-pointer hover:bg-amber-50/50 p-2 rounded-xl transition"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-full bg-[#800C1E]/10 text-[#800C1E] font-mono font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">
                            {koota.nameMr}
                          </div>
                          <div className="text-[10px] text-slate-500">{koota.description}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <span className="font-mono font-black text-sm text-slate-900">
                            {koota.obtainedScore}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">/{koota.maxScore}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                    </div>

                    {/* Progress meter bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="p-3 bg-amber-50/80 rounded-xl text-xs text-slate-700 border border-amber-200">
                        <p className="font-semibold">{koota.descriptionMr}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-amber-50/80 border-t border-amber-200 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
            वंजारी जोडी (VanjariJodi.com) - अस्सल मराठमोळे विवाह व्यासपीठ
          </div>

          <div className="flex items-center space-x-2 ml-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>प्रिंट / सेव्ह अहवाल</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-[#800C1E] hover:bg-[#A71930] text-white rounded-xl text-xs font-bold transition shadow cursor-pointer"
            >
              बंद करा
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
