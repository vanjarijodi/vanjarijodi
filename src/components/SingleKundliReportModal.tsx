import React, { useState, useEffect } from 'react';
import { SingleKundliInput, NormalizedSingleKundliReport } from '../types';
import { SingleKundliForm } from './SingleKundliForm';
import { KundliChartGrid } from './KundliChartGrid';
import { downloadSingleKundliPdfReport } from '../utils/singleKundliPdfGenerator';
import { generateClientSingleKundli } from '../utils/singleKundliCalculator';
import { useModalScrollLock } from '../hooks/useModalScrollLock';
import {
  X,
  Sparkles,
  Download,
  Share2,
  RefreshCw,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Compass,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Award,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SingleKundliReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReportId?: string;
}

export const SingleKundliReportModal: React.FC<SingleKundliReportModalProps> = ({
  isOpen,
  onClose,
  initialReportId,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'report'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [report, setReport] = useState<NormalizedSingleKundliReport | null>(null);

  // Expanded card state for mobile readability
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    planets: true,
    charts: true,
    dasha: true,
    manglik: true,
    yogas: true,
  });

  const [isPdfDownloading, setIsPdfDownloading] = useState(false);

  // LocalStorage Key for Caching Reports
  const STORAGE_KEY = 'vj_single_kundli_reports';

  // Helper to load report from LocalStorage or URL
  const loadSavedReport = (reportId?: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored) as Record<string, NormalizedSingleKundliReport>;
      let targetReport: NormalizedSingleKundliReport | null = null;
      if (reportId && parsed[reportId]) {
        targetReport = parsed[reportId];
      } else {
        // Return most recent report
        const keys = Object.keys(parsed);
        if (keys.length > 0) {
          targetReport = parsed[keys[keys.length - 1]];
        }
      }
      
      // Basic sanity check to ensure loaded report has required schema
      if (targetReport && targetReport.astroDetails && targetReport.birthDetails) {
        return targetReport;
      }
    } catch (e) {
      console.error('Error loading saved Kundli report:', e);
    }
    return null;
  };

  // Sync state on open or reportId change
  useEffect(() => {
    if (!isOpen) return;

    // Check URL query param e.g. ?kundliId=VJ-KUNDLI-xxx
    const urlParams = new URLSearchParams(window.location.search);
    const qId = initialReportId || urlParams.get('kundliId');

    const saved = loadSavedReport(qId || undefined);
    if (saved) {
      setReport(saved);
      setActiveTab('report');
    } else {
      setActiveTab('form');
    }
  }, [isOpen, initialReportId]);

  // Handle URL history state for Back button support
  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      if (!params.get('kundliId') && report) {
        setActiveTab('form');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen, report]);

  if (!isOpen) return null;

  // Save report to localStorage and update URL
  const saveReportToStorage = (newReport: NormalizedSingleKundliReport) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      parsed[newReport.id] = newReport;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));

      // Push state to browser URL without re-rendering
      const url = new URL(window.location.href);
      url.searchParams.set('kundliId', newReport.id);
      window.history.pushState({ kundliId: newReport.id }, '', url.toString());
    } catch (e) {
      console.error('Failed to store Kundli report:', e);
    }
  };

  // Submit Birth Form to API or Client-Side Engine
  const handleFormSubmit = async (input: SingleKundliInput) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      let generatedReport: NormalizedSingleKundliReport | null = null;

      try {
        const response = await fetch('/api/astrology/single-kundli', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          const resData = await response.json();
          if (resData.success && resData.report) {
            generatedReport = resData.report;
          }
        }
      } catch (networkOrJsonErr) {
        console.warn('Backend API request for Single Kundli not available, switching to Vedic Engine:', networkOrJsonErr);
      }

      // If backend was not reached or returned non-JSON/offline/error, run client engine
      if (!generatedReport) {
        generatedReport = generateClientSingleKundli(input);
      }

      if (generatedReport) {
        setReport(generatedReport);
        saveReportToStorage(generatedReport);
        setActiveTab('report');
      } else {
        throw new Error('अहवाल तयार होऊ शकला नाही. कृपया माहिती पुन्हा तपासा.');
      }
    } catch (err: any) {
      console.error('Single Kundli Submit Error:', err);
      // Fallback guarantees calculation
      const fallbackReport = generateClientSingleKundli(input);
      setReport(fallbackReport);
      saveReportToStorage(fallbackReport);
      setActiveTab('report');
      setErrorMsg(null);
    } finally {
      setIsLoading(false);
    }
  };

  // PDF Download Trigger
  const handleDownloadPdf = async () => {
    if (!report) return;
    setIsPdfDownloading(true);
    try {
      await downloadSingleKundliPdfReport(report);
    } catch (err) {
      console.error('Pdf download failed:', err);
    } finally {
      setIsPdfDownloading(false);
    }
  };

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useModalScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-hidden pt-safe pb-safe animate-fade-in">
      <div className="relative w-full h-full sm:h-auto max-w-4xl bg-[#FFFDF8] rounded-none md:rounded-3xl shadow-2xl border-0 md:border-2 border-amber-300/80 sm:my-auto overflow-hidden flex flex-col max-h-none sm:max-h-[92vh]">
        {/* Header Modal Bar */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] text-white px-4 md:px-6 py-3.5 flex items-center justify-between border-b-2 border-amber-400/80 shadow-lg shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-400/20 border border-amber-300/50 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-black text-amber-200 tracking-tight leading-tight">
                🔮 संपूर्ण वैदिक जन्मपत्रिका अहवाल (Kundli Report)
              </h2>
              <p className="text-[11px] text-amber-100/90 font-medium hidden sm:block">
                AstrologyAPI.com & Prokerala API v2 | लाहिरी अयनांश पद्धती
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-amber-100 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-amber-100/60 px-4 py-2 flex items-center justify-between border-b border-amber-200/80 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'form'
                  ? 'bg-[#800C1E] text-white shadow-md'
                  : 'bg-white/80 text-slate-700 hover:bg-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>१. जन्म माहिती फॉर्म</span>
            </button>

            {report && (
              <button
                onClick={() => setActiveTab('report')}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeTab === 'report'
                    ? 'bg-[#800C1E] text-white shadow-md'
                    : 'bg-white/80 text-slate-700 hover:bg-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>२. जन्मपत्रिका अहवाल</span>
              </button>
            )}
          </div>

          {report && activeTab === 'report' && (
            <button
              onClick={handleDownloadPdf}
              disabled={isPdfDownloading}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isPdfDownloading ? 'डाउनलोड होत आहे...' : 'PDF डाउनलोड'}
              </span>
            </button>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs md:text-sm font-black flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: FORM */}
          {activeTab === 'form' && (
            <SingleKundliForm
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              initialValues={
                report
                  ? {
                      fullName: report.birthDetails.fullName,
                      gender: report.birthDetails.gender,
                      dob: report.birthDetails.dob,
                      time: report.birthDetails.time,
                      city: report.birthDetails.city,
                      latitude: report.birthDetails.latitude,
                      longitude: report.birthDetails.longitude,
                      timezone: report.birthDetails.timezone,
                    }
                  : undefined
              }
            />
          )}

          {/* TAB 2: REPORT */}
          {activeTab === 'report' && report && (
            <div className="space-y-6">
              {/* Report Title & Action Banner */}
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-100/40 to-amber-500/10 rounded-2xl p-4 border border-amber-300/80 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div>
                  <div className="text-xs font-black text-amber-800 uppercase tracking-widest mb-0.5">
                    वैदिक जन्मपत्रिका अहवाल आयडी: {report.id}
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-[#800C1E]">
                    {report.birthDetails.fullName}
                  </h3>
                  <p className="text-xs text-slate-600 font-bold mt-0.5">
                    जन्मतारीख: {report.birthDetails.dob} | वेळ: {report.birthDetails.time} | स्थान: {report.birthDetails.birthPlace}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isPdfDownloading}
                    className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isPdfDownloading ? 'तयार होत आहे...' : 'PDF डाउनलोड'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('form')}
                    className="px-4 py-2.5 rounded-xl bg-white border border-amber-300 text-[#800C1E] font-black text-xs hover:bg-amber-50 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">नवीन कुंडली</span>
                  </button>
                </div>
              </div>

              {/* 3-Engine Live Comparison Matrix */}
              {report.multiEngineResults && (
                <div className="bg-gradient-to-br from-amber-50/90 via-white to-orange-50/80 rounded-2xl p-4 md:p-5 border-2 border-amber-300 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔬</span>
                      <h4 className="font-black text-sm text-[#800C1E]">
                        तिन्ही इंजिन स्वतंत्र कुंडली विश्लेषण (3-Engine Single Kundli Analysis)
                      </h4>
                    </div>
                    <span className="text-[10px] bg-[#800C1E] text-white px-2.5 py-0.5 rounded-full font-bold">
                      चाचणी मोड सक्रिय (Trial Comparison)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Engine 1: Navamsha */}
                    <div className="p-3 bg-emerald-50/80 border-2 border-emerald-300 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-950">इंजिन १: Navamsha.in</span>
                        <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1 py-0.5 rounded font-bold">Active Key</span>
                      </div>
                      <div className="text-xs font-bold text-slate-800">
                        लग्न: <strong className="text-emerald-800">{report.multiEngineResults?.engine1?.astroDetails?.ascendantLagna || report.astroDetails?.ascendantLagna || 'उपलब्ध'}</strong>
                      </div>
                      <div className="text-xs font-bold text-slate-800">
                        रास: {report.multiEngineResults?.engine1?.astroDetails?.rashi || report.astroDetails?.rashi || 'उपलब्ध'} • नक्षत्र: {report.multiEngineResults?.engine1?.astroDetails?.nakshatra || report.astroDetails?.nakshatra || 'उपलब्ध'}
                      </div>
                      <div className="text-[10px] text-slate-600 border-t border-emerald-200 pt-1">
                        दशा: {report.multiEngineResults?.engine1?.vimsottariDasha?.currentMahadasha || report.vimsottariDasha?.currentMahadasha || 'चालू'} महादशा
                      </div>
                    </div>

                    {/* Engine 2: Prokerala */}
                    <div className="p-3 bg-blue-50/80 border-2 border-blue-300 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-blue-950">इंजिन २: Prokerala API v2</span>
                        <span className="text-[9px] bg-blue-200 text-blue-900 px-1 py-0.5 rounded font-bold">Official API</span>
                      </div>
                      <div className="text-xs font-bold text-slate-800">
                        लग्न: <strong className="text-blue-800">{report.multiEngineResults?.engine2?.astroDetails?.ascendantLagna || report.astroDetails?.ascendantLagna || 'उपलब्ध'}</strong>
                      </div>
                      <div className="text-xs font-bold text-slate-800">
                        रास: {report.multiEngineResults?.engine2?.astroDetails?.rashi || report.astroDetails?.rashi || 'उपलब्ध'} • नक्षत्र: {report.multiEngineResults?.engine2?.astroDetails?.nakshatra || report.astroDetails?.nakshatra || 'उपलब्ध'}
                      </div>
                      <div className="text-[10px] text-slate-600 border-t border-blue-200 pt-1">
                        दशा: {report.multiEngineResults?.engine2?.vimsottariDasha?.currentMahadasha || report.vimsottariDasha?.currentMahadasha || 'चालू'} महादशा
                      </div>
                    </div>

                    {/* Engine 3: AstrologyAPI */}
                    <div className="p-3 bg-orange-50/80 border-2 border-orange-300 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-orange-950">इंजिन ३: AstrologyAPI</span>
                        <span className="text-[9px] bg-orange-200 text-orange-900 px-1 py-0.5 rounded font-bold">Vedic Engine</span>
                      </div>
                      <div className="text-xs font-bold text-slate-800">
                        लग्न: <strong className="text-orange-800">{report.multiEngineResults?.engine3?.astroDetails?.ascendantLagna || report.astroDetails?.ascendantLagna || 'उपलब्ध'}</strong>
                      </div>
                      <div className="text-xs font-bold text-slate-800">
                        रास: {report.multiEngineResults?.engine3?.astroDetails?.rashi || report.astroDetails?.rashi || 'उपलब्ध'} • नक्षत्र: {report.multiEngineResults?.engine3?.astroDetails?.nakshatra || report.astroDetails?.nakshatra || 'उपलब्ध'}
                      </div>
                      <div className="text-[10px] text-slate-600 border-t border-orange-200 pt-1">
                        दशा: {report.multiEngineResults?.engine3?.vimsottariDasha?.currentMahadasha || report.vimsottariDasha?.currentMahadasha || 'चालू'} महादशा
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 bg-amber-100/70 p-2 rounded-xl border border-amber-200 font-medium">
                    💡 <strong>तुलनात्मक टीप:</strong> वरील तिन्ही इंजिन्सचा स्वतंत्र तपशील खालील <strong>"PDF डाउनलोड"</strong> बटनावर क्लिक केल्यास एका खाली एक व्यवस्थित पीडीएफ स्वरूपात मिळेल.
                  </p>
                </div>
              )}

              {/* SECTION 1: BIRTH & VEDIC AVAKAHADA CHAKRA */}
              <div className="bg-white rounded-2xl p-4 md:p-6 border border-amber-200/80 shadow-md space-y-4">
                <h4 className="text-base md:text-lg font-black text-[#800C1E] flex items-center gap-2 border-b border-amber-200 pb-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  <span>१. जन्म माहिती व अवकहडा चक्र (Birth & Vedic Profile)</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
                    <span className="text-[10px] font-black text-amber-800 uppercase block">लग्न रास (Lagna)</span>
                    <strong className="text-sm font-extrabold text-[#800C1E]">{report.astroDetails?.ascendantLagna || 'उपलब्ध'}</strong>
                  </div>

                  <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
                    <span className="text-[10px] font-black text-amber-800 uppercase block">चंद्र राशी (Moon Sign)</span>
                    <strong className="text-sm font-extrabold text-slate-800">{report.astroDetails?.rashi || 'उपलब्ध'} {report.astroDetails?.rashiLord ? `(${report.astroDetails.rashiLord})` : ''}</strong>
                  </div>

                  <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
                    <span className="text-[10px] font-black text-amber-800 uppercase block">सूर्य राशी (Sun Sign)</span>
                    <strong className="text-sm font-extrabold text-slate-800">{report.astroDetails?.sunSign || 'उपलब्ध'}</strong>
                  </div>

                  <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
                    <span className="text-[10px] font-black text-amber-800 uppercase block">नक्षत्र व चरण (Pada)</span>
                    <strong className="text-sm font-extrabold text-slate-800">{report.astroDetails?.nakshatra || 'उपलब्ध'} (चरण {report.astroDetails?.pada || 1})</strong>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block">गण (Gana)</span>
                    <span className="font-extrabold text-slate-800">{report.astroDetails?.gan || 'मनुष्य गण'}</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block">नाडी (Nadi)</span>
                    <span className="font-extrabold text-slate-800">{report.astroDetails?.nadi || 'मध्य नाडी'}</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block">वर्ण व वश्य</span>
                    <span className="font-extrabold text-slate-800">{report.astroDetails?.varna || 'वैश्य'} / {report.astroDetails?.vashya || 'मानव'}</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block">योनी व पाया</span>
                    <span className="font-extrabold text-slate-800">{report.astroDetails?.yoni || 'अश्व'} / {report.astroDetails?.payas || 'सुवर्ण'}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: KUNDLI CHARTS GRID (D1 & D9) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <KundliChartGrid
                  title="लग्न कुंडली (D1 Chart)"
                  subtitle="राशी व भाव स्थान"
                  chartData={report.chartData?.lagnaChart || []}
                />
                {report.chartData?.navamshaChart && (
                  <KundliChartGrid
                    title="नवमांश कुंडली (D9 Chart)"
                    subtitle="सूक्ष्म ग्रहबल व भाग्यस्थान"
                    chartData={report.chartData.navamshaChart}
                  />
                )}
              </div>

              {/* SECTION 3: PLANET POSITIONS TABLE */}
              <div className="bg-white rounded-2xl p-4 md:p-6 border border-amber-200/80 shadow-md space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <h4 className="text-base md:text-lg font-black text-[#800C1E] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-600" />
                    <span>३. नवग्रह परिस्थिती व भाव कोष्टक (Planet Positions)</span>
                  </h4>
                  <button
                    onClick={() => toggleSection('planets')}
                    className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
                  >
                    {expandedSections.planets ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {expandedSections.planets && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-medium border-collapse min-w-[500px]">
                      <thead>
                        <tr className="bg-amber-50 text-amber-900 font-black border-b border-amber-200">
                          <th className="p-2.5">ग्रह (Planet)</th>
                          <th className="p-2.5">रास (Sign)</th>
                          <th className="p-2.5">अंश (Degree)</th>
                          <th className="p-2.5">भाव (House)</th>
                          <th className="p-2.5">नक्षत्र (Nakshatra)</th>
                          <th className="p-2.5">स्थिती</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(report.planets || []).map((p, idx) => (
                          <tr key={`pl-${idx}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                            <td className="p-2.5 font-extrabold text-[#800C1E]">
                              {p.nameMr} <span className="text-[10px] text-slate-400 font-mono">({p.name})</span>
                            </td>
                            <td className="p-2.5 font-bold text-slate-800">
                              {p.rashiMr} <span className="text-[10px] text-amber-800">({p.rashiLord})</span>
                            </td>
                            <td className="p-2.5 font-mono text-sky-700 font-bold">
                              {p.degreeFormatted}
                            </td>
                            <td className="p-2.5 font-black text-center text-slate-800">
                              {p.house}
                            </td>
                            <td className="p-2.5 font-medium text-slate-700">
                              {p.nakshatra} <span className="text-[10px] text-slate-400">(पद्म {p.pada})</span>
                            </td>
                            <td className="p-2.5 font-bold">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                p.isRetrograde ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {p.isRetrograde ? 'वक्री' : 'मार्गी'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* SECTION 4: VIMSHOTTARI DASHA */}
              <div className="bg-white rounded-2xl p-4 md:p-6 border border-amber-200/80 shadow-md space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <h4 className="text-base md:text-lg font-black text-[#800C1E] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <span>४. विंशोत्तरी महादशा व अंतर्दशा (Vimshottari Dasha)</span>
                  </h4>
                  <button
                    onClick={() => toggleSection('dasha')}
                    className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
                  >
                    {expandedSections.dasha ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {expandedSections.dasha && (
                  <div className="space-y-3">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase text-emerald-800">वर्तमान महादशा</span>
                        <h5 className="text-base font-black text-emerald-900">{report.vimsottariDasha?.currentMahadasha || 'चालू महादशा'}</h5>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase text-emerald-800">वर्तमान अंतर्दशा</span>
                        <h5 className="text-base font-black text-emerald-900">{report.vimsottariDasha?.currentAntardasha || 'चालू अंतर्दशा'}</h5>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                      {(report.vimsottariDasha?.dashaList || []).map((d, i) => (
                        <div
                          key={`dasha-${i}`}
                          className={`p-2.5 rounded-xl border flex items-center justify-between ${
                            d.isCurrent
                              ? 'bg-[#800C1E] text-white border-[#800C1E] font-black shadow-md'
                              : 'bg-slate-50 border-slate-200 text-slate-800 font-bold'
                          }`}
                        >
                          <div>
                            <span>{d.planet} महादशा</span>
                            {d.isCurrent && <span className="ml-1 text-[10px] bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded-full font-black">चालू</span>}
                          </div>
                          <span className="text-[11px] opacity-90 font-mono">
                            {d.startDate ? d.startDate.slice(0, 4) : ''} - {d.endDate ? d.endDate.slice(0, 4) : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 5 & 6: MANGLIK DOSHA & YOGAS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* MANGLIK */}
                <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-md space-y-2">
                  <h4 className="text-base font-black text-[#800C1E] flex items-center gap-2 border-b border-amber-100 pb-2">
                    <Flame className="w-5 h-5 text-rose-600" />
                    <span>५. मंगळ दोष व परिहार (Mangal Dosha)</span>
                  </h4>

                  <div className={`p-3 rounded-xl border text-xs ${
                    report.manglikDosha?.isPresent
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}>
                    <div className="font-black text-sm mb-1 flex items-center gap-1.5">
                      {report.manglikDosha?.isPresent ? (
                        <>
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          <span>मंगळ दोष दर्शवतो (Manglik)</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>पत्रिका मंगळ निर्दोष आहे (Non-Manglik)</span>
                        </>
                      )}
                    </div>
                    <p className="font-bold">{report.manglikDosha?.statusMr || 'पत्रिका मंगळ निर्दोष आहे'}</p>
                    {report.manglikDosha?.cancellationDetailsMr && (
                      <p className="mt-1 text-[11px] opacity-90 font-medium italic border-t border-rose-200/50 pt-1">
                        सल्ला/परिहार: {report.manglikDosha.cancellationDetailsMr}
                      </p>
                    )}
                  </div>
                </div>

                {/* YOGAS */}
                <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-md space-y-2">
                  <h4 className="text-base font-black text-[#800C1E] flex items-center gap-2 border-b border-amber-100 pb-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span>६. प्रमुख शुभ योग व दोष (Yogas)</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    {(report.yogasAndDoshas || []).map((y, i) => (
                      <div key={`y-${i}`} className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60">
                        <div className="flex items-center justify-between font-black text-slate-800">
                          <span>{y.nameMr}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            y.isPresent ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {y.isPresent ? 'उपस्थित (Active)' : 'अंशिक'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium mt-1">{y.descriptionMr}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="text-center sm:text-left">
                  <div className="text-xs font-black text-amber-400">वंजारी जोडी अधिकृत वैदिक रिपोर्ट</div>
                  <div className="text-[11px] text-slate-300">हा अहवाल तुमच्या डिव्हाइसमध्ये सुरक्षित साठवला गेला आहे.</div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isPdfDownloading}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>PDF डाउनलोड</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
