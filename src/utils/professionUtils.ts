import { UserProfile } from '../types';

export interface TagPreset {
  id: string;
  label: string;
  description: string;
  category: 'admin' | 'marital' | 'job' | 'education';
}

export const TAG_CATEGORIES = [
  { id: 'admin', name: '🌟 ॲडमिन विशेष व हायलाईट टॅग्ज' },
  { id: 'marital', name: '💍 वैवाहिक स्थिती टॅग्ज' },
  { id: 'job', name: '🏛️ नोकरी, व्यवसाय व पद टॅग्ज' },
  { id: 'education', name: '🎓 शिक्षण, मालमत्ता व इतर टॅग्ज' },
];

export const PROFILE_TAG_PRESETS: TagPreset[] = [
  // 🌟 ॲडमिन विशेष टॅग्ज
  { id: 'admin_special', label: '🌟 ॲडमिन विशेष', description: 'ॲडमिनद्वारे विशेष शिफारस केलेले स्थळ', category: 'admin' },
  { id: 'vip_profile', label: '👑 VIP स्थळ', description: 'व्हीआयपी व अतिमहत्त्वाचे प्रोफाइल', category: 'admin' },
  { id: 'recommended', label: '⭐ रिकमेंडेड जोडी', description: 'खास जुळणारे शिफारस केलेले स्थळ', category: 'admin' },
  { id: 'verified_profile', label: '✨ व्हेरीफाईड प्रोफाईल', description: 'कागदपत्रे तपासलेली पडताळणीकृत प्रोफाईल', category: 'admin' },
  { id: 'hot_profile', label: '🔥 लोकप्रिय प्रोफाईल', description: 'जास्त पसंती मिळणारे स्थळ', category: 'admin' },
  { id: 'premium_member', label: '💎 प्रीमियम सदस्य', description: 'प्रीमियम सबस्क्रिप्शनधारक सदस्य', category: 'admin' },

  // 💍 वैवाहिक स्थिती टॅग्ज
  { id: 'divorced', label: '💔 घटस्फोटित', description: 'कायदेशीर घटस्फोट झालेला सदस्य', category: 'marital' },
  { id: 'remarriage', label: '💍 पुनर्विवाह', description: 'पुनर्विवाहासाठी इच्छुक प्रोफाइल', category: 'marital' },
  { id: 'widow_widower', label: '🕊️ विधुर / विधवा', description: 'पती/पत्नीचे निधन झालेले', category: 'marital' },
  { id: 'separated', label: '⏳ विभक्त (Separated)', description: 'कायदेशीर विभक्त असणारे', category: 'marital' },
  { id: 'never_married', label: '🌸 अविवाहित', description: 'प्रथम विवाह', category: 'marital' },

  // 🏛️ नोकरी व व्यवसाय टॅग्ज
  { id: 'govt_job', label: '🏛️ सरकारी नोकरी', description: 'शासकीय अधिकारी, MPSC, UPSC, जि.प., पोलीस', category: 'job' },
  { id: 'class1_officer', label: '🏛️ क्लास-१ / क्लास-२ अधिकारी', description: 'सनदी / उच्च शासकीय अधिकारी', category: 'job' },
  { id: 'doctor', label: '🩺 डॉक्टर / मेडिकल', description: 'वैद्यकीय अधिकारी, MBBS, BAMS, MD, BDS', category: 'job' },
  { id: 'engineer', label: '💻 इंजिनिअर / IT', description: 'सॉफ्टवेअर, BE, BTech, IT क्षेत्रातील', category: 'job' },
  { id: 'teacher', label: '👨‍🏫 शिक्षक / प्राध्यापक', description: 'माध्यमिक शिक्षक, प्रोफेसर, कॉलेज', category: 'job' },
  { id: 'private_job', label: '💼 प्रायव्हेट नोकरी', description: 'कॉर्पोरेट, खाजगी कंपनी, मॅनेजर', category: 'job' },
  { id: 'business', label: '🏢 व्यावसायिक / उद्योग', description: 'स्वतःचा व्यवसाय, व्यापारी, कॉन्ट्रॅक्टर', category: 'job' },
  { id: 'farmer', label: '🌾 शेतकरी / कृषी', description: 'शेती, बागायतदार, कृषी व्यवसाय', category: 'job' },
  { id: 'police_defense', label: '👮 पोलीस / सैन्यदल', description: 'महाराष्ट्र पोलीस, लष्कर, डिफेन्स', category: 'job' },
  { id: 'bank_officer', label: '🏦 बँक अधिकारी', description: 'राष्ट्रीयीकृत / खाजगी बँक ऑफिसर', category: 'job' },
  { id: 'lawyer_ca', label: '⚖️ वकील / सीए', description: 'ऍडव्होकेट, सनदी लेखापाल, कोर्ट', category: 'job' },

  // 🎓 शिक्षण व इतर टॅग्ज
  { id: 'highly_educated', label: '🎓 उच्च शिक्षित (Master\'s/PhD)', description: 'मास्टर्स, पोस्ट ग्रॅज्युएट, विद्यावाचस्पती', category: 'education' },
  { id: 'nri', label: '✈️ NRI / परदेशात स्थायिक', description: 'परदेशात नोकरी / वास्तव्यास असलेले', category: 'education' },
  { id: 'own_house', label: '🏡 स्वतःचे घर / बंगलो', description: 'स्वतःच्या मालकीचे घर व समृद्ध कुटुंब', category: 'education' },
  { id: 'rich_farmer', label: '🌾 बागायतदार / समृद्ध शेती', description: 'मोठी बागायती शेती व बागायतदार', category: 'education' },
  { id: 'vegetarian', label: '🌱 शुद्ध शाकाहारी', description: 'शाकाहारी आहार व सात्विक राहणीमान', category: 'education' },
];

