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

export const EMPLOYMENT_SECTORS = [
  { id: 'govt_job', label: '🏛️ सरकारी नोकरी', description: 'केंद्र / राज्य शासन, शासकीय कर्मचारी, MPSC, UPSC, ZP, पोलीस' },
  { id: 'semi_govt', label: '🏛️ निम-सरकारी / महामंडळ (PSU)', description: 'महावितरण, एसटी महामंडळ, बँक, सरकारी मंडळ' },
  { id: 'private_job', label: '💼 खाजगी नोकरी (Private Job)', description: 'IT, MNC, खाजगी कंपनी, कॉर्पोरेट, व्यवस्थापक' },
  { id: 'business', label: '🏢 स्वतःचा व्यवसाय / उद्योग', description: 'दुकान, ट्रेडिंग, कॉन्ट्रॅक्टर, उत्पादन, फर्म' },
  { id: 'practice', label: '🩺 स्वतंत्र प्रॅक्टिस / क्लिनिक', description: 'स्वतःचे हॉस्पिटल, क्लिनिक, कन्सल्टन्सी, लॅब' },
  { id: 'farming', label: '🌾 शेती / कृषी व्यवसाय', description: 'बागायतदार, कृषी प्रक्रिया, शेती उद्योग' },
  { id: 'higher_edu', label: '🎓 उच्च शिक्षण / नोकरी शोधत आहे', description: 'Post-Graduation, स्पर्धा परीक्षा तयारी' },
];

export const PROFESSION_ROLES = [
  { id: 'doctor', label: '🩺 डॉक्टर / मेडिकल ऑफिसर', category: 'job', description: 'MBBS, MD, MS, BAMS, BHMS, BDS, Medical Officer' },
  { id: 'software_engineer', label: '💻 सॉफ्टवेअर / आयटी इंजिनिअर', category: 'job', description: 'Software Developer, Architect, Tech Lead' },
  { id: 'core_engineer', label: '📐 इंजिनिअर (Civil/Mech/Elec)', category: 'job', description: 'B.E., B.Tech, सरकारी/खाजगी अभियंता' },
  { id: 'class1_officer', label: '🏛️ वर्ग-१ / वर्ग-२ सनदी अधिकारी', category: 'job', description: 'IAS, IPS, MPSC, तहसीलदार, बीडीओ, नायब तहसीलदार' },
  { id: 'police_defence', label: '👮 पोलीस / सैन्यदल अधिकारी', category: 'job', description: 'महाराष्ट्र पोलीस, CRPF, आर्मी, नेव्ही, एअरफोर्स' },
  { id: 'professor_teacher', label: '👨‍🏫 प्राध्यापक / शिक्षक', category: 'job', description: 'कॉलेज प्रोफेसर, माध्यमिक/प्राथमिक शिक्षक, लेक्चरर' },
  { id: 'bank_officer', label: '🏦 बँक अधिकारी (PO / Manager)', category: 'job', description: 'राष्ट्रीयीकृत / खाजगी बँक मॅनेजर, अधिकारी' },
  { id: 'lawyer_ca', label: '⚖️ वकील / सीए / फायनान्स', category: 'job', description: 'Advocate, CA, CS, Tax Consultant' },
  { id: 'pharmacist', label: '💊 फार्मासिस्ट / मेडिकल स्टोअर', category: 'job', description: 'B.Pharm, M.Pharm, फार्मसी उद्योग' },
  { id: 'business_owner', label: '🏢 उद्योजक / कॉन्ट्रॅक्टर / व्यापारी', category: 'job', description: 'मोठा व्यवसाय, सरकारी कॉन्ट्रॅक्टर' },
  { id: 'rich_farmer', label: '🌾 समृद्ध बागायतदार / शेतकरी', category: 'job', description: 'बागायत शेती, आधुनिक कृषी' },
  { id: 'architect', label: '🎨 आर्किटेक्ट / डिझायनर', category: 'job', description: 'B.Arch, वास्तूविशारद, इंटीरियर' },
];

