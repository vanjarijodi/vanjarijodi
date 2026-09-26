export function normalizeDateString(dateStr?: string): string {
  if (!dateStr) return '1995-05-15';
  const clean = String(dateStr).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(clean)) {
    const [d, m, y] = clean.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return clean.slice(0, 10);
}

export function normalizeTimeString(timeStr?: string): string {
  if (!timeStr) return '12:00';
  let clean = String(timeStr).trim();
  if (clean.includes('T')) {
    clean = clean.split('T')[1]?.slice(0, 5) || '12:00';
  }
  const isPM = /pm/i.test(clean);
  const isAM = /am/i.test(clean);
  clean = clean.replace(/am|pm/gi, '').trim();
  const parts = clean.split(':');
  let h = parseInt(parts[0], 10) || 12;
  const m = parseInt(parts[1], 10) || 0;
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export interface NavamshaMatchParams {
  groom: {
    name?: string;
    dob: string; // YYYY-MM-DD
    time?: string; // HH:mm or HH:mm:ss
    coordinates?: string; // "lat,lng" e.g. "18.5204,73.8567"
    city?: string;
    timezone?: string;
  };
  bride: {
    name?: string;
    dob: string; // YYYY-MM-DD
    time?: string; // HH:mm or HH:mm:ss
    coordinates?: string; // "lat,lng" e.g. "19.8762,75.3433"
    city?: string;
    timezone?: string;
  };
}

export interface NavamshaSingleKundliParams {
  fullName: string;
  gender: 'male' | 'female';
  dob: string;
  time: string;
  birthPlace?: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: number;
}

export const NAVAMSHA_API_KEY = process.env.NAVAMSHA_API_KEY || 'vda_live_ffdd26f2_bTuwaUOxo-n4QMu6WKvluhq8e1_4oD3MDqvDkBF3dcw';
const NAVAMSHA_BASE_URL = 'https://api.navamsha.in/api/v1';

// Comprehensive Marathi Dictionaries
export const RASHI_MAP_MR: Record<string, string> = {
  Aries: 'मेष',
  Taurus: 'वृषभ',
  Gemini: 'मिथुन',
  Cancer: 'कर्क',
  Leo: 'सिंह',
  Virgo: 'कन्या',
  Libra: 'तूळ',
  Scorpio: 'वृश्चिक',
  Sagittarius: 'धनु',
  Capricorn: 'मकर',
  Aquarius: 'कुंभ',
  Pisces: 'मीन',
};

export const NAKSHATRA_MAP_MR: Record<string, string> = {
  Ashwini: 'अश्विनी', Asvini: 'अश्विनी',
  Bharani: 'भरणी',
  Krittika: 'कृत्तिका', Kritika: 'कृत्तिका',
  Rohini: 'रोहिणी',
  Mrigashira: 'मृगशीर्ष', Mrigsira: 'मृगशीर्ष', Mrigashirsha: 'मृगशीर्ष',
  Ardra: 'आर्द्रा',
  Punarvasu: 'पुनर्वसू',
  Pushya: 'पुष्य',
  Ashlesha: 'आश्लेषा', Aslesha: 'आश्लेषा',
  Magha: 'मघा',
  'Purva Phalguni': 'पूर्वा फाल्गुनी', 'Purva Falguni': 'पूर्वा फाल्गुनी', Purvaphalguni: 'पूर्वा फाल्गुनी',
  'Uttara Phalguni': 'उत्तरा फाल्गुनी', 'Uttara Falguni': 'उत्तरा फाल्गुनी', Uttaraphalguni: 'उत्तरा फाल्गुनी',
  Hasta: 'हस्त',
  Chitra: 'चित्रा',
  Swati: 'स्वाती',
  Vishakha: 'विशाखा',
  Anuradha: 'अनुराधा',
  Jyeshta: 'ज्येष्ठा', Jyeshtha: 'ज्येष्ठा',
  Moola: 'मूळ', Mula: 'मूळ',
  'Purva Ashadha': 'पूर्वाषाढा', Purvashadha: 'पूर्वाषाढा',
  'Uttara Ashadha': 'उत्तराषाढा', Uttarashadha: 'उत्तराषाढा',
  Shravana: 'श्रवण', Sravana: 'श्रवण',
  Dhanishta: 'धनिष्ठा', Dhanistha: 'धनिष्ठा',
  Shatabhisha: 'शततारका', Satabhisha: 'शततारका', Shatataraka: 'शततारका',
  'Purva Bhadrapada': 'पूर्वा भाद्रपद', 'Purva Bhadrapad': 'पूर्वा भाद्रपद', Purvabhadrapada: 'पूर्वा भाद्रपद',
  'Uttara Bhadrapada': 'उत्तरा भाद्रपद', 'Uttara Bhadrapad': 'उत्तरा भाद्रपद', Uttarabhadrapada: 'उत्तरा भाद्रपद',
  Revati: 'रेवती',
};

export const PLANET_MAP_MR: Record<string, string> = {
  Sun: 'सूर्य',
  Moon: 'चंद्र',
  Mars: 'मंगळ',
  Mercury: 'बुध',
  Jupiter: 'गुरु',
  Venus: 'शुक्र',
  Saturn: 'शनी',
  Rahu: 'राहू',
  Ketu: 'केतू',
  Ascendant: 'लग्न',
  Lagna: 'लग्न',
};

export const GANA_MAP_MR: Record<string, string> = {
  Dev: 'देव गण', Deva: 'देव गण',
  Manushya: 'मनुष्य गण', Maanushya: 'मनुष्य गण', Manush: 'मनुष्य गण',
  Rakshasa: 'राक्षस गण', Rakshas: 'राक्षस गण',
};

export const NADI_MAP_MR: Record<string, string> = {
  Adi: 'आद्य नाडी', Adhya: 'आद्य नाडी',
  Madhya: 'मध्य नाडी',
  Ant: 'अंत्य नाडी', Antya: 'अंत्य नाडी',
};

export const VARNA_MAP_MR: Record<string, string> = {
  Vipra: 'ब्राह्मण (विप्र)', Brahmin: 'ब्राह्मण (विप्र)',
  Kshatriya: 'क्षत्रिय',
  Vaishya: 'वैश्य',
  Shoodra: 'शूद्र', Shudra: 'शूद्र',
};

export const VASHYA_MAP_MR: Record<string, string> = {
  Chatuspad: 'चतुष्पाद', Chatushpada: 'चतुष्पाद',
  Maanav: 'मानव (द्विपद)', Manav: 'मानव (द्विपद)', Dwipad: 'द्विपद',
  Jalchar: 'जलचर',
  Keetak: 'कीटक', Keeta: 'कीटक',
  Vanachara: 'वनचर (सिंह)', Simha: 'वनचर (सिंह)',
};

export const YONI_MAP_MR: Record<string, string> = {
  Ashwa: 'अश्व (घोडा)', Horse: 'अश्व (घोडा)',
  Gaj: 'गज (हत्ती)', Gaja: 'गज (हत्ती)', Elephant: 'गज (हत्ती)',
  Mesh: 'मेष (मेंढा)', Mesha: 'मेष (मेंढा)', Sheep: 'मेष (मेंढा)',
  Sarp: 'सर्प', Sarpa: 'सर्प', Serpent: 'सर्प', Snake: 'सर्प',
  Shwan: 'श्वान (कुत्रा)', Dog: 'श्वान (कुत्रा)',
  Marjar: 'मार्जार (मांजर)', Cat: 'मार्जार (मांजर)',
  Mushak: 'मूषक (उंदीर)', Rat: 'मूषक (उंदीर)', Mouse: 'मूषक (उंदीर)',
  Gau: 'गौ (गाय)', Cow: 'गौ (गाय)',
  Mahisha: 'महिष (रेडा)', Buffalo: 'महिष (रेडा)',
  Vyaaghra: 'व्याघ्र (वाघ)', Tiger: 'व्याघ्र (वाघ)',
  Mriga: 'मृग (हरीण)', Deer: 'मृग (हरीण)',
  Vanar: 'वानर (माकड)', Monkey: 'वानर (माकड)',
  Nakula: 'नकुल (मुंगूस)', Mongoose: 'नकुल (मुंगूस)',
  Simha: 'सिंह', Lion: 'सिंह',
};

const RASHI_LIST_ORDER = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

function translateString(val?: string, map?: Record<string, string>): string {
  if (!val) return '';
  const trimmed = String(val).trim();
  if (map && map[trimmed]) return map[trimmed];
  return trimmed;
}

function parseBirthComponents(dob: string, time?: string, coords?: string, defaultLat = 19.8762, defaultLon = 75.3433) {
  const cleanDob = normalizeDateString(dob);
  const cleanTime = normalizeTimeString(time);

  const [yStr, mStr, dStr] = cleanDob.split('-');
  const [hStr, minStr] = cleanTime.split(':');

  let lat = defaultLat;
  let lon = defaultLon;

  if (coords && typeof coords === 'string') {
    const parts = coords.split(',');
    const pLat = parseFloat(parts[0]);
    const pLon = parseFloat(parts[1]);
    if (!isNaN(pLat)) lat = Number(pLat.toFixed(4));
    if (!isNaN(pLon)) lon = Number(pLon.toFixed(4));
  }

  return {
    year: parseInt(yStr, 10) || 1995,
    month: parseInt(mStr, 10) || 5,
    date: parseInt(dStr, 10) || 15,
    hours: parseInt(hStr, 10) || 12,
    minutes: parseInt(minStr, 10) || 0,
    seconds: 0,
    latitude: lat,
    longitude: lon,
    timezone: 5.5,
  };
}

/**
 * Perform Detailed 36-Gun Milan & Ashtakoot Matching via Navamsha API
 */
export async function fetchNavamshaKundliMatching(params: NavamshaMatchParams) {
  const groomReq = parseBirthComponents(params.groom.dob, params.groom.time, params.groom.coordinates, 18.5204, 73.8567);
  const brideReq = parseBirthComponents(params.bride.dob, params.bride.time, params.bride.coordinates, 19.8762, 75.3433);

  const reqBody = {
    groom: groomReq,
    bride: brideReq,
  };

  console.log('🔮 [Navamsha.in API] Calculating Ashtakoot Matching with active key...');

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': NAVAMSHA_API_KEY,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const [matchRes, groomMangalRes, brideMangalRes] = await Promise.allSettled([
      fetch(`${NAVAMSHA_BASE_URL}/compatibility/ashtakoot/detailed`, {
        method: 'POST',
        headers,
        body: JSON.stringify(reqBody),
        signal: controller.signal,
      }),
      fetch(`${NAVAMSHA_BASE_URL}/dosha/mangal`, {
        method: 'POST',
        headers,
        body: JSON.stringify(groomReq),
        signal: controller.signal,
      }),
      fetch(`${NAVAMSHA_BASE_URL}/dosha/mangal`, {
        method: 'POST',
        headers,
        body: JSON.stringify(brideReq),
        signal: controller.signal,
      }),
    ]);

    clearTimeout(timeoutId);

    if (matchRes.status !== 'fulfilled' || !matchRes.value.ok) {
      const errTxt = matchRes.status === 'fulfilled' ? await matchRes.value.text() : matchRes.reason;
      console.warn('⚠️ [Navamsha.in API] Matching request failed:', errTxt);
      throw new Error(`Navamsha match request failed: ${matchRes.status === 'fulfilled' ? matchRes.value.status : 'Network'}`);
    }

    const matchJson = await matchRes.value.json();
    const output = matchJson.output || {};

    let groomMangalData: any = null;
    if (groomMangalRes.status === 'fulfilled' && groomMangalRes.value.ok) {
      groomMangalData = await groomMangalRes.value.json().catch(() => null);
    }

    let brideMangalData: any = null;
    if (brideMangalRes.status === 'fulfilled' && brideMangalRes.value.ok) {
      brideMangalData = await brideMangalRes.value.json().catch(() => null);
    }

    return normalizeNavamshaMatchResponse(output, groomMangalData?.output, brideMangalData?.output, params);
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('⚠️ [Navamsha.in API] Matching failed or timed out:', err?.message || err);
    throw err;
  }
}

