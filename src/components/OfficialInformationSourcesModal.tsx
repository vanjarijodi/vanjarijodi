import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Search,
  CheckCircle2,
  Building2,
  FileText,
  Globe,
  Info,
  BadgeCheck,
} from 'lucide-react';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

export interface OfficialSourceItem {
  id: string;
  name: string;
  nameMr: string;
  category: 'identity' | 'civil_registration' | 'examination' | 'government_portal' | 'legal';
  categoryLabel: string;
  categoryLabelMr: string;
  officialUrl: string;
  lastVerifiedDate: string;
  description: string;
  descriptionMr: string;
  domainVerified: boolean;
}

export const VERIFIED_OFFICIAL_SOURCES: OfficialSourceItem[] = [
  {
    id: 'uidai',
    name: 'Unique Identification Authority of India (UIDAI)',
    nameMr: 'भारतीय विशिष्ट ओळख प्राधिकरण (UIDAI / आधार)',
    category: 'identity',
    categoryLabel: 'Identity & e-KYC',
    categoryLabelMr: 'ओळख व आधार पडताळणी',
    officialUrl: 'https://uidai.gov.in',
    lastVerifiedDate: 'September 2026',
    description: 'Official Government of India statutory authority for Aadhaar identification, e-KYC, and authentication.',
    descriptionMr: 'नागरिकांच्या आधार पडताळणी व ई-केवायसीसाठी भारत सरकारची अधिकृत वैधानिक संस्था.',
    domainVerified: true,
  },
  {
    id: 'digilocker',
    name: 'DigiLocker (National Digital Locker System)',
    nameMr: 'डिजिलॉकर (राष्ट्रीय डिजिटल लॉकर प्रणाली)',
    category: 'identity',
    categoryLabel: 'Identity & Certificates',
    categoryLabelMr: 'डिजिटल प्रमाणपत्रे व दस्तऐवज',
    officialUrl: 'https://www.digilocker.gov.in',
    lastVerifiedDate: 'September 2026',
    description: 'Official Digital India platform by MeitY for issuance and verification of digital certificates and degrees.',
    descriptionMr: 'नागरिकांची शैक्षणिक व शासकीय कागदपत्रे डिजिटल स्वरूपात साठवण्यासाठी भारत सरकारचा अधिकृत प्लॅटफॉर्म.',
    domainVerified: true,
  },
  {
    id: 'igr_maharashtra',
    name: 'Inspector General of Registration (IGR Maharashtra)',
    nameMr: 'नोंदणी व मुद्रांक विभाग (महाराष्ट्र शासन - IGR)',
    category: 'civil_registration',
    categoryLabel: 'Civil Marriage Registration',
    categoryLabelMr: 'विवाह नोंदणी व कायदेशीर नोंद',
    officialUrl: 'https://igrmaharashtra.gov.in',
    lastVerifiedDate: 'September 2026',
    description: 'Official portal of Government of Maharashtra for civil registration, Special Marriage Act, and Hindu Marriage Act registrations.',
    descriptionMr: 'महाराष्ट्र शासनाचा अधिकृत विवाह नोंदणी व दस्तऐवज मुद्रांक विभाग पोर्टल.',
    domainVerified: true,
  },
  {
    id: 'india_gov',
    name: 'National Portal of India (india.gov.in)',
    nameMr: 'भारतीय राष्ट्रीय अधिकृत पोर्टल',
    category: 'government_portal',
    categoryLabel: 'Citizen Services',
    categoryLabelMr: 'शासकीय नागरिक सेवा',
    officialUrl: 'https://www.india.gov.in',
    lastVerifiedDate: 'September 2026',
    description: 'The single-window access to information and services provided by various government entities in India.',
    descriptionMr: 'भारत सरकारच्या सर्व मंत्रालये व सेवांसाठीचे एकल खिडकी राष्ट्रीय अधिकृत प्रवेशद्वार.',
    domainVerified: true,
  },
  {
    id: 'meity',
    name: 'Ministry of Electronics & Information Technology (MeitY)',
    nameMr: 'इलेक्ट्रॉनिक्स आणि माहिती तंत्रज्ञान मंत्रालय (MeitY)',
    category: 'legal',
    categoryLabel: 'IT Act & Cyber Regulations',
    categoryLabelMr: 'माहिती तंत्रज्ञान कायदा व नियम',
    officialUrl: 'https://www.meity.gov.in',
    lastVerifiedDate: 'September 2026',
    description: 'Official ministry governing Information Technology Act, 2000, Intermediary Guidelines, and Digital Personal Data Protection.',
    descriptionMr: 'माहिती तंत्रज्ञान कायदा २००० व डिजिटल ग्राहक संरक्षण नियमावलीचे अधिकृत मंत्रालय.',
    domainVerified: true,
  },
  {
    id: 'aiims_exams',
    name: 'All India Institute of Medical Sciences (AIIMS) Examination Section',
    nameMr: 'अखिल भारतीय आयुर्विज्ञान संस्था (AIIMS) परीक्षा पोर्टल',
    category: 'examination',
    categoryLabel: 'Medical / Nursing Competitive Exams',
    categoryLabelMr: 'वैद्यकीय व नर्सिंग स्पर्धा परीक्षा',
    officialUrl: 'https://www.aiimsexams.ac.in',
    lastVerifiedDate: 'September 2026',
    description: 'Official examination wing of AIIMS New Delhi for NORCET, nursing officer entrance, and medical competitive tests.',
    descriptionMr: 'AIIMS नवी दिल्लीचे नर्सिंग ऑफिसर व वैद्यकीय परीक्षांचे अधिकृत परीक्षा मंडळ पोर्टल.',
    domainVerified: true,
  },
  {
    id: 'esic',
    name: 'Employees State Insurance Corporation (ESIC)',
    nameMr: 'कर्मचारी राज्य विमा महामंडळ (ESIC)',
    category: 'examination',
    categoryLabel: 'Recruitment & Healthcare',
    categoryLabelMr: 'भरती व आरोग्य सेवा',
    officialUrl: 'https://www.esic.gov.in',
    lastVerifiedDate: 'September 2026',
    description: 'Official portal of ESIC under Ministry of Labour and Employment for healthcare recruitment notifications.',
    descriptionMr: 'भारत सरकारच्या कामगार व रोजगार मंत्रालयांतर्गत ESIC भरती व अधिकृत सूचनांचे संकेतस्थळ.',
    domainVerified: true,
  },
  {
    id: 'rrb',
    name: 'Railway Recruitment Boards (RRB Central Portal)',
    nameMr: 'रेल्वे भरती मंडळ (RRB अधिकृत पोर्टल)',
    category: 'examination',
    categoryLabel: 'Railway Recruitment',
    categoryLabelMr: 'रेल्वे भरती व परीक्षा',
    officialUrl: 'https://www.rrbcdg.gov.in',
    lastVerifiedDate: 'September 2026',
    description: 'Official portal for Railway Recruitment Board notifications, paramedical staff, and exam schedules.',
    descriptionMr: 'भारतीय रेल्वे भरती मंडळ, पॅरामेडिकल स्टाफ व पदांच्या अधिकृत सूचनांचे संकेतस्थळ.',
    domainVerified: true,
  },
  {
    id: 'upsc',
    name: 'Union Public Service Commission (UPSC)',
    nameMr: 'संघ लोकसेवा आयोग (UPSC)',
    category: 'examination',
    categoryLabel: 'Central Public Service Exams',
    categoryLabelMr: 'केंद्रीय नागरी सेवा परीक्षा',
    officialUrl: 'https://www.upsc.gov.in',
    lastVerifiedDate: 'September 2026',
    description: 'Constitutional body of India for recruitment of civil servants and defense officials.',
    descriptionMr: 'भारतातील केंद्रीय नागरी सेवा व प्रशासकीय पदांच्या भरतीसाठीची घटनात्मक संस्था.',
    domainVerified: true,
  },
  {
    id: 'mpsc',
    name: 'Maharashtra Public Service Commission (MPSC)',
    nameMr: 'महाराष्ट्र लोकसेवा आयोग (MPSC)',
    category: 'examination',
    categoryLabel: 'State Civil Services',
    categoryLabelMr: 'महाराष्ट्र राज्य लोकसेवा परीक्षा',
    officialUrl: 'https://www.mpsc.gov.in',
    lastVerifiedDate: 'September 2026',
    description: 'Official commission responsible for conducting state civil service examinations in Maharashtra.',
    descriptionMr: 'महाराष्ट्र राज्य प्रशासकीय व आरोग्य सेवा भरती परीक्षा घेणारा अधिकृत राज्य लोकसेवा आयोग.',
    domainVerified: true,
  },
];

