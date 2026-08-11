import { UserProfile } from '../types';

export const PROFESSION_PRESETS = [
  { id: 'doctor', label: '🩺 डॉक्टर', description: 'वैद्यकीय अधिकारी, MBBS, BAMS, MD, BDS' },
  { id: 'govt_job', label: '🏛️ सरकारी नोकरी', description: 'शासकीय अधिकारी, MPSC, UPSC, जिल्हा परिषद, पोलीस' },
  { id: 'engineer', label: '💻 इंजिनिअर / IT', description: 'सॉफ्टवेअर, BE, BTech, तंत्रज्ञान' },
  { id: 'teacher', label: '👨‍🏫 शिक्षक / प्राध्यापक', description: 'माध्यमिक, उच्च माध्यमिक, प्रोफेसर' },
  { id: 'private_job', label: '💼 प्रायव्हेट नोकरी', description: 'कॉर्पोरेट, खाजगी कंपनी, मॅनेजर' },
  { id: 'business', label: '🏢 व्यावसायिक / उद्योग', description: 'स्वतःचा व्यवसाय, व्यापारी, कॉन्ट्रॅक्टर' },
  { id: 'farmer', label: '🌾 शेतकरी / कृषी', description: 'शेती, बागायतदार, कृषी व्यवसाय' },
  { id: 'lawyer_ca', label: '⚖️ वकील / सीए', description: 'ऍडव्होकेट, सनदी लेखापाल, कोर्ट' },
];

export function getProfessionBadges(profile: Partial<UserProfile>): string[] {
  const badges: string[] = [];

  // If explicit professionTags exist and have items, include them
  if (profile.professionTags && Array.isArray(profile.professionTags) && profile.professionTags.length > 0) {
    profile.professionTags.forEach(t => {
      if (t && !badges.includes(t)) badges.push(t);
    });
  }

  const occ = (profile.occupation || '').toLowerCase();
  const edu = (profile.education || '').toLowerCase();
  const comp = (profile.companyName || '').toLowerCase();
  const combined = `${occ} ${edu} ${comp}`;

  // Doctor check
  const isDoctor = /doctor|doc|डॉक्टर|mbbs|bams|bhms|md\b|bds|medical|वैद्यकीय|आरोग्य/i.test(combined);
  if (isDoctor && !badges.includes('🩺 डॉक्टर')) {
    badges.push('🩺 डॉक्टर');
  }

  // Govt Job check
  const isGovt = /govt|government|सरकारी|शासकीय|mpsc|upsc|talathi|zilla|zila|police|पोलीस|तलाठी|तहसीलदार|ग्रामसेवक|maharashtra state|pwb|rto|revenue/i.test(combined);
  if (isGovt && !badges.includes('🏛️ सरकारी नोकरी')) {
    badges.push('🏛️ सरकारी नोकरी');
  }

  // Engineer check
  const isEngg = /engineer|engg|इंजिनिअर|अभियंता|b\.e|btech|software|developer|it\b|आयटी/i.test(combined);
  if (isEngg && !badges.includes('💻 इंजिनिअर')) {
    badges.push('💻 इंजिनिअर');
  }

  // Teacher / Professor check
  const isTeacher = /teacher|professor|lecturer|शिक्षक|शिक्षिका|प्राध्यापक|गुरुजी|मास्तर|b\.ed|d\.ed/i.test(combined);
  if (isTeacher && !badges.includes('👨‍🏫 शिक्षक / प्राध्यापक')) {
    badges.push('👨‍🏫 शिक्षक / प्राध्यापक');
  }

  // Business check
  const isBusiness = /business|self employed|व्यवसाय|धंदा|उद्योग|व्यापारी|owner|proprietor/i.test(combined);
  if (isBusiness && !badges.includes('🏢 व्यावसायिक')) {
    badges.push('🏢 व्यावसायिक');
  }

  // Farmer check
  const isFarmer = /farmer|agriculture|शेतकरी|शेती|कृषी|बागायतदार/i.test(combined);
  if (isFarmer && !badges.includes('🌾 शेतकरी')) {
    badges.push('🌾 शेतकरी');
  }

  // Lawyer / CA check
  const isLawyer = /lawyer|advocate|वकील|ca\b|chartered|accountant/i.test(combined);
  if (isLawyer && !badges.includes('⚖️ वकील / सीए')) {
    badges.push('⚖️ वकील / सीए');
  }

  // Fallback if no tags detected yet
  if (badges.length === 0) {
    if (occ.length > 2) {
      if (/private|company|pvt|ltd|corporate|job|नोकरी/i.test(combined)) {
        badges.push('💼 प्रायव्हेट नोकरी');
      } else {
        badges.push(`💼 ${profile.occupation}`);
      }
    }
  }

  return badges;
}