export const PROFESSION_PRESETS = PROFILE_TAG_PRESETS.filter(t => t.category === 'job');

export function getTagStyleClass(tag: string): string {
  const lower = tag.toLowerCase();

  // 🌟 Admin Special / VIP / Featured / Premium
  if (lower.includes('ॲडमिन') || lower.includes('vip') || lower.includes('प्रीमियम') || lower.includes('रिकमेंडेड') || lower.includes('हॉट') || lower.includes('विशेष')) {
    return 'bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 text-[#800C1E] border-amber-400 font-black shadow-2xs';
  }
  // 💔 Divorced / Remarriage / Widow
  if (lower.includes('घटस्फोटित') || lower.includes('पुनर्विवाह') || lower.includes('विधवा') || lower.includes('विभक्त')) {
    return 'bg-rose-100 text-rose-950 border-rose-300 font-extrabold';
  }
  // 🩺 Doctor
  if (lower.includes('डॉक्टर') || lower.includes('मेडिकल')) {
    return 'bg-emerald-100 text-emerald-950 border-emerald-300 font-extrabold';
  }
  // 🏛️ Govt Job / Class 1 / Police / Bank
  if (lower.includes('सरकारी') || lower.includes('क्लास') || lower.includes('पोलीस') || lower.includes('बँक')) {
    return 'bg-amber-100 text-amber-950 border-amber-300 font-extrabold';
  }
  // 💻 Engineer / IT
  if (lower.includes('इंजिनिअर') || lower.includes('it') || lower.includes('सॉफ्टवेअर')) {
    return 'bg-cyan-100 text-cyan-950 border-cyan-300 font-extrabold';
  }
  // 👨‍🏫 Teacher / Professor / Highly Educated
  if (lower.includes('शिक्षक') || lower.includes('प्राध्यापक') || lower.includes('शिक्षित')) {
    return 'bg-indigo-100 text-indigo-950 border-indigo-300 font-extrabold';
  }
  // 🏢 Business
  if (lower.includes('व्यावसायिक') || lower.includes('व्यवसाय') || lower.includes('उद्योग')) {
    return 'bg-purple-100 text-purple-950 border-purple-300 font-extrabold';
  }
  // 🌾 Farmer
  if (lower.includes('शेतकरी') || lower.includes('शेती') || lower.includes('बागायतदार')) {
    return 'bg-lime-100 text-lime-950 border-lime-300 font-extrabold';
  }
  // ✈️ NRI
  if (lower.includes('nri') || lower.includes('परदेशात')) {
    return 'bg-sky-100 text-sky-950 border-sky-300 font-extrabold';
  }
  // 🏡 Own House
  if (lower.includes('घर') || lower.includes('बंगलो')) {
    return 'bg-orange-100 text-orange-950 border-orange-300 font-extrabold';
  }

  return 'bg-slate-100 text-slate-800 border-slate-300 font-extrabold';
}