interface OfficialInformationSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'mr' | 'en';
}

export const OfficialInformationSourcesModal: React.FC<OfficialInformationSourcesModalProps> = ({
  isOpen,
  onClose,
  language = 'mr',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useModalScrollLock(isOpen);

  if (!isOpen) return null;

  const isEn = language === 'en';

  const filteredSources = VERIFIED_OFFICIAL_SOURCES.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      s.nameMr.toLowerCase().includes(q) ||
      s.officialUrl.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full my-auto overflow-hidden relative text-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 sm:p-6 relative border-b border-slate-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer"
            title={isEn ? 'Close' : 'बंद करा'}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isEn ? 'Verified Public Portals' : 'पडताळणी केलेली अधिकृत संकेतस्थळे'}</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold">
              {isEn ? 'Direct External Links Only' : 'केवळ थेट सार्वजनिक दुवे'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-emerald-400" />
            <span>{isEn ? 'Official Information Sources' : 'अधिकृत शासकीय व सार्वजनिक माहिती स्रोत'}</span>
          </h2>
          <p className="text-xs text-slate-300 font-medium mt-1">
            {isEn
              ? 'Independent educational & civil service verification portal reference directory'
              : 'पारदर्शकता व पडताळणीसाठी शासकीय व वैधानिक संस्थांच्या अधिकृत सार्वजनिक संकेतस्थळांची यादी'}
          </p>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Statutory Independence Disclaimer Banner */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-300/80 text-amber-950 text-xs leading-relaxed space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-amber-900 text-sm">
                  {isEn
                    ? 'DISCLAIMER: Independent Educational & Matrimonial Platform'
                    : 'महत्त्वाचे अस्वीकरण (Non-Affiliation Notice)'}
                </h4>
                <p className="mt-1 text-[11.5px] text-amber-900/90 leading-relaxed">
                  {isEn
                    ? 'This application is an independent community and educational platform. It is NOT affiliated with, endorsed by, sponsored by, or officially connected with any government department, recruitment board, examination authority, hospital, university, or public service commission. All official names, links, and trademarks are used strictly for identification and factual verification purposes. Users must always verify notifications and certificates directly from the official authority.'
                    : 'हे ॲप्लिकेशन एक खाजगी आणि स्वतंत्र व्यासपीठ आहे. या व्यासपीठाचा भारत सरकार, राज्य शासन, कोणत्याही भरती मंडळाशी (AIIMS, ESIC, RRB, MPSC, UPSC) किंवा शासकीय कार्यालयाशी कोणताही थेट अथवा अधिकृत संबंध नाही. खाली दिलेली सर्व शासकीय संकेतस्थळे केवळ नागरिकांच्या सोयीसाठी आणि माहितीची प्रत्यक्ष खात्री करण्यासाठी संदर्भ म्हणून दिली आहेत.'}
                </p>
              </div>
            </div>
          </div>

          {/* Educational Content vs Official Government Information Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                <span>{isEn ? 'Platform Community & Education' : 'या ॲपवरील खाजगी सेवा व माहिती'}</span>
              </div>
              <p className="text-[11px] text-slate-600">
                {isEn
                  ? 'Includes user-submitted biodata, profiles, practice quizzes, kundali calculations, and community discussions. Managed privately.'
                  : 'वधू-वर बायोडाटा, पत्रिका जुळवणी, परीक्षा सराव माहिती व समुदाय सेवा. हे व्यासपीठ खाजगीरीत्या व्यवस्थापित आहे.'}
              </p>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>{isEn ? 'Official Government Portals (.gov.in / .ac.in)' : 'शासकीय व अधिकृत माहिती स्रोत (.gov.in)'}</span>
              </div>
              <p className="text-[11px] text-emerald-900/90">
                {isEn
                  ? 'Official notifications, admit cards, civil marriage registrations, Aadhaar e-KYC, and government exam dates directly hosted by sovereign authorities.'
                  : 'शासकीय विवाह नोंदणी (IGR), आधार ओळख, अधिकृत परीक्षा हॉल तिकीट व अधिसूचना थेट सरकारी पोर्टल्सवरूनच प्राप्त होतात.'}
              </p>
            </div>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? 'Search official sources...' : 'अधिकृत स्रोत किंवा विभाग शोधा...'}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 focus:outline-none"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
            >
              <option value="all">{isEn ? 'All Categories' : 'सर्व विभाग'}</option>
              <option value="identity">{isEn ? 'Identity & e-KYC' : 'ओळख व आधार'}</option>
              <option value="civil_registration">{isEn ? 'Civil Marriage Registration' : 'विवाह नोंदणी'}</option>
              <option value="examination">{isEn ? 'Government Examinations' : 'स्पर्धा परीक्षा मंडळे'}</option>
              <option value="legal">{isEn ? 'Legal & IT Acts' : 'कायदेशीर व IT कायदे'}</option>
              <option value="government_portal">{isEn ? 'National Portals' : 'राष्ट्रीय पोर्टल्स'}</option>
            </select>
          </div>

          {/* Sources List */}
          <div className="space-y-3">
            {filteredSources.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                {isEn ? 'No official sources match your search.' : 'या शोधाशी सुसंगत अधिकृत स्रोत सापडला नाही.'}
              </div>
            ) : (
              filteredSources.map((source) => (
                <div
                  key={source.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-slate-300 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs font-black text-slate-900">{isEn ? source.name : source.nameMr}</h4>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>.gov.in / Verified</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-normal">
                      {isEn ? source.description : source.descriptionMr}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 pt-0.5">
                      <span className="font-mono text-emerald-800 font-semibold">{source.officialUrl}</span>
                      <span>•</span>
                      <span>{isEn ? `Verified: ${source.lastVerifiedDate}` : `पडताळणी तारीख: ${source.lastVerifiedDate}`}</span>
                    </div>
                  </div>

                  <a
                    href={source.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <span>{isEn ? 'Visit Portal' : 'पोर्टल उघडा'}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {isEn
                ? 'Only verified government domain addresses (.gov.in / .ac.in) are listed.'
                : 'केवळ अधिकृत व पडताळणी झालेले अधिकृत संकेतस्थळ पत्ते येथे समाविष्ट आहेत.'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition active:scale-95 cursor-pointer"
          >
            {isEn ? 'Close' : 'बंद करा'}
          </button>
        </div>
      </div>
    </div>
  );
};