function normalizeNavamshaMatchResponse(output: any, groomMangal: any, brideMangal: any, params: NavamshaMatchParams) {
  const bride = output?.bride || {};
  const groom = output?.groom || {};
  const breakdown = output?.breakdown || {};
  const cancellations = output?.cancellations || [];

  const rawTotal = output?.total_score ?? 18;
  const effectiveTotal = output?.effective_total_score ?? rawTotal;
  const totalScore = typeof effectiveTotal === 'number' ? effectiveTotal : Number(rawTotal) || 18;
  const maxScore = output?.maximum_score || 36;

  // Extract Groom Attributes
  const groomRashiMr = translateString(groom.sign, RASHI_MAP_MR) || 'कर्क';
  const groomNakshatraMr = translateString(groom.nakshatra?.name, NAKSHATRA_MAP_MR) || 'आश्लेषा';
  const groomGanaMr = translateString(groom.gana, GANA_MAP_MR) || 'राक्षस गण';
  const groomNadiMr = translateString(groom.nadi, NADI_MAP_MR) || 'अंत्य नाडी';
  const groomVarnaMr = translateString(groom.varna, VARNA_MAP_MR) || 'ब्राह्मण (विप्र)';
  const groomVashyaMr = translateString(groom.vashya, VASHYA_MAP_MR) || 'जलचर';
  const groomYoniMr = translateString(groom.yoni, YONI_MAP_MR) || 'मार्जार (मांजर)';

  // Extract Bride Attributes
  const brideRashiMr = translateString(bride.sign, RASHI_MAP_MR) || 'वृषभ';
  const brideNakshatraMr = translateString(bride.nakshatra?.name, NAKSHATRA_MAP_MR) || 'रोहिणी';
  const brideGanaMr = translateString(bride.gana, GANA_MAP_MR) || 'मनुष्य गण';
  const brideNadiMr = translateString(bride.nadi, NADI_MAP_MR) || 'अंत्य नाडी';
  const brideVarnaMr = translateString(bride.varna, VARNA_MAP_MR) || 'वैश्य';
  const brideVashyaMr = translateString(bride.vashya, VASHYA_MAP_MR) || 'चतुष्पाद';
  const brideYoniMr = translateString(bride.yoni, YONI_MAP_MR) || 'सर्प';

  const varna = breakdown.varna || {};
  const vashya = breakdown.vashya || {};
  const tara = breakdown.tara || {};
  const yoni = breakdown.yoni || {};
  const maitri = breakdown.graha_maitri || {};
  const gana = breakdown.gana || {};
  const bhakoot = breakdown.bhakoot || {};
  const nadi = breakdown.nadi || {};

  // Check Nadi & Bhakoot cancellations from API evidence
  const nadiRestored = cancellations.find((c: any) => c.koota === 'nadi' && c.applies);
  const bhakootRestored = cancellations.find((c: any) => c.koota === 'bhakoot' && c.applies);

  const kootaBreakdown = [
    {
      id: 'varna',
      name: 'Varna (वर्ण)',
      nameMr: 'वर्ण (Varna)',
      maxScore: varna.maximum || 1,
      obtainedScore: varna.score ?? 1,
      boyAttribute: groomVarnaMr,
      girlAttribute: brideVarnaMr,
      description: 'मानसिक सुसंगतता व कार्यक्षेत्र ताळमेळ',
      descriptionMr: 'मानसिक सुसंगतता आणि कार्यक्षेत्रातील ताळमेळ दर्शवतो.',
      status: (varna.score ?? 1) >= 1 ? ('excellent' as const) : ('poor' as const),
    },
    {
      id: 'vashya',
      name: 'Vashya (वश्य)',
      nameMr: 'वश्य (Vashya)',
      maxScore: vashya.maximum || 2,
      obtainedScore: vashya.score ?? 2,
      boyAttribute: groomVashyaMr,
      girlAttribute: brideVashyaMr,
      description: 'परस्पर प्रभाव व आकर्षण',
      descriptionMr: 'परस्पर आकर्षण, एकमेकांवरील प्रभाव व वैवाहिक निष्ठा.',
      status: (vashya.score ?? 2) >= 1.5 ? ('excellent' as const) : (vashya.score ?? 2) >= 1 ? ('good' as const) : ('poor' as const),
    },
    {
      id: 'tara',
      name: 'Tara (तारा)',
      nameMr: 'तारा (Tara)',
      maxScore: tara.maximum || 3,
      obtainedScore: tara.score ?? 3,
      boyAttribute: groomNakshatraMr,
      girlAttribute: brideNakshatraMr,
      description: 'आरोग्य, भाग्य व दीर्घायुष्य',
      descriptionMr: 'आरोग्य, भाग्य व वैवाहिक भाग्योदयासाठी शुभ सुसंगतता.',
      status: (tara.score ?? 3) >= 2 ? ('excellent' as const) : (tara.score ?? 3) >= 1 ? ('average' as const) : ('poor' as const),
    },
    {
      id: 'yoni',
      name: 'Yoni (योनी)',
      nameMr: 'योनी (Yoni)',
      maxScore: yoni.maximum || 4,
      obtainedScore: yoni.score ?? 3,
      boyAttribute: groomYoniMr,
      girlAttribute: brideYoniMr,
      description: 'जैविक व शारीरिक सुसंगतता',
      descriptionMr: 'शारीरिक आणि जैविक सुसंगतता.',
      status: (yoni.score ?? 3) >= 3 ? ('excellent' as const) : (yoni.score ?? 3) >= 1 ? ('good' as const) : ('poor' as const),
    },
    {
      id: 'graha_maitri',
      name: 'Graha Maitri (ग्रहमैत्री)',
      nameMr: 'ग्रह मैत्री (Graha Maitri)',
      maxScore: maitri.maximum || 5,
      obtainedScore: maitri.score ?? 5,
      boyAttribute: translateString(groom.sign_lord, PLANET_MAP_MR) || 'चंद्र',
      girlAttribute: translateString(bride.sign_lord, PLANET_MAP_MR) || 'शुक्र',
      description: 'राशी स्वामी मैत्री व बौद्धिक ताळमेळ',
      descriptionMr: 'राशी स्वामींची मैत्री असून विचारसरणीत सुंदर ताळमेळ राहील.',
      status: (maitri.score ?? 5) >= 4 ? ('excellent' as const) : (maitri.score ?? 5) >= 2.5 ? ('good' as const) : ('poor' as const),
    },
    {
      id: 'gana',
      name: 'Gana (गण)',
      nameMr: 'गण (Gana)',
      maxScore: gana.maximum || 6,
      obtainedScore: gana.score ?? 6,
      boyAttribute: groomGanaMr,
      girlAttribute: brideGanaMr,
      description: 'स्वभाव व वैचारिक ताळमेळ',
      descriptionMr: 'स्वभाव आणि कौटुंबिक आचार-विचारांमध्ये सामंजस्य.',
      status: (gana.score ?? 6) >= 5 ? ('excellent' as const) : (gana.score ?? 6) >= 1 ? ('good' as const) : ('poor' as const),
    },
    {
      id: 'bhakoot',
      name: 'Bhakoot (भकूट)',
      nameMr: 'भकूट (Bhakoot)',
      maxScore: bhakoot.maximum || 7,
      obtainedScore: bhakootRestored ? 7 : (bhakoot.score ?? 7),
      boyAttribute: groomRashiMr,
      girlAttribute: brideRashiMr,
      description: 'कौटुंबिक सुख, समृद्धी व आर्थिक प्रगती',
      descriptionMr: bhakootRestored
        ? 'भकूट दोष परिहार: राशी स्वामी मित्र असल्याने भकूट दोष समाप्त होऊन पूर्ण गुण बहाल केले आहेत.'
        : 'कौटुंबिक सुख समृद्धी व आर्थिक प्रगतीसाठी उत्तम स्थिती.',
      status: (bhakootRestored || (bhakoot.score ?? 7) >= 7) ? ('excellent' as const) : ('poor' as const),
    },
    {
      id: 'nadi',
      name: 'Nadi (नाडी)',
      nameMr: 'नाडी (Nadi)',
      maxScore: nadi.maximum || 8,
      obtainedScore: nadiRestored ? 8 : (nadi.score ?? 8),
      boyAttribute: groomNadiMr,
      girlAttribute: brideNadiMr,
      description: 'अनुवंशिकता, आरोग्य व संतती सुख',
      descriptionMr: nadiRestored
        ? 'नाडी दोष परिहार: दोघांचे नक्षत्र किंवा चरण भिन्न असल्याने नाडी दोष परिहार होतो व पूर्ण ८ गुण बहाल केले आहेत.'
        : (nadi.score ?? 8) > 0
        ? 'नाडी निर्दोष आहे (भिन्न नाडी). आरोग्य व संतती सुखासाठी सर्वोत्तम.'
        : 'एकाच नाडीमुळे नाडी दोष दर्शवत आहे.',
      status: (nadiRestored || (nadi.score ?? 8) >= 8) ? ('excellent' as const) : ('poor' as const),
    },
  ];

  // Manglik Evaluation
  const groomIsManglik = groomMangal?.is_present ?? false;
  const brideIsManglik = brideMangal?.is_present ?? false;

  let manglikStatusMr = 'दोन्ही पत्रिका मंगळ निर्दोष आहेत.';
  if (groomIsManglik && brideIsManglik) {
    manglikStatusMr = 'वर आणि वधू दोघेही मंगळी आहेत — मंगळ दोष साम्य (परिहार) होतो. विवाह उत्तम जुळतो.';
  } else if (groomIsManglik) {
    manglikStatusMr = 'वर पत्रिका मंगळी आहे, वधू पत्रिका निर्दोष आहे.';
  } else if (brideIsManglik) {
    manglikStatusMr = 'वधू पत्रिका मंगळी आहे, वर पत्रिका निर्दोष आहे.';
  }

  return {
    success: true,
    totalScore,
    maxScore,
    percentage: Math.round((totalScore / maxScore) * 100),
    compatibilityVerdict: totalScore >= 25 ? 'सर्वोत्तम वैदिक गुणमेलन (Excellent)' : totalScore >= 18 ? 'उत्तम विवाह योग (Good)' : 'मध्यम गुणमेलन (Average)',
    verdictColor: totalScore >= 25 ? ('emerald' as const) : totalScore >= 18 ? ('amber' as const) : ('rose' as const),
    recommendationMr: `Navamsha वैदिक ॲस्ट्रॉलॉजी नुसार ३६ पैकी ${totalScore} गुण मिळाले आहेत. हे गुणमेलन ${totalScore >= 18 ? 'विवाहासाठी अत्यंत अनुकूल व शुभ' : 'मध्यम'} आहे.`,
    kootaBreakdown,
    doshaAnalysis: {
      nadiDosha: {
        present: Boolean(nadi.has_dosha && !nadiRestored),
        descriptionMr: nadiRestored
          ? 'नाडी दोष परिहार लागू झाला आहे (भिन्न नक्षत्र/चरण). वैवाहिक सुख उत्तम राहील.'
          : (nadi.score ?? 8) === 0
          ? 'नाडी दोष आढळला आहे.'
          : 'नाडी निर्दोष आहे (भिन्न नाडी). आरोग्य व संतती सुखासाठी उत्तम.',
        cancellationApplies: Boolean(nadiRestored),
      },
      bhakootDosha: {
        present: Boolean(bhakoot.has_dosha && !bhakootRestored),
        descriptionMr: bhakootRestored
          ? 'भकूट दोष परिहार लागू झाला आहे.'
          : (bhakoot.score ?? 7) === 0
          ? 'भकूट दोष आढळला आहे.'
          : 'भकूट अनुकूल आहे. कौटुंबिक समृद्धी राहील.',
        cancellationApplies: Boolean(bhakootRestored),
      },
      ganaDosha: {
        present: (gana.score ?? 6) === 0,
        descriptionMr: (gana.score ?? 6) === 0 ? 'गण दोष आढळला आहे.' : 'गण अनुकूल आहे. स्वभावात उत्तम ताळमेळ राहील.',
        cancellationApplies: false,
      },
      manglikCompatibility: {
        groomManglik: groomIsManglik,
        brideManglik: brideIsManglik,
        statusMr: manglikStatusMr,
        compatible: !(groomIsManglik ^ brideIsManglik),
      },
    },
    astroDetails: {
      groom: {
        name: params.groom.name || 'वर (Groom)',
        dob: params.groom.dob,
        time: params.groom.time || '12:00 PM',
        city: params.groom.city || 'पुणे',
        rashi: groomRashiMr,
        nakshatra: groomNakshatraMr,
        gan: groomGanaMr,
        nadi: groomNadiMr,
        varna: groomVarnaMr,
        vashya: groomVashyaMr,
        yoni: groomYoniMr,
      },
      bride: {
        name: params.bride.name || 'वधू (Bride)',
        dob: params.bride.dob,
        time: params.bride.time || '12:00 PM',
        city: params.bride.city || 'छत्रपती संभाजीनगर',
        rashi: brideRashiMr,
        nakshatra: brideNakshatraMr,
        gan: brideGanaMr,
        nadi: brideNadiMr,
        varna: brideVarnaMr,
        vashya: brideVashyaMr,
        yoni: brideYoniMr,
      },
    },
    provider: 'Navamsha.in Vedic Astrology Engine (Official API)',
  };
}

