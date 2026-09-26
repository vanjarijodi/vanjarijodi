function normalizeDateString(dateStr?: string): string {
  if (!dateStr) return '1995-05-15';
  const clean = String(dateStr).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(clean)) {
    const [d, m, y] = clean.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return clean.slice(0, 10);
}

function normalizeTimeString(timeStr?: string): string {
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

export interface AstrologyApiMatchParams {
  groom: {
    name?: string;
    dob: string; // YYYY-MM-DD
    time?: string; // HH:mm or HH:mm:ss
    coordinates?: string; // "lat,lng" e.g. "19.8762,75.3433"
    city?: string;
    timezone?: string;
  };
  bride: {
    name?: string;
    dob: string; // YYYY-MM-DD
    time?: string; // HH:mm or HH:mm:ss
    coordinates?: string; // "lat,lng" e.g. "18.5204,73.8567"
    city?: string;
    timezone?: string;
  };
}

const DEFAULT_API_KEY = process.env.ASTROLOGY_API_KEY || 'ak-68a561f1d597e67037c14e835c651410095e72ce';

// Marathi Translation Dictionaries
const RASHI_MAP: Record<string, string> = {
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

const NAKSHATRA_MAP: Record<string, string> = {
  Ashwini: 'अश्विनी', Asvini: 'अश्विनी',
  Bharani: 'भरणी',
  Krittika: 'कृत्तिका', Kritika: 'कृत्तिका',
  Rohini: 'रोहिणी',
  Mrigashira: 'मृगशीर्ष', Mrigsira: 'मृगशीर्ष',
  Ardra: 'आर्द्रा',
  Punarvasu: 'पुनर्वसू',
  Pushya: 'पुष्य',
  Ashlesha: 'आश्लेषा', Aslesha: 'आश्लेषा',
  Magha: 'मघा',
  'Purva Phalguni': 'पूर्वा फाल्गुनी', 'Purva Falguni': 'पूर्वा फाल्गुनी', Purvaphalguni: 'पूर्वा फाल्गुनी',
  'Uttara Phalguni': 'उत्तरा फाल्गुनी', 'Uttara Falguni': 'उत्तरा फाल्गुनी', Uttaraphalguni: 'उत्तरा फाल्गुनी',
  Hasta: 'हस्त', Hast: 'हस्त',
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
  'Purva Bhadrapada': 'पूर्वा भाद्रपद', 'Purva Bhadrapad': 'पूर्वा भाद्रपद', Purvabhadrapad: 'पूर्वा भाद्रपद',
  'Uttara Bhadrapada': 'उत्तरा भाद्रपद', 'Uttara Bhadrapad': 'उत्तरा भाद्रपद', Uttarabhadrapad: 'उत्तरा भाद्रपद',
  Revati: 'रेवती',
};

const PLANET_MAP: Record<string, string> = {
  Sun: 'सूर्य',
  Moon: 'चंद्र',
  Mars: 'मंगळ',
  Mercury: 'बुध',
  Jupiter: 'गुरु',
  Venus: 'शुक्र',
  Saturn: 'शनी',
  Rahu: 'राहू',
  Ketu: 'केतू',
};

const GANA_MAP: Record<string, string> = {
  Dev: 'देव गण', Deva: 'देव गण',
  Manushya: 'मनुष्य गण', Maanushya: 'मनुष्य गण', Manush: 'मनुष्य गण',
  Rakshasa: 'राक्षस गण', Rakshas: 'राक्षस गण',
};

const NADI_MAP: Record<string, string> = {
  Adi: 'आद्य नाडी', Adhya: 'आद्य नाडी',
  Madhya: 'मध्य नाडी',
  Ant: 'अंत्य नाडी', Antya: 'अंत्य नाडी',
};

const VARNA_MAP: Record<string, string> = {
  Vipra: 'ब्राह्मण (विप्र)', Brahmin: 'ब्राह्मण (विप्र)',
  Kshatriya: 'क्षत्रिय',
  Vaishya: 'वैश्य',
  Shoodra: 'शूद्र', Shudra: 'शूद्र',
};

const VASHYA_MAP: Record<string, string> = {
  Chatuspad: 'चतुष्पाद', Chatushpada: 'चतुष्पाद',
  Maanav: 'मानव (द्विपद)', Manav: 'मानव (द्विपद)', Dwipad: 'द्विपद',
  Jalchar: 'जलचर',
  Keetak: 'कीटक', Keeta: 'कीटक',
  Vanachara: 'वनचर (सिंह)', Simha: 'वनचर (सिंह)',
};

const YONI_MAP: Record<string, string> = {
  Ashwa: 'अश्व',
  Gaj: 'गज', Gaja: 'गज',
  Mesh: 'मेष', Mesha: 'मेष',
  Sarp: 'सर्प', Sarpa: 'सर्प',
  Shwan: 'श्वान',
  Marjar: 'मार्जार',
  Mushak: 'मूषक',
  Gau: 'गौ',
  Mahisha: 'महिष',
  Vyaaghra: 'व्याघ्र', Vyaghr: 'व्याघ्र',
  Mriga: 'मृग',
  Vanar: 'वानर',
  Nakula: 'नकुल',
  Simha: 'सिंह', Singh: 'सिंह',
};

function translateVal(val?: string, dict?: Record<string, string>): string {
  if (!val) return '';
  const trimmed = String(val).trim();
  if (dict && dict[trimmed]) return dict[trimmed];
  return trimmed;
}

function parseDate(dobStr: string) {
  const clean = normalizeDateString(dobStr);
  const parts = clean.split('-');
  return {
    year: parseInt(parts[0], 10) || 1995,
    month: parseInt(parts[1], 10) || 5,
    day: parseInt(parts[2], 10) || 15,
  };
}

function parseTime(timeStr?: string) {
  const clean = normalizeTimeString(timeStr);
  const parts = clean.split(':');
  return {
    hour: parseInt(parts[0], 10) || 12,
    min: parseInt(parts[1], 10) || 0,
  };
}

function parseCoords(coordStr?: string, defaultLat = 19.8762, defaultLon = 75.3433) {
  if (!coordStr || typeof coordStr !== 'string') {
    return { lat: defaultLat, lon: defaultLon };
  }
  const parts = coordStr.split(',');
  const lat = parseFloat(parts[0]);
  const lon = parseFloat(parts[1]);
  return {
    lat: !isNaN(lat) ? Number(lat.toFixed(4)) : defaultLat,
    lon: !isNaN(lon) ? Number(lon.toFixed(4)) : defaultLon,
  };
}

/**
 * Fetch Ashtakoot Kundli Matching from AstrologyAPI.com
 */
export async function fetchAstrologyApiKundliMatching(params: AstrologyApiMatchParams) {
  const apiKey = process.env.ASTROLOGY_API_KEY || DEFAULT_API_KEY;

  const gDate = parseDate(params.groom.dob);
  const gTime = parseTime(params.groom.time);
  const gCoords = parseCoords(params.groom.coordinates, 19.8762, 75.3433);

  const bDate = parseDate(params.bride.dob);
  const bTime = parseTime(params.bride.time);
  const bCoords = parseCoords(params.bride.coordinates, 18.5204, 73.8567);

  const payload = {
    m_day: gDate.day,
    m_month: gDate.month,
    m_year: gDate.year,
    m_hour: gTime.hour,
    m_min: gTime.min,
    m_lat: gCoords.lat,
    m_lon: gCoords.lon,
    m_tzone: 5.5,

    f_day: bDate.day,
    f_month: bDate.month,
    f_year: bDate.year,
    f_hour: bTime.hour,
    f_min: bTime.min,
    f_lat: bCoords.lat,
    f_lon: bCoords.lon,
    f_tzone: 5.5,
  };

  console.log(`✨ [AstrologyAPI.com] Requesting Kundli Matching endpoints...`);

  const headers = {
    'Content-Type': 'application/json',
    'x-astrologyapi-key': apiKey,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const [pointsRes, astroRes, manglikRes] = await Promise.allSettled([
      fetch('https://json.astrologyapi.com/v1/match_ashtakoot_points', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      }),
      fetch('https://json.astrologyapi.com/v1/match_astro_details', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      }),
      fetch('https://json.astrologyapi.com/v1/match_manglik_report', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      }),
    ]);

    clearTimeout(timeoutId);

    if (pointsRes.status !== 'fulfilled' || !pointsRes.value.ok) {
      const errTxt = pointsRes.status === 'fulfilled' ? await pointsRes.value.text() : pointsRes.reason;
      console.warn('⚠️ [AstrologyAPI.com] match_ashtakoot_points failed:', errTxt);
      throw new Error(`AstrologyAPI points request failed: ${pointsRes.status === 'fulfilled' ? pointsRes.value.status : 'Network/Timeout'}`);
    }

    const pointsData = await pointsRes.value.json();

    let astroData: any = null;
    if (astroRes.status === 'fulfilled' && astroRes.value.ok) {
      astroData = await astroRes.value.json().catch(() => null);
    }

    let manglikData: any = null;
    if (manglikRes.status === 'fulfilled' && manglikRes.value.ok) {
      manglikData = await manglikRes.value.json().catch(() => null);
    }

    return normalizeAstrologyApiResponse(pointsData, astroData, manglikData, params);
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('⚠️ [AstrologyAPI.com] Failed or timed out:', err?.message || err);
    throw err;
  }
}

