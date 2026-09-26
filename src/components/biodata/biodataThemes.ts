export interface BioDataThemeConfig {
  id: 'rose_gold_floral' | 'royal_maroon' | 'emerald_peacock' | 'saffron_temple' | 'navy_classic';
  name: string;
  badgeEmoji: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  labelColor: string;
  bgColor: string;
  badgeBg: string;
  tableHeaderBg: string;
  tableHeaderTextColor: string;
  borderColor: string;
  lightBorderColor: string;
  floralAccent: boolean;
  pillHeaderGradient: string;
  outerBorderDouble: string;
}

export const BIODATA_THEMES: Record<string, BioDataThemeConfig> = {
  rose_gold_floral: {
    id: 'rose_gold_floral',
    name: 'गुलाबी व सुवर्ण फ्लोरल',
    badgeEmoji: '🌸',
    primaryColor: '#BE123C', // Deep Rose Crimson
    secondaryColor: '#881337',
    accentColor: '#D97706', // Gold/Amber
    textColor: '#1E293B',
    labelColor: '#9F1239',
    bgColor: '#FFFDF9',
    badgeBg: '#FFF1F2',
    tableHeaderBg: '#BE123C',
    tableHeaderTextColor: '#FFFFFF',
    borderColor: '#E11D48',
    lightBorderColor: 'rgba(225, 29, 72, 0.25)',
    floralAccent: true,
    pillHeaderGradient: 'linear-gradient(135deg, #BE123C 0%, #E11D48 100%)',
    outerBorderDouble: '8px double #BE123C',
  },
  royal_maroon: {
    id: 'royal_maroon',
    name: 'शाही लाल व सुवर्ण',
    badgeEmoji: '👑',
    primaryColor: '#A71930',
    secondaryColor: '#700C1E',
    accentColor: '#D97706',
    textColor: '#1E293B',
    labelColor: '#800C1E',
    bgColor: '#FFFDF5',
    badgeBg: '#FEF2F2',
    tableHeaderBg: '#A71930',
    tableHeaderTextColor: '#FEF3C7',
    borderColor: '#A71930',
    lightBorderColor: 'rgba(167, 25, 48, 0.25)',
    floralAccent: false,
    pillHeaderGradient: 'linear-gradient(135deg, #800C1E 0%, #A71930 100%)',
    outerBorderDouble: '10px double #A71930',
  },
  emerald_peacock: {
    id: 'emerald_peacock',
    name: 'मखमली मोरपंखी हिरवा',
    badgeEmoji: '🌿',
    primaryColor: '#064E3B',
    secondaryColor: '#022C22',
    accentColor: '#D97706',
    textColor: '#1E293B',
    labelColor: '#064E3B',
    bgColor: '#F4FBF7',
    badgeBg: '#ECFDF5',
    tableHeaderBg: '#064E3B',
    tableHeaderTextColor: '#FEF3C7',
    borderColor: '#064E3B',
    lightBorderColor: 'rgba(6, 78, 59, 0.25)',
    floralAccent: false,
    pillHeaderGradient: 'linear-gradient(135deg, #022C22 0%, #064E3B 100%)',
    outerBorderDouble: '10px double #064E3B',
  },
  saffron_temple: {
    id: 'saffron_temple',
    name: 'भव्य भगवा व सुवर्ण',
    badgeEmoji: '🚩',
    primaryColor: '#C2410C',
    secondaryColor: '#7C2D12',
    accentColor: '#D97706',
    textColor: '#1E293B',
    labelColor: '#9A3412',
    bgColor: '#FFFBF5',
    badgeBg: '#FFF7ED',
    tableHeaderBg: '#C2410C',
    tableHeaderTextColor: '#FFFFFF',
    borderColor: '#C2410C',
    lightBorderColor: 'rgba(194, 65, 12, 0.25)',
    floralAccent: false,
    pillHeaderGradient: 'linear-gradient(135deg, #9A3412 0%, #EA580C 100%)',
    outerBorderDouble: '10px double #C2410C',
  },
  navy_classic: {
    id: 'navy_classic',
    name: 'क्लासिक रॉयल निळा',
    badgeEmoji: '💙',
    primaryColor: '#0F172A',
    secondaryColor: '#020617',
    accentColor: '#D97706',
    textColor: '#1E293B',
    labelColor: '#1E293B',
    bgColor: '#F8FAFC',
    badgeBg: '#F1F5F9',
    tableHeaderBg: '#0F172A',
    tableHeaderTextColor: '#FDE047',
    borderColor: '#0F172A',
    lightBorderColor: 'rgba(15, 23, 42, 0.25)',
    floralAccent: false,
    pillHeaderGradient: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
    outerBorderDouble: '10px double #0F172A',
  },
};