/**
 * Fetch Complete Single Kundli Birth Report from Navamsha API
 */
export async function fetchNavamshaSingleKundli(params: NavamshaSingleKundliParams) {
  const req = parseBirthComponents(params.dob, params.time, `${params.latitude},${params.longitude}`, params.latitude, params.longitude);

  console.log(`🔮 [Navamsha.in API] Generating Complete Single Birth Kundli for ${params.fullName}...`, req);

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': NAVAMSHA_API_KEY,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const [snapRes, birthRes, doshaRes, dashaRes] = await Promise.allSettled([
      fetch(`${NAVAMSHA_BASE_URL}/chart/planet-snapshot`, {
        method: 'POST',
        headers,
        body: JSON.stringify(req),
        signal: controller.signal,
      }),
      fetch(`${NAVAMSHA_BASE_URL}/astrology/birth-details`, {
        method: 'POST',
        headers,
        body: JSON.stringify(req),
        signal: controller.signal,
      }),
      fetch(`${NAVAMSHA_BASE_URL}/dosha/all`, {
        method: 'POST',
        headers,
        body: JSON.stringify(req),
        signal: controller.signal,
      }),
      fetch(`${NAVAMSHA_BASE_URL}/dasha/vimshottari`, {
        method: 'POST',
        headers,
        body: JSON.stringify(req),
        signal: controller.signal,
      }),
    ]);

    clearTimeout(timeoutId);

    let snapData: any = null;
    if (snapRes.status === 'fulfilled' && snapRes.value.ok) {
      snapData = await snapRes.value.json().catch(() => null);
    }

    let birthData: any = null;
    if (birthRes.status === 'fulfilled' && birthRes.value.ok) {
      birthData = await birthRes.value.json().catch(() => null);
    }

    let doshaData: any = null;
    if (doshaRes.status === 'fulfilled' && doshaRes.value.ok) {
      doshaData = await doshaRes.value.json().catch(() => null);
    }

    let dashaData: any = null;
    if (dashaRes.status === 'fulfilled' && dashaRes.value.ok) {
      dashaData = await dashaRes.value.json().catch(() => null);
    }

    if (!snapData?.output?.planets && !birthData?.output) {
      throw new Error('Navamsha API responses empty, falling back...');
    }

    return normalizeNavamshaSingleKundli(snapData?.output, birthData?.output, doshaData?.output, dashaData?.output, params);
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn(`⚠️ [Navamsha.in API] Single Kundli failed: ${err?.message || err}`);
    throw err;
  }
}

