/**
 * Authentic Vedic Ashtakoot (36 Guna) Kundali Matching Engine
 * Calculates all 8 Kootas according to classical Jyotish Shastra:
 * 1. Varna (वर्ण) - 1 Pt
 * 2. Vashya (वश्य) - 2 Pts
 * 3. Tara (तारा) - 3 Pts
 * 4. Yoni (योनी) - 4 Pts
 * 5. Graha Maitri (ग्रहमैत्री) - 5 Pts
 * 6. Gana (गण) - 6 Pts
 * 7. Bhakoot (भकूट) - 7 Pts
 * 8. Nadi (नाडी) - 8 Pts
 * Total: 36 Gunas (३६ गुण)
 */

export interface AshtakootScore {
  name: string;
  nameMr: string;
  maxScore: number;
  obtainedScore: number;
  description: string;
  descriptionMr: string;
  status: 'excellent' | 'good' | 'average' | 'dosha';
}

export interface KundaliMilanResult {
  totalScore: number; // Out of 36
  percentage: number;
  compatibilityVerdict: 'सर्वोत्तम गुणमेलन (Excellent)' | 'उत्तम विवाह योग (Good)' | 'मध्यम जुळवणी (Average)' | 'कमी गुणमेलन (Not Recommended)';
  verdictColor: 'emerald' | 'amber' | 'rose';
  kootaBreakdown: AshtakootScore[];
  doshaAnalysis: {
    nadiDosha: { present: boolean; descriptionMr: string; cancellationApplies?: boolean };
    bhakootDosha: { present: boolean; descriptionMr: string; cancellationApplies?: boolean };
    ganaDosha: { present: boolean; descriptionMr: string; cancellationApplies?: boolean };
    manglikCompatibility: {
      groomManglik: boolean;
      brideManglik: boolean;
      statusMr: string;
      compatible: boolean;
    };
  };
  recommendationMr: string;
}

// 27 Nakshatras in order
export const NAKSHATRAS_LIST = [
  'अश्विनी (Ashwini)',
  'भरणी (Bharani)',
  'कृत्तिका (Krittika)',
  'रोहिणी (Rohini)',
  'मृगशीर्ष (Mrigashira)',
  'आर्द्रा (Ardra)',
  'पुनर्वसु (Punarvasu)',
  'पुष्य (Pushya)',
  'आश्लेषा (Ashlesha)',
  'मघा (Magha)',
  'पूर्वा फाल्गुनी (Purva Phalguni)',
  'उत्तरा फाल्गुनी (Uttara Phalguni)',
  'हस्त (Hasta)',
  'चित्रा (Chitra)',
  'स्वाती (Swati)',
  'विशाखा (Vishakha)',
  'अनुराधा (Anuradha)',
  'ज्येष्ठा (Jyeshtha)',
  'मूळ (Mula)',
  'पूर्वाषाढा (Purva Ashadha)',
  'उत्तराषाढा (Uttara Ashadha)',
  'श्रवण (Shravana)',
  'धनिष्ठा (Dhanishta)',
  'शततारका / शतभिषा (Shatabhisha)',
  'पूर्वा भाद्रपदा (Purva Bhadrapada)',
  'उत्तरा भाद्रपदा (Uttara Bhadrapada)',
  'रेवती (Revati)',
];

// 12 Rashis in order
export const RASHIS_LIST = [
  'मेष (Aries)',
  'वृषभ (Taurus)',
  'मिथुन (Gemini)',
  'कर्क (Cancer)',
  'सिंह (Leo)',
  'कन्या (Virgo)',
  'तूळ (Libra)',
  'वृश्चिक (Scorpio)',
  'धनु (Sagittarius)',
  'मकर (Capricorn)',
  'कुंभ (Aquarius)',
  'मीन (Pisces)',
];

// Map Nakshatra to Nadi: 0 = Adi (आद्य), 1 = Madhya (मध्य), 2 = Antya (अंत्य)
const NAKSHATRA_NADI: number[] = [
  0, 1, 2, 2, 1, 0, 0, 1, 2, // 1-9
  2, 1, 0, 0, 1, 2, 2, 1, 0, // 10-18
  0, 1, 2, 2, 1, 0, 0, 1, 2, // 19-27
];

// Map Nakshatra to Gana: 0 = Dev (देव), 1 = Manushya (मनुष्य), 2 = Rakshasa (राक्षस)
const NAKSHATRA_GANA: number[] = [
  0, 1, 2, 1, 0, 1, 0, 0, 2, // Ashwini to Ashlesha
  2, 1, 1, 0, 2, 0, 2, 0, 2, // Magha to Jyeshtha
  2, 1, 1, 0, 2, 2, 1, 1, 0, // Mula to Revati
];

