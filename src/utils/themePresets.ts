import { ThemePreset } from '../types';

export interface ThemeConfig {
  id: ThemePreset;
  nameMr: string;
  nameEn: string;
  descriptionMr: string;
  bgClass: string;
  cardBgClass: string;
  textPrimaryClass: string;
  textSecondaryClass: string;
  accentClass: string;
  accentHoverClass: string;
  accentBgClass: string;
  borderClass: string;
  badgeBgClass: string;
  primaryButtonClass: string;
  secondaryButtonClass: string;
  fontSizeMultiplier: number;
  palette: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
  };
}

export const THEME_PRESETS: Record<ThemePreset, ThemeConfig> = {
  modern_ruby: {
    id: 'modern_ruby',
    nameMr: '१. मॉडर्न रुबी (Modern Ruby)',
    nameEn: 'Modern Ruby',
    descriptionMr: 'स्वच्छ पांढरा बॅकग्राउंड आणि रुबी रेड ॲक्शन बटणे - तरुणांसाठी अत्याधुनिक व फ्रेश लूक.',
    bgClass: 'bg-[#F8FAFC]',
    cardBgClass: 'bg-white',
    textPrimaryClass: 'text-slate-900',
    textSecondaryClass: 'text-slate-600',
    accentClass: 'text-[#E11D48]',
    accentHoverClass: 'hover:text-[#BE123C]',
    accentBgClass: 'bg-[#E11D48]',
    borderClass: 'border-slate-200',
    badgeBgClass: 'bg-rose-50 text-rose-700 border-rose-200',
    primaryButtonClass: 'bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-md shadow-rose-200',
    secondaryButtonClass: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300',
    fontSizeMultiplier: 1.0,
    palette: {
      primary: '#E11D48',
      background: '#F8FAFC',
      card: '#FFFFFF',
      text: '#0F172A',
      border: '#E2E8F0',
    },
  },
  auspicious_crimson: {
    id: 'auspicious_crimson',
    nameMr: '२. मंगलमयी कुंकू व सोनसळी (Auspicious Crimson)',
    nameEn: 'Auspicious Crimson',
    descriptionMr: 'पारंपरिक वंजारी संस्कृतीला साजेसा उबदार आयव्हरी, राजेशाही मरून आणि सोनेरी लूक.',
    bgClass: 'bg-[#FFFDF7]',
    cardBgClass: 'bg-white',
    textPrimaryClass: 'text-[#5A0815]',
    textSecondaryClass: 'text-stone-700',
    accentClass: 'text-[#881337]',
    accentHoverClass: 'hover:text-[#5C0815]',
    accentBgClass: 'bg-gradient-to-r from-[#A71930] to-[#800C1E]',
    borderClass: 'border-amber-300',
    badgeBgClass: 'bg-amber-100 text-amber-950 border-amber-300',
    primaryButtonClass: 'bg-gradient-to-r from-[#A71930] to-[#800C1E] hover:from-[#800C1E] hover:to-[#5C0815] text-amber-100 shadow-md shadow-amber-900/20 border border-amber-300',
    secondaryButtonClass: 'bg-amber-50 hover:bg-amber-100 text-[#800C1E] border border-amber-300',
    fontSizeMultiplier: 1.0,
    palette: {
      primary: '#881337',
      background: '#FFFDF7',
      card: '#FFFFFF',
      text: '#5A0815',
      border: '#FCD34D',
    },
  },
  royal_trust_blue: {
    id: 'royal_trust_blue',
    nameMr: '३. रॉयल ट्रस्ट ब्लू (Royal Trust Blue)',
    nameEn: 'Royal Trust Blue',
    descriptionMr: 'सुरक्षा, विश्वास व पारदर्शकतेचे प्रतीक असणारा सफायर ब्लू कॉर्पोरेट मॅट्रिमोनी थीम.',
    bgClass: 'bg-[#F1F5F9]',
    cardBgClass: 'bg-white',
    textPrimaryClass: 'text-slate-950',
    textSecondaryClass: 'text-slate-600',
    accentClass: 'text-[#0284C7]',
    accentHoverClass: 'hover:text-[#0369A1]',
    accentBgClass: 'bg-[#0284C7]',
    borderClass: 'border-sky-200',
    badgeBgClass: 'bg-sky-50 text-sky-800 border-sky-200',
    primaryButtonClass: 'bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-md shadow-sky-200',
    secondaryButtonClass: 'bg-sky-50 hover:bg-sky-100 text-sky-900 border-sky-200',
    fontSizeMultiplier: 1.0,
    palette: {
      primary: '#0284C7',
      background: '#F1F5F9',
      card: '#FFFFFF',
      text: '#0F172A',
      border: '#BAE6FD',
    },
  },
  parents_easy_mode: {
    id: 'parents_easy_mode',
    nameMr: '४. पालक सुलभ मोड (Parents Easy-Mode)',
    nameEn: 'Parents Easy-Mode',
    descriptionMr: 'पालक व ज्येष्ठ नागरिकांसाठी मोठे फॉन्ट्स, हाय-कॉन्ट्रास्ट आणि हिरवे सोपे ॲक्शन बटणे.',
    bgClass: 'bg-[#FFFFFF]',
    cardBgClass: 'bg-white',
    textPrimaryClass: 'text-black font-extrabold',
    textSecondaryClass: 'text-slate-800 font-bold',
    accentClass: 'text-[#16A34A]',
    accentHoverClass: 'hover:text-[#15803D]',
    accentBgClass: 'bg-[#16A34A]',
    borderClass: 'border-slate-400 border-2',
    badgeBgClass: 'bg-emerald-100 text-emerald-950 border-emerald-400 font-black',
    primaryButtonClass: 'bg-[#16A34A] hover:bg-[#15803D] text-white font-black text-base shadow-lg',
    secondaryButtonClass: 'bg-slate-100 hover:bg-slate-200 text-black border-2 border-slate-400 font-black',
    fontSizeMultiplier: 1.15,
    palette: {
      primary: '#16A34A',
      background: '#FFFFFF',
      card: '#FFFFFF',
      text: '#000000',
      border: '#94A3B8',
    },
  },
  velvet_dark: {
    id: 'velvet_dark',
    nameMr: '५. व्हेलव्हेट डार्क मोड (Velvet Dark Mode)',
    nameEn: 'Velvet Dark Mode',
    descriptionMr: 'डोळ्यांना आराम देणारा चारकोल डार्क बॅकग्राउंड व निऑन रोझ ॲक्सेंट - नाईट मोडसाठी उत्तम.',
    bgClass: 'bg-[#0F172A]',
    cardBgClass: 'bg-[#1E293B]',
    textPrimaryClass: 'text-slate-100',
    textSecondaryClass: 'text-slate-300',
    accentClass: 'text-[#FB7185]',
    accentHoverClass: 'hover:text-[#F43F5E]',
    accentBgClass: 'bg-[#FB7185]',
    borderClass: 'border-slate-700',
    badgeBgClass: 'bg-slate-800 text-rose-300 border-slate-700',
    primaryButtonClass: 'bg-[#FB7185] hover:bg-[#F43F5E] text-slate-950 font-black shadow-lg shadow-rose-950/40',
    secondaryButtonClass: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
    fontSizeMultiplier: 1.0,
    palette: {
      primary: '#FB7185',
      background: '#0F172A',
      card: '#1E293B',
      text: '#F8FAFC',
      border: '#334155',
    },
  },
};

export const getActiveThemeConfig = (preset?: ThemePreset): ThemeConfig => {
  if (preset && THEME_PRESETS[preset]) {
    return THEME_PRESETS[preset];
  }
  return THEME_PRESETS.auspicious_crimson;
};