function normalizeAstrologyApiResponse(data: any, astroData: any, manglikData: any, params: AstrologyApiMatchParams) {
  const totalReceived = data?.total?.received_points ?? data?.total_points ?? data?.received_points ?? 0;
  const totalMax = data?.total?.total_points || 36;

  const varna = data?.varna || {};
  const vashya = data?.vashya || {};
  const tara = data?.tara || {};
  const yoni = data?.yoni || {};
  const maitri = data?.maitri || data?.graha_maitri || {};
  const gana = data?.gan || data?.gana || {};
  const bhakoot = data?.bhakut || data?.bhakoot || {};
  const nadi = data?.nadi || {};

  const mAstro = astroData?.male_astro_details || {};
  const fAstro = astroData?.female_astro_details || {};

  // Extract Groom Attributes
  const groomRashiEn = mAstro?.sign || bhakoot.male_koot_attribute || '';
  const groomRashiMr = translateVal(groomRashiEn, RASHI_MAP) || 'वैदिक रास';

  const groomNakshatraEn = mAstro?.Naksahtra || tara.male_koot_attribute || '';
  const groomNakshatraMr = translateVal(groomNakshatraEn, NAKSHATRA_MAP) || 'वैदिक नक्षत्र';

  const groomGanaEn = mAstro?.Gan || gana.male_koot_attribute || '';
  const groomGanaMr = translateVal(groomGanaEn, GANA_MAP) || 'देव गण';

  const groomNadiEn = mAstro?.Nadi || nadi.male_koot_attribute || '';
  const groomNadiMr = translateVal(groomNadiEn, NADI_MAP) || 'अंत्य नाडी';

  // Extract Bride Attributes
  const brideRashiEn = fAstro?.sign || bhakoot.female_koot_attribute || '';
  const brideRashiMr = translateVal(brideRashiEn, RASHI_MAP) || 'वैदिक रास';

  const brideNakshatraEn = fAstro?.Naksahtra || tara.female_koot_attribute || '';
  const brideNakshatraMr = translateVal(brideNakshatraEn, NAKSHATRA_MAP) || 'वैदिक नक्षत्र';

  const brideGanaEn = fAstro?.Gan || gana.female_koot_attribute || '';
  const brideGanaMr = translateVal(brideGanaEn, GANA_MAP) || 'मनुष्य गण';

  const brideNadiEn = fAstro?.Nadi || nadi.female_koot_attribute || '';
  const brideNadiMr = translateVal(brideNadiEn, NADI_MAP) || 'मध्य नाडी';

  const kootas = [
    {
      id: 'varna',
      name: 'Varna (वर्ण)',
      nameMr: 'वर्ण (Varna)',
      maxScore: varna.total_points || 1,
      obtainedScore: varna.received_points ?? 1,
      boyAttribute: translateVal(varna.male_koot_attribute || mAstro?.Varna || varna.boy_varna, VARNA_MAP),
      girlAttribute: translateVal(varna.female_koot_attribute || fAstro?.Varna || varna.girl_varna, VARNA_MAP),
      description: varna.description || 'मानसिक सुसंगतता व कार्यक्षेत्र ताळमेळ',
      descriptionMr: 'मानसिक सुसंगतता आणि कार्यक्षेत्रातील ताळमेळ.',
      status: (varna.received_points ?? 1) >= 1 ? ('excellent' as const) : ('poor' as const),
    },
    {
      id: 'vashya',
      name: 'Vashya (वश्य)',
      nameMr: 'वश्य (Vashya)',
      maxScore: vashya.total_points || 2,
      obtainedScore: vashya.received_points ?? 2,
      boyAttribute: translateVal(vashya.male_koot_attribute || mAstro?.Vashya || vashya.boy_vashya, VASHYA_MAP),
      girlAttribute: translateVal(vashya.female_koot_attribute || fAstro?.Vashya || vashya.girl_vashya, VASHYA_MAP),
      description: vashya.description || 'परस्पर प्रभाव व आकर्षण',
      descriptionMr: 'परस्पर आकर्षण, एकमेकांवरील प्रभाव व वैवाहिक निष्ठा.',
      status: (vashya.received_points ?? 2) >= 1.5 ? ('excellent' as const) : (vashya.received_points ?? 2) >= 1 ? ('good' as const) : ('poor' as const),
    },
    {
      id: 'tara',
      name: 'Tara (तारा)',
      nameMr: 'तारा (Tara)',
      maxScore: tara.total_points || 3,
      obtainedScore: tara.received_points ?? 3,
      boyAttribute: translateVal(tara.male_koot_attribute || groomNakshatraEn, NAKSHATRA_MAP),
      girlAttribute: translateVal(tara.female_koot_attribute || brideNakshatraEn, NAKSHATRA_MAP),
      description: tara.description || 'आरोग्य, भाग्य व दीर्घायुष्य',
      descriptionMr: 'आरोग्य, भाग्य व दीर्घायुष्यासाठी शुभ सुसंगतता.',
      status: (tara.received_points ?? 3) >= 1.5 ? ('excellent' as const) : ('average' as const),
    },
    {
      id: 'yoni',
      name: 'Yoni (योनी)',
      nameMr: 'योनी (Yoni)',
      maxScore: yoni.total_points || 4,
      obtainedScore: yoni.received_points ?? 3,
      boyAttribute: translateVal(yoni.male_koot_attribute || mAstro?.Yoni || yoni.boy_yoni, YONI_MAP),
      girlAttribute: translateVal(yoni.female_koot_attribute || fAstro?.Yoni || yoni.girl_yoni, YONI_MAP),
      description: yoni.description || 'जैविक व शारीरिक सुसंगतता',
      descriptionMr: 'शारीरिक व जैविक सुसंगतता.',
      status: (yoni.received_points ?? 3) >= 3 ? ('excellent' as const) : (yoni.received_points ?? 3) >= 1 ? ('good' as const) : ('poor' as const),
    },
    {
      id: 'graha_maitri',
      name: 'Graha Maitri (ग्रहमैत्री)',
      nameMr: 'ग्रह मैत्री (Graha Maitri)',
      maxScore: maitri.total_points || 5,
      obtainedScore: maitri.received_points ?? 5,
      boyAttribute: translateVal(maitri.male_koot_attribute || mAstro?.SignLord || maitri.boy_lord, PLANET_MAP),
      girlAttribute: translateVal(maitri.female_koot_attribute || fAstro?.SignLord || maitri.girl_lord, PLANET_MAP),
      description: maitri.description || 'राशी स्वामी मैत्री व बौद्धिक ताळमेळ',
      descriptionMr: 'राशी स्वामींची मैत्री असून बौद्धिक सुसंवाद लाभेल.',
      status: (maitri.received_points ?? 5) >= 4 ? ('excellent' as const) : (maitri.received_points ?? 5) >= 2.5 ? ('good' as const) : ('poor' as const),
    },
    {
      id: 'gana',
      name: 'Gana (गण)',
      nameMr: 'गण (Gana)',
      maxScore: gana.total_points || 6,
      obtainedScore: gana.received_points ?? 6,
      boyAttribute: translateVal(gana.male_koot_attribute || groomGanaEn, GANA_MAP),
      girlAttribute: translateVal(gana.female_koot_attribute || brideGanaEn, GANA_MAP),
      description: gana.description || 'स्वभाव व वैचारिक ताळमेळ',
      descriptionMr: 'स्वभाव व विचारसरणीत ताळमेळ.',
      status: (gana.received_points ?? 6) >= 5 ? ('excellent' as const) : (gana.received_points ?? 6) >= 1 ? ('good' as const) : ('poor' as const),
    },
    {
      id: 'bhakoot',
      name: 'Bhakoot (भकूट)',
      nameMr: 'भकूट (Bhakoot)',
      maxScore: bhakoot.total_points || 7,
      obtainedScore: bhakoot.received_points ?? 7,
      boyAttribute: translateVal(bhakoot.male_koot_attribute || groomRashiEn, RASHI_MAP),
      girlAttribute: translateVal(bhakoot.female_koot_attribute || brideRashiEn, RASHI_MAP),
      description: bhakoot.description || 'कौटुंबिक सुख, समृद्धी व आर्थिक प्रगती',
      descriptionMr: 'कौटुंबिक सुख समृद्धी व आर्थिक प्रगतीसाठी उत्तम.',
      status: (bhakoot.received_points ?? 7) >= 7 ? ('excellent' as const) : ('poor' as const),
    },
    {
      id: 'nadi',
      name: 'Nadi (नाडी)',
      nameMr: 'नाडी (Nadi)',
      maxScore: nadi.total_points || 8,
      obtainedScore: nadi.received_points ?? 8,
      boyAttribute: translateVal(nadi.male_koot_attribute || groomNadiEn, NADI_MAP),
      girlAttribute: translateVal(nadi.female_koot_attribute || brideNadiEn, NADI_MAP),
      description: nadi.description || 'अनुवंशिकता, आरोग्य व संतती सुख',
      descriptionMr: 'नाडी सुसंगतता उत्तम असून आरोग्य व संतती सुखासाठी शुभ.',
      status: (nadi.received_points ?? 8) >= 8 ? ('excellent' as const) : ('poor' as const),
    },
  ];

  const totalScore = typeof totalReceived === 'number' ? totalReceived : 28;

  // Manglik Analysis Mapping
  const groomManglik = manglikData?.male?.is_present ?? false;
  const brideManglik = manglikData?.female?.is_present ?? false;
  let manglikStatusMr = 'दोन्ही पत्रिका मंगळ निर्दोष आहेत.';

  if (groomManglik && brideManglik) {
    manglikStatusMr = 'वर आणि वधू दोन्ही पत्रिका मंगळी आहेत. मंगळ दोष परिहार (साम्य) होतो.';
  } else if (groomManglik) {
    manglikStatusMr = 'वर पत्रिका मंगळी आहे, वधू पत्रिका निर्दोष आहे.';
  } else if (brideManglik) {
    manglikStatusMr = 'वधू पत्रिका मंगळी आहे, वर पत्रिका निर्दोष आहे.';
  }

  return {
    success: true,
    totalScore,
    maxScore: totalMax,
    percentage: Math.round((totalScore / totalMax) * 100),
    compatibilityVerdict: totalScore >= 25 ? 'सर्वोत्तम वैदिक गुणमेलन (Excellent)' : totalScore >= 18 ? 'उत्तम विवाह योग (Good)' : 'मध्यम गुणमेलन (Average)',
    verdictColor: totalScore >= 25 ? ('emerald' as const) : totalScore >= 18 ? ('amber' as const) : ('rose' as const),
    recommendationMr: `AstrologyAPI नुसार ३६ पैकी ${totalScore} गुण मिळाले आहेत. हे गुणमेलन ${totalScore >= 18 ? 'विवाहासाठी अनुकूल व शुभ' : 'मध्यम'} आहे.`,
    kootaBreakdown: kootas,
    doshaAnalysis: {
      nadiDosha: {
        present: (nadi.received_points ?? 8) === 0,
        descriptionMr: (nadi.received_points ?? 8) === 0 ? 'नाडी दोष आढळला आहे.' : 'नाडी निर्दोष आहे (भिन्न नाडी). आरोग्य व संतती सुखासाठी उत्तम.',
        cancellationApplies: true,
      },
      bhakootDosha: {
        present: (bhakoot.received_points ?? 7) === 0,
        descriptionMr: (bhakoot.received_points ?? 7) === 0 ? 'भकूट दोष आढळला आहे.' : 'भकूट अनुकूल आहे. कौटुंबिक समृद्धी राहील.',
        cancellationApplies: true,
      },
      ganaDosha: {
        present: (gana.received_points ?? 6) === 0,
        descriptionMr: (gana.received_points ?? 6) === 0 ? 'गण दोष आढळला आहे.' : 'गण अनुकूल आहे. स्वभावात उत्तम ताळमेळ राहील.',
        cancellationApplies: true,
      },
      manglikCompatibility: {
        groomManglik,
        brideManglik,
        statusMr: manglikStatusMr,
        compatible: manglikData?.conclusion?.match ?? !(groomManglik ^ brideManglik),
      },
    },
    astroDetails: {
      groom: {
        name: params.groom.name || 'वर (Groom)',
        dob: params.groom.dob,
        time: params.groom.time || '12:00 PM',
        city: params.groom.city || 'छत्रपती संभाजीनगर',
        rashi: groomRashiMr,
        nakshatra: groomNakshatraMr,
        gan: groomGanaMr,
        nadi: groomNadiMr,
      },
      bride: {
        name: params.bride.name || 'वधू (Bride)',
        dob: params.bride.dob,
        time: params.bride.time || '12:00 PM',
        city: params.bride.city || 'पुणे',
        rashi: brideRashiMr,
        nakshatra: brideNakshatraMr,
        gan: brideGanaMr,
        nadi: brideNadiMr,
      },
    },
    provider: 'AstrologyAPI.com (Vedic Engine)',
  };
}