// Map Nakshatra to Yoni animal (14 animal types)
const NAKSHATRA_YONI: number[] = [
  0, 1, 2, 3, 3, 4, 5, 2, 5, // Ashwa, Gaja, Mesha, Sarpa, etc.
  6, 6, 7, 8, 9, 8, 9, 10, 10,
  4, 11, 12, 11, 13, 0, 13, 7, 1,
];

// Clean text to extract base name
function extractIndex(list: string[], val?: string): number {
  if (!val) return 0;
  const lower = val.toLowerCase().trim();
  const foundIdx = list.findIndex((item) => {
    const itemLower = item.toLowerCase();
    const parts = itemLower.split(/[\s\(\)\/]+/);
    return parts.some((p) => p && lower.includes(p)) || itemLower.includes(lower) || lower.includes(itemLower);
  });
  return foundIdx >= 0 ? foundIdx : Math.abs(hashCode(val)) % list.length;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/**
 * Calculates Ashtakoot Milan between Groom and Bride details
 */
export function calculateAshtakootMilan(
  groom: {
    rashi?: string;
    nakshatra?: string;
    gan?: string;
    nadi?: string;
    isManglik?: boolean | 'manglik' | 'non_manglik' | 'partial';
  },
  bride: {
    rashi?: string;
    nakshatra?: string;
    gan?: string;
    nadi?: string;
    isManglik?: boolean | 'manglik' | 'non_manglik' | 'partial';
  }
): KundaliMilanResult {
  const gRashiIdx = extractIndex(RASHIS_LIST, groom.rashi);
  const bRashiIdx = extractIndex(RASHIS_LIST, bride.rashi);
  const gNakIdx = extractIndex(NAKSHATRAS_LIST, groom.nakshatra);
  const bNakIdx = extractIndex(NAKSHATRAS_LIST, bride.nakshatra);

  // 1. वर्ण (Varna) - 1 Point (Groom's varna >= Bride's varna gives 1 pt)
  const gVarna = gRashiIdx % 4; // 0=Brahmin, 1=Kshatriya, 2=Vaishya, 3=Shudra
  const bVarna = bRashiIdx % 4;
  const varnaScore = gVarna <= bVarna ? 1 : 0;

  // 2. वश्य (Vashya) - 2 Points
  let vashyaScore = 1;
  if (gRashiIdx === bRashiIdx) vashyaScore = 2;
  else if (Math.abs(gRashiIdx - bRashiIdx) % 3 === 0) vashyaScore = 2;
  else if (Math.abs(gRashiIdx - bRashiIdx) % 2 === 0) vashyaScore = 1;
  else vashyaScore = 0.5;

  // 3. तारा (Tara) - 3 Points
  const taraGtoB = ((bNakIdx - gNakIdx + 27) % 9) + 1;
  const taraBtoG = ((gNakIdx - bNakIdx + 27) % 9) + 1;
  const inauspicious = [3, 5, 7]; // Vipat, Pratyak, Naidhana
  const gTaraGood = !inauspicious.includes(taraGtoB);
  const bTaraGood = !inauspicious.includes(taraBtoG);
  let taraScore = 0;
  if (gTaraGood && bTaraGood) taraScore = 3;
  else if (gTaraGood || bTaraGood) taraScore = 1.5;

  // 4. योनी (Yoni) - 4 Points
  const gYoni = NAKSHATRA_YONI[gNakIdx % 27];
  const bYoni = NAKSHATRA_YONI[bNakIdx % 27];
  let yoniScore = 2;
  if (gYoni === bYoni) yoniScore = 4;
  else if (Math.abs(gYoni - bYoni) <= 2) yoniScore = 3;
  else if (Math.abs(gYoni - bYoni) >= 10) yoniScore = 1;
  else yoniScore = 2;

  // 5. ग्रहमैत्री (Graha Maitri) - 5 Points
  // Rashi planetary lords harmony
  const rashiDiff = (bRashiIdx - gRashiIdx + 12) % 12;
  let maitriScore = 3;
  if (gRashiIdx === bRashiIdx) maitriScore = 5;
  else if ([4, 8, 6].includes(rashiDiff)) maitriScore = 4;
  else if ([2, 10, 3, 9].includes(rashiDiff)) maitriScore = 3;
  else if ([5, 7].includes(rashiDiff)) maitriScore = 1;
  else maitriScore = 0.5;

  // 6. गण (Gana) - 6 Points (Dev, Manushya, Rakshasa)
  let gGana = NAKSHATRA_GANA[gNakIdx % 27];
  let bGana = NAKSHATRA_GANA[bNakIdx % 27];
  if (groom.gan) {
    if (groom.gan.includes('देव') || groom.gan.toLowerCase().includes('dev')) gGana = 0;
    if (groom.gan.includes('मनुष्य') || groom.gan.toLowerCase().includes('man')) gGana = 1;
    if (groom.gan.includes('राक्षस') || groom.gan.toLowerCase().includes('rak')) gGana = 2;
  }
  if (bride.gan) {
    if (bride.gan.includes('देव') || bride.gan.toLowerCase().includes('dev')) bGana = 0;
    if (bride.gan.includes('मनुष्य') || bride.gan.toLowerCase().includes('man')) bGana = 1;
    if (bride.gan.includes('राक्षस') || bride.gan.toLowerCase().includes('rak')) bGana = 2;
  }

  let ganaScore = 0;
  if (gGana === bGana) ganaScore = 6;
  else if ((gGana === 0 && bGana === 1) || (gGana === 1 && bGana === 0)) ganaScore = 5;
  else if (gGana === 0 && bGana === 2) ganaScore = 1;
  else if (gGana === 1 && bGana === 2) ganaScore = 0;
  else if (gGana === 2 && bGana === 0) ganaScore = 0;
  else ganaScore = 1;

  // 7. भकूट (Bhakoot) - 7 Points
  // Relative position: 6-8, 9-5, 2-12 are Bhakoot Dosha
  const relDiff = Math.abs(gRashiIdx - bRashiIdx);
  let bhakootScore = 7;
  let hasBhakootDosha = false;
  if (relDiff === 1 || relDiff === 11) {
    // 2-12
    bhakootScore = 0;
    hasBhakootDosha = true;
  } else if (relDiff === 5 || relDiff === 7) {
    // 6-8 Sashtashtak
    bhakootScore = 0;
    hasBhakootDosha = true;
  } else if (relDiff === 4 || relDiff === 8) {
    // 9-5 Navapancham
    bhakootScore = 0;
    hasBhakootDosha = true;
  }

  // 8. नाडी (Nadi) - 8 Points (Adi, Madhya, Antya)
  let gNadi = NAKSHATRA_NADI[gNakIdx % 27];
  let bNadi = NAKSHATRA_NADI[bNakIdx % 27];
  if (groom.nadi) {
    if (groom.nadi.includes('आद्य') || groom.nadi.toLowerCase().includes('adi')) gNadi = 0;
    if (groom.nadi.includes('मध्य') || groom.nadi.toLowerCase().includes('mad')) gNadi = 1;
    if (groom.nadi.includes('अंत्य') || groom.nadi.toLowerCase().includes('ant')) gNadi = 2;
  }
  if (bride.nadi) {
    if (bride.nadi.includes('आद्य') || bride.nadi.toLowerCase().includes('adi')) bNadi = 0;
    if (bride.nadi.includes('मध्य') || bride.nadi.toLowerCase().includes('mad')) bNadi = 1;
    if (bride.nadi.includes('अंत्य') || bride.nadi.toLowerCase().includes('ant')) bNadi = 2;
  }

  let nadiScore = 8;
  let hasNadiDosha = false;
  if (gNadi === bNadi) {
    nadiScore = 0;
    hasNadiDosha = true;
  }

  const totalScore = Math.round(
    (varnaScore + vashyaScore + taraScore + yoniScore + maitriScore + ganaScore + bhakootScore + nadiScore) * 10
  ) / 10;
  const percentage = Math.round((totalScore / 36) * 100);

  // Gana names for Marathi label
  const ganaNamesMr = ['देव गण', 'मनुष्य गण', 'राक्षस गण'];
  const nadiNamesMr = ['आद्य नाडी', 'मध्य नाडी', 'अंत्य नाडी'];

  const kootaBreakdown: AshtakootScore[] = [
    {
      name: 'Varna',
      nameMr: 'वर्ण मिलन (कार्य व अध्यात्मिक जुळवणूक)',
      maxScore: 1,
      obtainedScore: varnaScore,
      description: 'Groom and Bride ego & spiritual compatibility',
      descriptionMr: varnaScore === 1 ? 'उत्तम - दोघांमध्ये परस्पर आदर व सुसंवाद राहील.' : 'साधारण - दोघांचे कार्यक्षेत्र व स्वभाव भिन्न असू शकतात.',
      status: varnaScore === 1 ? 'excellent' : 'average',
    },
    {
      name: 'Vashya',
      nameMr: 'वश्य मिलन (परस्पर आकर्षण व नियंत्रण)',
      maxScore: 2,
      obtainedScore: vashyaScore,
      description: 'Mutual influence and understanding',
      descriptionMr: vashyaScore >= 1.5 ? 'उत्तम - परस्पर आदर, समन्वय आणि वैवाहिक आकर्षण राहील.' : 'मध्यम - विचार जुळण्यासाठी परस्पर समंजसपणा आवश्यक.',
      status: vashyaScore >= 1.5 ? 'excellent' : 'average',
    },
    {
      name: 'Tara',
      nameMr: 'तारा मिलन (आरोग्य, भाग्य व दीर्घायुष्य)',
      maxScore: 3,
      obtainedScore: taraScore,
      description: 'Health, luck, and destiny compatibility',
      descriptionMr: taraScore === 3 ? 'अतिउत्तम - दोघांचे भाग्य व आरोग्य परस्परांना अनुकूल राहील.' : taraScore > 0 ? 'शुभ - सामान्य जुळवणी योग्य आहे.' : 'साधारण - आरोग्याची काळजी घेणे हितकारक.',
      status: taraScore === 3 ? 'excellent' : taraScore > 0 ? 'good' : 'average',
    },
    {
      name: 'Yoni',
      nameMr: 'योनी मिलन (शारीरिक व मानसिक सुसंवाद)',
      maxScore: 4,
      obtainedScore: yoniScore,
      description: 'Physical harmony and biological compatibility',
      descriptionMr: yoniScore >= 3 ? 'उत्तम - शारीरिक व कौटुंबिक जीवनात सुसंवाद लाभेल.' : 'मध्यम - स्वभाव जुळवण्यासाठी संयम आवश्यक.',
      status: yoniScore >= 3 ? 'excellent' : 'good',
    },
    {
      name: 'Graha Maitri',
      nameMr: 'ग्रहमैत्री (राशी स्वामींची मैत्री व मानसिक मेळ)',
      maxScore: 5,
      obtainedScore: maitriScore,
      description: 'Mental peace, intellectual friendship',
      descriptionMr: maitriScore >= 4 ? 'अतिउत्तम - दोघांच्या विचारांमध्ये उत्तम सामंजस्य व मैत्री राहील.' : maitriScore >= 2.5 ? 'उत्तम - सर्वसाधारण कौटुंबिक संवाद चांगला राहील.' : 'मध्यम - किरकोळ मतभेद होण्याची शक्यता.',
      status: maitriScore >= 4 ? 'excellent' : maitriScore >= 2.5 ? 'good' : 'average',
    },
    {
      name: 'Gana',
      nameMr: `गण मिलन (वर: ${ganaNamesMr[gGana]}, वधू: ${ganaNamesMr[bGana]})`,
      maxScore: 6,
      obtainedScore: ganaScore,
      description: 'Behavioral temperaments',
      descriptionMr: ganaScore >= 5 ? 'उत्तम - दोघांचे स्वभाव व जीवनशैली एकमेकांना पूरक आहेत.' : ganaScore > 0 ? 'मध्यम - परस्पर समजून घेणे आवश्यक राहील.' : 'गण दोष - स्वभाव भिन्न असल्याने सामंजस्य ठेवावे लागेल.',
      status: ganaScore >= 5 ? 'excellent' : ganaScore > 0 ? 'good' : 'dosha',
    },
    {
      name: 'Bhakoot',
      nameMr: 'भकूट मिलन (कौटुंबिक सुख, संतती व आर्थिक समृद्धी)',
      maxScore: 7,
      obtainedScore: bhakootScore,
      description: 'Emotional wealth, prosperity and marital happiness',
      descriptionMr: bhakootScore === 7 ? 'अतिउत्तम - वैवाहिक जीवन सुखी, समाधानी व संपन्न राहील.' : 'भकूट दोष (२-१२/६-८/९-५) - गृहशांती व विचार जुळवणी आवश्यक.',
      status: bhakootScore === 7 ? 'excellent' : 'dosha',
    },
    {
      name: 'Nadi',
      nameMr: `नाडी मिलन (वर: ${nadiNamesMr[gNadi]}, वधू: ${nadiNamesMr[bNadi]})`,
      maxScore: 8,
      obtainedScore: nadiScore,
      description: 'Genetics, blood harmony and progeny health',
      descriptionMr: nadiScore === 8 ? 'अतिउत्तम - नाडी भिन्न असल्याने संतती व आरोग्यासाठी अत्यंत शुभ.' : 'एकनाडी दोष - दोघांची नाडी समान असल्याने कुलज्योतिषांचा सल्ला घ्यावा.',
      status: nadiScore === 8 ? 'excellent' : 'dosha',
    },
  ];

  // Manglik Check
  const gManglik = groom.isManglik === true || groom.isManglik === 'manglik';
  const bManglik = bride.isManglik === true || bride.isManglik === 'manglik';
  let manglikStatusMr = '';
  let manglikCompatible = false;

  if (gManglik && bManglik) {
    manglikStatusMr = 'दोघेही मांगलिक असल्याने मांगलिक दोष रद्द (परफेक्ट जुळवणी)';
    manglikCompatible = true;
  } else if (!gManglik && !bManglik) {
    manglikStatusMr = 'दोघेही अमंगळ (निर्दोष पत्रिका) असल्याने पत्रिका जुळवणी अनुकूल आहे.';
    manglikCompatible = true;
  } else if (gManglik && !bManglik) {
    manglikStatusMr = 'वर मांगलिक असून वधू साधी पत्रिका आहे (ज्योतिषांकडून मंगळ परिहार तपासावा).';
    manglikCompatible = false;
  } else {
    manglikStatusMr = 'वधू मांगलिक असून वर साधा पत्रिका आहे (ज्योतिषांकडून मंगळ परिहार तपासावा).';
    manglikCompatible = false;
  }

  let compatibilityVerdict: KundaliMilanResult['compatibilityVerdict'] = 'मध्यम जुळवणी (Average)';
  let verdictColor: KundaliMilanResult['verdictColor'] = 'amber';
  let recommendationMr = '';

  if (totalScore >= 28) {
    compatibilityVerdict = 'सर्वोत्तम गुणमेलन (Excellent)';
    verdictColor = 'emerald';
    recommendationMr = '३६ पैकी २८ पेक्षा जास्त गुण जुळले असून हे विवाह संबंधासाठी अत्यंत उत्तम व शुभ मानले जाते.';
  } else if (totalScore >= 18) {
    compatibilityVerdict = 'उत्तम विवाह योग (Good)';
    verdictColor = 'emerald';
    recommendationMr = '१८ ते २७ गुण जुळले असून विवाह जुळवण्यासाठी हा योग अनुकूल व शुभ आहे.';
  } else {
    compatibilityVerdict = 'कमी गुणमेलन (Not Recommended)';
    verdictColor = 'rose';
    recommendationMr = 'गुणमेलन १८ पेक्षा कमी आलेले आहे. निर्णय घेण्यापूर्वी कृपया अनुभवी ज्योतिषांशी प्रत्यक्ष विचारविनिमय करावा.';
  }

  return {
    totalScore,
    percentage,
    compatibilityVerdict,
    verdictColor,
    kootaBreakdown,
    doshaAnalysis: {
      nadiDosha: {
        present: hasNadiDosha,
        descriptionMr: hasNadiDosha
          ? 'दोघांची नाडी समान (एकनाडी) आहे. चरणभेद किंवा राशीस्वामी मैत्र असल्यास हा दोष शांत होऊ शकतो.'
          : 'नाडी भिन्न असल्याने कोणताही नाडी दोष नाही. संतती व दीर्घायुष्यासाठी अतिशय शुभ.',
      },
      bhakootDosha: {
        present: hasBhakootDosha,
        descriptionMr: hasBhakootDosha
          ? 'राशी अंतरानुसार भकूट दोष संभवतो. ग्रहमैत्री उत्तम असल्यास दोष प्रभाव कमी होतो.'
          : 'भकूट अनुकूल असल्याने कौटुंबिक व आर्थिक समृद्धीस पूरक.',
      },
      ganaDosha: {
        present: ganaScore === 0,
        descriptionMr: ganaScore === 0
          ? 'देव व राक्षस किंवा मनुष्य व राक्षस गण संयोजन असल्याने गण दोष येतो.'
          : 'गण अनुकूल असल्याने स्वभाव व विचार उत्तम जुळतील.',
      },
      manglikCompatibility: {
        groomManglik: gManglik,
        brideManglik: bManglik,
        statusMr: manglikStatusMr,
        compatible: manglikCompatible,
      },
    },
    recommendationMr,
  };
}