export const PROFILE_TAG_PRESETS: TagPreset[] = [
  // 🌟 ॲडमिन विशेष टॅग्ज
  { id: 'truecaller_verified', label: '🛡️ Truecaller Verified', description: 'ट्रू कॉलर अधिकृत पडताळणीकृत सदस्य', category: 'admin' },
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
  { id: 'class1_officer', label: '🏛️ वर्ग-१ / वर्ग-२ अधिकारी', description: 'सनदी / उच्च शासकीय अधिकारी', category: 'job' },
  { id: 'mpsc_upsc', label: '🏛️ MPSC / UPSC स्पर्धा परीक्षा', description: 'शासकीय नोकरी तयारी किंवा नियुक्त', category: 'job' },
  { id: 'doctor', label: '🩺 डॉक्टर / मेडिकल', description: 'वैद्यकीय अधिकारी, MBBS, BAMS, MD, BDS', category: 'job' },
  { id: 'computer_engineer', label: '💻 कॉम्प्युटर इंजिनियर', description: 'कॉम्प्युटर इंजिनिअरिंग व IT पदवीधर', category: 'job' },
  { id: 'software_it', label: '💻 आयटी / सॉफ्टवेअर इंजिनियर', description: 'सॉफ्टवेअर डेव्हलपर, IT मधील तज्ज्ञ', category: 'job' },
  { id: 'engineer', label: '📐 इंजिनिअर (B.E. / B.Tech)', description: 'सिव्हिल, मेकॅनिकल, इलेक्ट्रिकल इंजिनिअर', category: 'job' },
  { id: 'teacher', label: '👨‍🏫 शिक्षक / प्राध्यापक', description: 'माध्यमिक शिक्षक, प्रोफेसर, कॉलेज', category: 'job' },
  { id: 'private_job', label: '💼 खाजगी नोकरी (Private Job)', description: 'कॉर्पोरेट, खाजगी कंपनी, मॅनेजर', category: 'job' },
  { id: 'business', label: '🏢 व्यावसायिक / उद्योगपती', description: 'स्वतःचा व्यवसाय, व्यापारी, कॉन्ट्रॅक्टर', category: 'job' },
  { id: 'farmer', label: '🌾 शेतकरी', description: 'शेती, शेतकरी कुटुंब', category: 'job' },
  { id: 'rich_farmer_tag', label: '🌾 बागायतदार / समृद्ध शेती', description: 'मोठी बागायती शेती व बागायतदार', category: 'job' },
  { id: 'police_defense', label: '👮 पोलीस / सैन्यदल', description: 'महाराष्ट्र पोलीस, लष्कर, डिफेन्स', category: 'job' },
  { id: 'bank_officer', label: '🏦 बँक अधिकारी', description: 'राष्ट्रीयीकृत / खाजगी बँक ऑफिसर', category: 'job' },
  { id: 'lawyer_ca', label: '⚖️ वकील / सीए / फायनान्स', description: 'ऍडव्होकेट, सनदी लेखापाल, कोर्ट', category: 'job' },
  { id: 'architect_designer', label: '🎨 आर्किटेक्ट / डिझायनर', description: 'वास्तूविशारद, इंटीरियर, डिझायनिंग', category: 'job' },
  { id: 'pharmacist', label: '💊 फार्मासिस्ट / मेडिकल स्टोअर', description: 'बी.फार्म, डी.फार्म, औषध व्यवसाय', category: 'job' },

  // 🎓 शिक्षण व इतर टॅग्ज
  { id: 'highly_educated', label: '🎓 उच्च शिक्षित (Master\'s/PhD)', description: 'मास्टर्स, पोस्ट ग्रॅज्युएट, विद्यावाचस्पती', category: 'education' },
  { id: 'nri', label: '✈️ NRI / परदेशात स्थायिक', description: 'परदेशात नोकरी / वास्तव्यास असलेले', category: 'education' },
  { id: 'own_house', label: '🏡 स्वतःचे घर / बंगलो', description: 'स्वतःच्या मालकीचे घर व समृद्ध कुटुंब', category: 'education' },
  { id: 'vegetarian', label: '🌱 शुद्ध शाकाहारी', description: 'शाकाहारी आहार व सात्विक राहणीमान', category: 'education' },
];