export function getProfessionBadges(profile: Partial<UserProfile>): string[] {
  const badges: string[] = [];

  // 1. Explicit professionTags array
  if (profile.professionTags && Array.isArray(profile.professionTags) && profile.professionTags.length > 0) {
    profile.professionTags.forEach(t => {
      if (t && !badges.includes(t)) badges.push(t);
    });
  }

  // 2. Custom badge / Badge
  const customBadgeText = profile.badge || profile.customBadge;
  if (customBadgeText && !profile.hideBadge && !badges.includes(customBadgeText)) {
    badges.push(customBadgeText);
  }

  // 3. Featured / Admin Special
  if (profile.isFeatured && !badges.some(b => b.includes('ॲडमिन') || b.includes('VIP') || b.includes('रिकमेंडेड'))) {
    badges.push('🌟 ॲडमिन विशेष');
  }

  // 4. Marital status auto-detection
  const marital = (profile.maritalStatus || '').toLowerCase();
  if (marital.includes('घटस्फोटित') || marital.includes('divorced')) {
    if (!badges.some(b => b.includes('घटस्फोटित'))) badges.push('💔 घटस्फोटित');
  } else if (marital.includes('पुनर्विवाह') || marital.includes('remarriage')) {
    if (!badges.some(b => b.includes('पुनर्विवाह'))) badges.push('💍 पुनर्विवाह');
  } else if (marital.includes('विधवा') || marital.includes('विधुर') || marital.includes('widow')) {
    if (!badges.some(b => b.includes('विधवा') || b.includes('विधुर'))) badges.push('🕊️ विधुर / विधवा');
  }

  // 5. Occupation & Education auto-detection
  const occ = (profile.occupation || '').toLowerCase();
  const edu = (profile.education || '').toLowerCase();
  const comp = (profile.companyName || '').toLowerCase();
  const combined = `${occ} ${edu} ${comp}`;

  // Doctor check
  const isDoctor = /doctor|doc|डॉक्टर|mbbs|bams|bhms|md\b|bds|medical|वैद्यकीय|आरोग्य/i.test(combined);
  if (isDoctor && !badges.some(b => b.includes('डॉक्टर'))) {
    badges.push('🩺 डॉक्टर');
  }

  // Govt Job check
  const isGovt = /govt|government|सरकारी|शासकीय|mpsc|upsc|talathi|zilla|zila|police|पोलीस|तलाठी|तहसीलदार|ग्रामसेवक|maharashtra state|pwb|rto|revenue/i.test(combined);
  if (isGovt && !badges.some(b => b.includes('सरकारी'))) {
    badges.push('🏛️ सरकारी नोकरी');
  }

  // Engineer check
  const isEngg = /engineer|engg|इंजिनिअर|अभियंता|b\.e|btech|software|developer|it\b|आयटी/i.test(combined);
  if (isEngg && !badges.some(b => b.includes('इंजिनिअर'))) {
    badges.push('💻 इंजिनिअर');
  }

  // Teacher / Professor check
  const isTeacher = /teacher|professor|lecturer|शिक्षक|शिक्षिका|प्राध्यापक|गुरुजी|मास्तर|b\.ed|d\.ed/i.test(combined);
  if (isTeacher && !badges.some(b => b.includes('शिक्षक'))) {
    badges.push('👨‍🏫 शिक्षक / प्राध्यापक');
  }

  // Business check
  const isBusiness = /business|self employed|व्यवसाय|धंदा|उद्योग|व्यापारी|owner|proprietor/i.test(combined);
  if (isBusiness && !badges.some(b => b.includes('व्यावसायिक') || b.includes('व्यवसाय'))) {
    badges.push('🏢 व्यावसायिक');
  }

  // Farmer check
  const isFarmer = /farmer|agriculture|शेतकरी|शेती|कृषी|बागायतदार/i.test(combined);
  if (isFarmer && !badges.some(b => b.includes('शेतकरी'))) {
    badges.push('🌾 शेतकरी');
  }

  // Lawyer / CA check
  const isLawyer = /lawyer|advocate|वकील|ca\b|chartered|accountant/i.test(combined);
  if (isLawyer && !badges.some(b => b.includes('वकील'))) {
    badges.push('⚖️ वकील / सीए');
  }

  return badges;
}