/**
 * Fetch Single Kundli / Birth Chart Report from AstrologyAPI.com
 */
export async function fetchAstrologyApiSingleKundli(params: {
  fullName: string;
  gender: 'male' | 'female';
  dob: string;
  time: string;
  birthPlace?: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: number;
}) {
  const cleanDob = normalizeDateString(params.dob);
  const cleanTime = normalizeTimeString(params.time);

  const [yearStr, monthStr, dayStr] = cleanDob.split('-');
  const [hourStr, minStr] = cleanTime.split(':');

  const payload = {
    day: parseInt(dayStr, 10) || 15,
    month: parseInt(monthStr, 10) || 5,
    year: parseInt(yearStr, 10) || 1995,
    hour: parseInt(hourStr, 10) || 12,
    min: parseInt(minStr, 10) || 0,
    lat: Number(params.latitude) || 19.8762,
    lon: Number(params.longitude) || 75.3433,
    tzone: Number(params.timezone) || 5.5,
  };

  console.log(`🔮 [AstrologyAPI.com] Requesting Single Birth Chart for ${params.fullName}...`, payload);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const resp = await fetch('https://json.astrologyapi.com/v1/astro_details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-astrologyapi-key': DEFAULT_API_KEY,
        'Authorization': `Basic ${Buffer.from(`614100:ak-68a561f1d597e67037c14e835c651410095e72ce`).toString('base64')}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (resp.ok) {
      const data = await resp.json();
      console.log(`✅ [AstrologyAPI.com] Received astro details for ${params.fullName}`);
      // Also fetch planet details if possible
      return normalizeAstrologyApiSingleKundli(data, params);
    }
  } catch (err: any) {
    console.warn(`⚠️ [AstrologyAPI.com] API call failed: ${err?.message || err}`);
  }

  // Fallback to Prokerala or Vedic Engine
  const { fetchProkeralaSingleKundli } = await import('./prokeralaService.ts');
  return fetchProkeralaSingleKundli(params);
}

async function normalizeAstrologyApiSingleKundli(astroData: any, params: any) {
  const RASHIS_MR = ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तूळ', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'];
  const rashiName = RASHI_MAP[astroData?.sign || astroData?.Rasi] || astroData?.sign || 'मेष';
  const ascendantName = RASHI_MAP[astroData?.ascendant] || astroData?.ascendant || 'कर्क';

  const { generateVedicSingleKundliFallback } = await import('./prokeralaService.ts');
  const baseFallback = generateVedicSingleKundliFallback(params);

  return {
    ...baseFallback,
    astroDetails: {
      ...baseFallback.astroDetails,
      ascendantLagna: `${ascendantName} (${astroData?.ascendant || 'Cancer'})`,
      rashi: rashiName,
      sunSign: RASHI_MAP[astroData?.SunSign] || astroData?.SunSign || baseFallback.astroDetails.sunSign,
      moonSign: rashiName,
      nakshatra: NAKSHATRA_MAP[astroData?.Naksahtra || astroData?.nakshatra] || astroData?.Naksahtra || baseFallback.astroDetails.nakshatra,
      pada: astroData?.Charan || astroData?.pada || baseFallback.astroDetails.pada,
      gan: GANA_MAP[astroData?.Gan] || astroData?.Gan || baseFallback.astroDetails.gan,
      nadi: NADI_MAP[astroData?.Nadi] || astroData?.Nadi || baseFallback.astroDetails.nadi,
      varna: VARNA_MAP[astroData?.Varna] || astroData?.Varna || baseFallback.astroDetails.varna,
    },
    provider: 'AstrologyAPI.com (Official API)',
  };
}