export const PROFESSION_PRESETS = PROFILE_TAG_PRESETS.filter(t => t.category === 'job');

export function getTagStyleClass(tag: string): string {
  const lower = tag.toLowerCase();

  // 🛡️ Truecaller Verified
  if (lower.includes('truecaller')) {
    return 'bg-blue-100 text-blue-900 border-blue-400 font-black shadow-xs';
  }

  // 🌟 Admin Special / VIP / Featured / Premium
  if (lower.includes('ॲडमिन') || lower.includes('vip') || lower.includes('प्रीमियम') || lower.includes('रिकमेंडेड') || lower.includes('हॉट') || lower.includes('विशेष')) {
    return 'bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 text-[#800C1E] border-amber-500 font-black shadow-xs';
  }
  // 💔 Divorced / Remarriage / Widow
  if (lower.includes('घटस्फोटित') || lower.includes('पुनर्विवाह') || lower.includes('विधवा') || lower.includes('विभक्त')) {
    return 'bg-rose-100 text-rose-950 border-rose-300 font-extrabold';
  }
  // 🩺 Doctor
  if (lower.includes('डॉक्टर') || lower.includes('मेडिकल') || lower.includes('doctor')) {
    return 'bg-teal-100 text-teal-950 border-teal-400 font-black shadow-2xs';
  }
  // 🏛️ Govt Job / Class 1 / Police / Bank / MPSC
  if (lower.includes('सरकारी') || lower.includes('शासकीय') || lower.includes('क्लास') || lower.includes('वर्ग') || lower.includes('पोलीस') || lower.includes('बँक') || lower.includes('mpsc') || lower.includes('upsc')) {
    return 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-950 border-amber-400 font-black shadow-2xs';
  }
  // 💼 Private Job
  if (lower.includes('खाजगी') || lower.includes('प्रायव्हेट') || lower.includes('private')) {
    return 'bg-blue-100 text-blue-950 border-blue-300 font-extrabold';
  }
  // 💻 Engineer / IT
  if (lower.includes('इंजिनिअर') || lower.includes('it') || lower.includes('सॉफ्टवेअर') || lower.includes('कॉम्प्युटर') || lower.includes('engineer')) {
    return 'bg-cyan-100 text-cyan-950 border-cyan-400 font-black shadow-2xs';
  }
  // 👨‍🏫 Teacher / Professor / Highly Educated
  if (lower.includes('शिक्षक') || lower.includes('प्राध्यापक') || lower.includes('शिक्षित')) {
    return 'bg-indigo-100 text-indigo-950 border-indigo-300 font-extrabold';
  }
  // 🏢 Business
  if (lower.includes('व्यावसायिक') || lower.includes('व्यवसाय') || lower.includes('उद्योग') || lower.includes('उद्योजक')) {
    return 'bg-purple-100 text-purple-950 border-purple-300 font-extrabold';
  }
  // 🌾 Farmer
  if (lower.includes('शेतकरी') || lower.includes('शेती') || lower.includes('बागायतदार')) {
    return 'bg-emerald-100 text-emerald-950 border-emerald-400 font-extrabold';
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

/**
 * Returns structured profession hierarchy:
 * - isGovt: boolean (whether candidate has Govt / Semi-govt job)
 * - isDoctor: boolean (whether candidate is Doctor / Medical)
 * - isEngineer: boolean (whether candidate is Engineer / IT)
 * - isOfficer: boolean (whether Class-1/Class-2 / MPSC / UPSC officer)
 * - isTeacher: boolean (Professor / Teacher)
 * - isBusiness: boolean
 * - isFarmer: boolean
 * - primarySectorTag: string | null
 * - primaryRoleTag: string | null
 * - allBadges: string[]
 */
export function getStructuredProfessionInfo(profile: Partial<UserProfile>) {
  const occ = (profile.occupation || '').toLowerCase();
  const edu = (profile.education || '').toLowerCase();
  const comp = (profile.companyName || '').toLowerCase();
  const tags = (profile.professionTags || []).map(t => t.toLowerCase());
  const combined = `${occ} ${edu} ${comp} ${tags.join(' ')}`;

  const isGovt =
    profile.professionCategory === 'govt_job' ||
    tags.some(t => t.includes('सरकारी') || t.includes('शासकीय') || t.includes('govt')) ||
    /govt|government|सरकारी|शासकीय|mpsc|upsc|talathi|zilla|zila|police|पोलीस|तलाठी|तहसीलदार|ग्रामसेवक|maharashtra state|pwb|rto|revenue|officer|class-1|class-2/i.test(combined);

  const isDoctor =
    tags.some(t => t.includes('डॉक्टर') || t.includes('doctor') || t.includes('मेडिकल')) ||
    /doctor|doc\b|डॉक्टर|mbbs|bams|bhms|md\b|ms\b|bds|medical|वैद्यकीय|आरोग्य|क्लिनिक|hospital/i.test(combined);

  const isEngineer =
    tags.some(t => t.includes('इंजिनिअर') || t.includes('engineer') || t.includes('सॉफ्टवेअर')) ||
    /engineer|engg|इंजिनिअर|अभियंता|b\.e|btech|software|developer|it\b|आयटी|कॉम्प्युटर/i.test(combined);

  const isOfficer =
    tags.some(t => t.includes('वर्ग-१') || t.includes('वर्ग-२') || t.includes('सनदी') || t.includes('mpsc') || t.includes('upsc')) ||
    /वर्ग-१|वर्ग-२|सनदी|ias|ips|deputy collector|तहसीलदार|उपजिल्हाधिकारी|क्लास-१|class 1/i.test(combined);

  const isTeacher =
    tags.some(t => t.includes('शिक्षक') || t.includes('प्राध्यापक') || t.includes('teacher')) ||
    /teacher|professor|lecturer|शिक्षक|शिक्षिका|प्राध्यापक|गुरुजी|मास्तर|b\.ed|d\.ed/i.test(combined);

  const isPolice =
    tags.some(t => t.includes('पोलीस') || t.includes('सैन्यदल') || t.includes('police')) ||
    /पोलीस|सैन्यदल|police|army|crpf|defense|लष्कर|psi\b|pi\b/i.test(combined);

  const isBusiness =
    profile.professionCategory === 'business_self' ||
    tags.some(t => t.includes('व्यवसाय') || t.includes('व्यावसायिक') || t.includes('उद्योग')) ||
    /business|self employed|व्यवसाय|धंदा|उद्योग|व्यापारी|owner|proprietor|कॉन्ट्रॅक्टर/i.test(combined);

  const isFarmer =
    profile.professionCategory === 'agriculture_business' ||
    tags.some(t => t.includes('शेतकरी') || t.includes('शेती') || t.includes('बागायतदार')) ||
    /farmer|agriculture|शेतकरी|शेती|कृषी|बागायतदार/i.test(combined);

  const allBadges = getProfessionBadges(profile);

  const sectorBadges = allBadges.filter(b => 
    b.includes('सरकारी') || b.includes('खाजगी') || b.includes('व्यवसाय') || b.includes('शेती') || b.includes('निबंधक') || b.includes('शासकीय')
  );

  const roleBadges = allBadges.filter(b => 
    b.includes('डॉक्टर') || b.includes('इंजिनिअर') || b.includes('अधिकारी') || b.includes('वर्ग-') || b.includes('शिक्षक') || b.includes('पोलीस') || b.includes('वकील')
  );

  const otherBadges = allBadges.filter(b => !sectorBadges.includes(b) && !roleBadges.includes(b));

  return {
    isGovt,
    isDoctor,
    isEngineer,
    isOfficer,
    isTeacher,
    isPolice,
    isBusiness,
    isFarmer,
    sectorBadges: sectorBadges.length > 0 ? sectorBadges : allBadges.slice(0, 1),
    roleBadges: roleBadges.length > 0 ? roleBadges : allBadges.slice(1, 2),
    otherBadges: otherBadges.length > 0 ? otherBadges : allBadges.slice(2),
    allBadges
  };
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

  // Govt Job check
  const isGovt = /govt|government|सरकारी|शासकीय|mpsc|upsc|talathi|zilla|zila|police|पोलीस|तलाठी|तहसीलदार|ग्रामसेवक|maharashtra state|pwb|rto|revenue/i.test(combined);
  if (isGovt && !badges.some(b => b.includes('सरकारी'))) {
    badges.push('🏛️ सरकारी नोकरी');
  }

  // Class 1 / Class 2 Officer
  const isOfficer = /वर्ग-१|वर्ग-२|सनदी|ias|ips|deputy collector|तहसीलदार|उपजिल्हाधिकारी|क्लास-१|class 1/i.test(combined);
  if (isOfficer && !badges.some(b => b.includes('वर्ग-१') || b.includes('वर्ग-२'))) {
    badges.push('🏛️ वर्ग-१ / वर्ग-२ अधिकारी');
  }

  // Doctor check
  const isDoctor = /doctor|doc\b|डॉक्टर|mbbs|bams|bhms|md\b|ms\b|bds|medical|वैद्यकीय|आरोग्य/i.test(combined);
  if (isDoctor && !badges.some(b => b.includes('डॉक्टर'))) {
    badges.push('🩺 डॉक्टर');
  }

  // Engineer check
  const isEngg = /engineer|engg|इंजिनिअर|अभियंता|b\.e|btech|software|developer|it\b|आयटी|कॉम्प्युटर/i.test(combined);
  if (isEngg && !badges.some(b => b.includes('इंजिनिअर'))) {
    badges.push('💻 इंजिनिअर');
  }

  // Teacher / Professor check
  const isTeacher = /teacher|professor|lecturer|शिक्षक|शिक्षिका|प्राध्यापक|गुरुजी|मास्तर|b\.ed|d\.ed/i.test(combined);
  if (isTeacher && !badges.some(b => b.includes('शिक्षक') || b.includes('प्राध्यापक'))) {
    badges.push('👨‍🏫 शिक्षक / प्राध्यापक');
  }

  // Police / Defense check
  const isPolice = /पोलीस|सैन्यदल|police|army|crpf|defense|लष्कर/i.test(combined);
  if (isPolice && !badges.some(b => b.includes('पोलीस') || b.includes('सैन्यदल'))) {
    badges.push('👮 पोलीस / सैन्यदल');
  }

  // Business check
  const isBusiness = /business|self employed|व्यवसाय|धंदा|उद्योग|व्यापारी|owner|proprietor/i.test(combined);
  if (isBusiness && !badges.some(b => b.includes('व्यावसायिक') || b.includes('व्यवसाय'))) {
    badges.push('🏢 व्यावसायिक');
  }

  // Farmer check
  const isFarmer = /farmer|agriculture|शेतकरी|शेती|कृषी|बागायतदार/i.test(combined);
  if (isFarmer && !badges.some(b => b.includes('शेतकरी') || b.includes('बागायतदार'))) {
    badges.push('🌾 शेतकरी');
  }

  // Lawyer / CA check
  const isLawyer = /lawyer|advocate|वकील|ca\b|chartered|accountant/i.test(combined);
  if (isLawyer && !badges.some(b => b.includes('वकील') || b.includes('सीए'))) {
    badges.push('⚖️ वकील / सीए');
  }

  return badges;
}