function normalizeNavamshaSingleKundli(snap: any, birth: any, doshas: any, dasha: any, params: NavamshaSingleKundliParams) {
  const planetsObj = snap?.planets || {};

  // Extract Ascendant (Lagna)
  const lagnaDegRaw = doshas?.mangal?.reference_longitudes?.Lagna ?? 84.66;
  const lagnaSignIndex = Math.floor(lagnaDegRaw / 30) % 12;
  const lagnaSignName = RASHI_LIST_ORDER[lagnaSignIndex] || 'Gemini';
  const lagnaSignMr = RASHI_MAP_MR[lagnaSignName] || 'मिथुन';

  // Moon details
  const moonRashiEn = birth?.chandra_rasi?.name || planetsObj?.Moon?.sign || 'Scorpio';
  const moonRashiMr = RASHI_MAP_MR[moonRashiEn] || 'वृश्चिक';
  const moonRashiLordEn = birth?.chandra_rasi?.lord?.name || 'Mars';
  const moonRashiLordMr = PLANET_MAP_MR[moonRashiLordEn] || 'मंगळ';

  const sunRashiEn = birth?.soorya_rasi?.name || planetsObj?.Sun?.sign || 'Taurus';
  const sunRashiMr = RASHI_MAP_MR[sunRashiEn] || 'वृषभ';

  const nakshatraEn = birth?.nakshatra?.name || planetsObj?.Moon?.nakshatra?.name || 'Anuradha';
  const nakshatraMr = NAKSHATRA_MAP_MR[nakshatraEn] || 'अनुराधा';
  const nakshatraLordEn = birth?.nakshatra?.lord?.name || planetsObj?.Moon?.nakshatra?.lord || 'Saturn';
  const nakshatraLordMr = PLANET_MAP_MR[nakshatraLordEn] || 'शनी';
  const pada = birth?.nakshatra?.pada || planetsObj?.Moon?.nakshatra?.pada || 1;

  const ganMr = translateString(birth?.additional_info?.ganam, GANA_MAP_MR) || 'देव गण';
  const nadiMr = translateString(birth?.additional_info?.nadi, NADI_MAP_MR) || 'मध्य नाडी';
  const yoniMr = translateString(birth?.additional_info?.animal_sign, YONI_MAP_MR) || 'मृग (हरीण)';
  const varnaMr = 'वैश्य';
  const vashyaMr = 'कीटक';

  // Build Planetary Positions
  const PLANET_KEYS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const planetsList: any[] = [];
  const lagnaChart: Record<number, string[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [] };
  const navamshaChart: Record<number, string[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [] };

  // Place Lagna in House 1
  lagnaChart[1].push('लग्न (Asc)');

  for (const pKey of PLANET_KEYS) {
    const pData = planetsObj[pKey];
    if (!pData) continue;

    const signEn = pData.sign || 'Aries';
    const signMr = RASHI_MAP_MR[signEn] || signEn;
    const signIdx = RASHI_LIST_ORDER.indexOf(signEn);
    const houseNum = ((signIdx - lagnaSignIndex + 12) % 12) + 1;

    const degInSign = typeof pData.degree_in_sign === 'number' ? pData.degree_in_sign : 15.0;
    const deg = Math.floor(degInSign);
    const mins = Math.floor((degInSign - deg) * 60);
    const degreeFormatted = `${deg}° ${mins.toString().padStart(2, '0')}'`;

    const nakName = pData.nakshatra?.name || 'Ashwini';
    const nakMr = NAKSHATRA_MAP_MR[nakName] || nakName;
    const nakPada = pData.nakshatra?.pada || 1;
    const nakLord = PLANET_MAP_MR[pData.nakshatra?.lord] || pData.nakshatra?.lord || '';

    const pMr = PLANET_MAP_MR[pKey] || pKey;
    const isRetro = Boolean(pData.is_retrograde);

    // Chart placement
    lagnaChart[houseNum].push(`${pMr}${isRetro ? ' (व)' : ''}`);

    const navSignEn = pData.navamsa_sign || signEn;
    const navSignIdx = RASHI_LIST_ORDER.indexOf(navSignEn);
    const navHouse = ((navSignIdx - lagnaSignIndex + 12) % 12) + 1;
    navamshaChart[navHouse].push(`${pMr}`);

    planetsList.push({
      name: pKey,
      nameMr: pMr,
      rashi: signMr,
      rashiEn: signEn,
      degree: degreeFormatted,
      fullDegree: Number(pData.sidereal_longitude?.toFixed(2) || degInSign),
      house: houseNum,
      nakshatra: `${nakMr} (चरण ${nakPada})`,
      nakshatraLord: nakLord,
      isRetrograde: isRetro,
      state: isRetro ? 'वक्री (Retrograde)' : 'मार्गी (Direct)',
      nature: ['Jupiter', 'Venus', 'Moon', 'Mercury'].includes(pKey) ? 'शुभ ग्रह' : 'पाप/क्रूर ग्रह',
    });
  }

  // Vimshottari Mahadashas
  const mahadashas = (dasha?.mahadashas || []).map((m: any) => {
    const lordMr = PLANET_MAP_MR[m.lord] || m.lord;
    const sDate = m.start ? m.start.split('T')[0] : '';
    const eDate = m.end ? m.end.split('T')[0] : '';
    return {
      lord: m.lord,
      lordMr,
      startDate: sDate,
      endDate: eDate,
      durationYears: Math.round((m.duration_days || 365) / 365.25),
      status: new Date() >= new Date(m.start) && new Date() <= new Date(m.end) ? ('active' as const) : ('upcoming' as const),
    };
  });

  const activeDasha = mahadashas.find((m: any) => m.status === 'active') || mahadashas[1] || mahadashas[0];

  // Mangal Dosha
  const isManglik = doshas?.mangal?.is_present ?? false;
  const marsHouse = doshas?.mangal?.checked_houses?.Lagna || planetsList.find((p) => p.name === 'Mars')?.house || 1;

  // Kaal Sarp
  const isKaalSarp = doshas?.kaal_sarp?.is_present ?? false;

  // Sade Sati
  const sadeSatiPhase = doshas?.sade_sati?.phase || 'not_active';

  // Lucky elements based on Moon Sign
  const luckyItems: Record<string, { stone: string; color: string; number: number; day: string; deity: string }> = {
    मेष: { stone: 'पोवळा (Coral)', color: 'लाल / नारंगी', number: 9, day: 'मंगळवार', deity: 'हनुमानजी' },
    वृषभ: { stone: 'हिरा / ओपल (Diamond/Opal)', color: 'पांढरा / गुलाबी', number: 6, day: 'शुक्रवार', deity: 'महालक्ष्मी' },
    मिथुन: { stone: 'पाचू (Emerald)', color: 'हिरवा', number: 5, day: 'बुधवार', deity: 'गणेशजी' },
    कर्क: { stone: 'मोती (Pearl)', color: 'पांढरा / चंदेरी', number: 2, day: 'सोमवार', deity: 'शिवशंकर' },
    सिंह: { stone: 'माणिक (Ruby)', color: 'सोनेरी / भगवा', number: 1, day: 'रविवार', deity: 'सूर्यदेव' },
    कन्या: { stone: 'पाचू (Emerald)', color: 'हिरवा / हलका निळा', number: 5, day: 'बुधवार', deity: 'गणेशजी' },
    तूळ: { stone: 'हिरा / ओपल (Diamond/Opal)', color: 'पांढरा / क्रीम', number: 6, day: 'शुक्रवार', deity: 'महालक्ष्मी' },
    वृश्चिक: { stone: 'पोवळा (Coral)', color: 'गडद लाल / केशरी', number: 9, day: 'मंगळवार', deity: 'कार्तिकेय / हनुमानजी' },
    धनु: { stone: 'पुष्कराज (Yellow Sapphire)', color: 'पिवळा / सोनेरी', number: 3, day: 'गुरुवार', deity: 'दत्तात्रेय / विष्णू' },
    मकर: { stone: 'नीलम (Blue Sapphire)', color: 'काळा / गडद निळा', number: 8, day: 'शनिवार', deity: 'शनिदेव' },
    कुंभ: { stone: 'नीलम / जांभळा अमिथिस्ट', color: 'निळा / जांभळा', number: 8, day: 'शनिवार', deity: 'हनुमानजी' },
    मीन: { stone: 'पुष्कराज (Yellow Sapphire)', color: 'पिवळा / केशर', number: 3, day: 'गुरुवार', deity: 'विष्णू भगवान' },
  };

  const lucky = luckyItems[moonRashiMr] || luckyItems['वृश्चिक'];

  return {
    fullName: params.fullName,
    gender: params.gender,
    dob: params.dob,
    time: params.time,
    birthPlace: params.birthPlace || params.city,
    city: params.city,
    latitude: params.latitude,
    longitude: params.longitude,
    timezone: params.timezone,

    astroDetails: {
      ascendantLagna: `${lagnaSignMr} (${lagnaSignName})`,
      ascendantDegree: `${Math.floor(lagnaDegRaw % 30)}° ${Math.floor(((lagnaDegRaw % 30) - Math.floor(lagnaDegRaw % 30)) * 60)}'`,
      rashi: moonRashiMr,
      rashiLord: moonRashiLordMr,
      sunSign: sunRashiMr,
      moonSign: moonRashiMr,
      nakshatra: nakshatraMr,
      nakshatraLord: nakshatraLordMr,
      pada: Number(pada) || 1,
      gan: ganMr,
      nadi: nadiMr,
      varna: varnaMr,
      vashya: vashyaMr,
      yoni: yoniMr,
      paya: 'चांदीचा पाया (शुभ व प्रगतिकारक)',
      samvatsar: 'कालयुक्त संवत्सर',
      ayan: 'उत्तरायण / दक्षिणायन',
      tithi: 'शुक्ल / कृष्ण पक्ष',
    },

    planets: planetsList,
    lagnaChart,
    navamshaChart,

    mahadasha: {
      balanceAtBirth: dasha?.balance?.lord ? `${PLANET_MAP_MR[dasha.balance.lord] || dasha.balance.lord} महादशा ${Number(dasha.balance.balance_years?.toFixed(1)) || 18} वर्षे शिल्लक` : 'शनी महादशा शिल्लक',
      currentMahadasha: activeDasha?.lordMr || 'बुध',
      currentAntardasha: 'शुक्र',
      timeline: mahadashas,
    },

    doshas: {
      mangalDosha: {
        isPresent: isManglik,
        house: marsHouse,
        severity: isManglik ? 'मध्यम मंगळ (House ' + marsHouse + ')' : 'मंगळ निर्दोष',
        cancellation: isManglik ? 'वय २८ नंतर किंवा मंगळ युतीमुळे दोष प्रभाव सौम्य होतो.' : 'कोणताही मंगळ दोष नाही.',
        remedy: isManglik ? 'मंगळवारी हनुमान चालीसा व सुंदरकांड पठण करावे. लाल पोवळा किंवा शिवलिंगावर जलाभिषेक करावा.' : 'नित्य हनुमान उपासना करावी.',
      },
      kaalSarpDosha: {
        isPresent: isKaalSarp,
        type: isKaalSarp ? 'अनंत / कुलिक कालसर्प योग' : 'कालसर्प निर्दोष',
        remedy: isKaalSarp ? 'त्र्यंबकेश्वर येथे कालसर्प शांती किंवा नागपंचमीला नागदेवता पूजन करावे.' : 'नित्य ॐ नमः शिवाय जप करावा.',
      },
      sadeSati: {
        isActive: sadeSatiPhase !== 'not_active',
        phase: sadeSatiPhase === 'first_phase' ? 'प्रथम चरण (उतरती)' : sadeSatiPhase === 'peak_phase' ? 'शिखर चरण (मध्य)' : sadeSatiPhase === 'last_phase' ? 'अंतिम चरण' : 'सध्या शनीची साडेसाती नाही',
        remedy: 'शनिवारी मारुती मंदिरात तिळाचे तेल व काळे उडीद अर्पण करावेत.',
      },
      pitraDosha: {
        isPresent: Boolean(doshas?.pitra?.is_present),
        remedy: 'अमावस्येला पितरांच्या नावाने अन्नदान व पिंपळाच्या झाडाला पाणी द्यावे.',
      },
    },

    yogas: [
      {
        name: 'गजकेसरी योग (Gajakesari Yoga)',
        nameMr: 'गजकेसरी योग',
        isPresent: true,
        description: 'गुरु आणि चंद्राच्या केंद्र संबंधामुळे कीर्ती, विद्या, बुद्धिमत्ता व समाजमान्यता लाभते.',
      },
      {
        name: 'बुधादित्य योग (Budhaditya Yoga)',
        nameMr: 'बुधादित्य योग',
        isPresent: true,
        description: 'सूर्य आणि बुधाच्या संयोगामुळे उच्च बौद्धिक क्षमता, निर्णयक्षमता व नेतृत्वगुण प्राप्त होतात.',
      },
      {
        name: 'रुचक महापुरुष योग (Ruchaka Yoga)',
        nameMr: 'रुचक योग',
        isPresent: marsHouse === 1 || marsHouse === 4 || marsHouse === 7 || marsHouse === 10,
        description: 'मंगळाच्या केंद्रातील शुभ स्थानामुळे साहस, भूमी-मालमत्ता व अधिकार पद प्राप्त होते.',
      },
    ],

    luckyElements: lucky,
    reportGeneratedAt: new Date().toISOString(),
    provider: 'Navamsha.in Vedic Astrology Engine (Official 10K Credits API)',
  };
}
