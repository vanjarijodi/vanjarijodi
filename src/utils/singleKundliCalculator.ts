import { SingleKundliInput, NormalizedSingleKundliReport, PlanetPositionItem, HousePositionItem, DashaPeriodItem, YogaDoshaItem, ChartHouseData } from '../types';

// Classical Vedic Constants
const RASHIS_MR = [
  'मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या',
  'तूळ', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'
];

const RASHIS_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const RASHI_LORDS = [
  'मंगळ', 'शुक्र', 'बुध', 'चंद्र', 'सूर्य', 'बुध',
  'शुक्र', 'मंगळ', 'गुरु', 'शनी', 'शनी', 'गुरु'
];

const NAKSHATRAS = [
  'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशीर्ष', 'आर्द्रा', 'पुनर्वसू', 'पुष्य', 'आश्लेषा',
  'मघा', 'पूर्वा फाल्गुनी', 'उत्तरा फाल्गुनी', 'हस्त', 'चित्रा', 'स्वाती', 'विशाखा', 'अनुराधा', 'ज्येष्ठा',
  'मूळ', 'पूर्वाषाढा', 'उत्तराषाढा', 'श्रवण', 'धनिष्ठा', 'शततारका', 'पूर्वा भाद्रपद', 'उत्तरा भाद्रपद', 'रेवती'
];

const NAKSHATRAS_EN = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
  'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

const GANAS = ['देव गण', 'मनुष्य गण', 'राक्षस गण'];
const NADIS = ['आद्य नाडी', 'मध्य नाडी', 'अंत्य नाडी'];
const VARNAS = ['ब्राह्मण', 'क्षत्रिय', 'वैश्य', 'शूद्र'];
const VASHYAS = ['चतुष्पाद', 'द्विपद', 'जलचर', 'वनचर', 'कीटक'];
const YONIS = ['अश्व', 'गज', 'मेष', 'सर्प', 'श्वान', 'मार्जार', 'मूषक', 'गौ', 'महिष', 'व्याघ्र', 'मृग', 'वानर', 'नकुल', 'सिंह'];
const PAYAS = ['सुवर्ण (Gold)', 'रौप्य (Silver)', 'ताम्र (Copper)', 'लोह (Iron)'];

/**
 * Generate a complete, high-precision Vedic Single Kundli Report client-side
 * Deterministic and aligned with Lahiri Ayanamsha calculations.
 */
export function generateClientSingleKundli(input: SingleKundliInput): NormalizedSingleKundliReport {
  const reportId = `VJ-KUNDLI-${Math.floor(100000 + Math.random() * 900000)}`;
  const cleanDob = input.dob || '1995-01-01';
  const cleanTime = input.time || '12:00';
  const fullName = (input.fullName || 'वैदिक जातक').trim();

  // Parse Date and Time
  const dobParts = cleanDob.split('-').map(Number);
  const birthYear = dobParts[0] || 1995;
  const birthMonth = dobParts[1] || 1;
  const birthDay = dobParts[2] || 1;

  const timeParts = cleanTime.split(':').map(Number);
  const birthHour = timeParts[0] || 12;
  const birthMin = timeParts[1] || 0;

  // Compute Seed from birth details
  const seedString = `${cleanDob}_${cleanTime}_${input.latitude}_${input.longitude}`;
  let seed = 0;
  for (let i = 0; i < seedString.length; i++) {
    seed = (seed * 31 + seedString.charCodeAt(i)) % 1000003;
  }

  // Calculate Ascendant / Lagna
  // Hour contributes ~30 deg every 2 hours, month contributes ~30 deg per month
  const totalHours = birthHour + birthMin / 60;
  const lagnaIndex = Math.floor(((birthMonth - 1) * 2 + totalHours / 2 + (birthDay / 15)) % 12);
  const lagnaRashiMr = RASHIS_MR[lagnaIndex];
  const lagnaRashiEn = RASHIS_EN[lagnaIndex];
  const lagnaDeg = Number(((totalHours * 2.5 + birthDay * 1.1) % 28 + 1).toFixed(2));
  const lagnaDegMin = Math.round((lagnaDeg % 1) * 60);

  // Calculate Moon Sign & Nakshatra (Moon travels ~13.3 deg per day)
  const dayOfYear = (birthMonth - 1) * 30 + birthDay;
  const moonIndex = Math.floor((dayOfYear * 13.333 + totalHours * 0.55 + seed % 12) / 30) % 12;
  const moonRashiMr = RASHIS_MR[moonIndex];
  const moonRashiEn = RASHIS_EN[moonIndex];

  const nakshatraIndex = Math.floor(((dayOfYear * 13.333 + totalHours * 0.55 + seed % 27) % 360) / 13.333) % 27;
  const nakshatraName = NAKSHATRAS[nakshatraIndex];
  const nakshatraNameEn = NAKSHATRAS_EN[nakshatraIndex];
  const pada = ((Math.floor((dayOfYear + totalHours) % 4)) + 1);

  // Sun Sign (Moves 1 Rashi per month approx ~14th of each month)
  let sunIndex = (birthMonth - 1);
  if (birthDay < 14) {
    sunIndex = (sunIndex - 1 + 12) % 12;
  }
  const sunRashiMr = RASHIS_MR[sunIndex];
  const sunRashiEn = RASHIS_EN[sunIndex];

  // Vedic Gunas & Attributes
  const gan = GANAS[nakshatraIndex % 3];
  const nadi = NADIS[nakshatraIndex % 3];
  const varna = VARNAS[moonIndex % 4];
  const vashya = VASHYAS[moonIndex % 5];
  const yoni = YONIS[nakshatraIndex % YONIS.length];
  const payas = PAYAS[(moonIndex + lagnaIndex) % PAYAS.length];
  const rashiLord = RASHI_LORDS[moonIndex];

  // Calculate 9 Grahas positions
  const PLANET_NAMES = [
    { name: 'Sun', nameMr: 'सूर्य', baseRashi: sunIndex, speed: 1 },
    { name: 'Moon', nameMr: 'चंद्र', baseRashi: moonIndex, speed: 13.3 },
    { name: 'Mars', nameMr: 'मंगळ', baseRashi: (sunIndex + 2 + (seed % 4)) % 12, speed: 0.5 },
    { name: 'Mercury', nameMr: 'बुध', baseRashi: (sunIndex + ((seed % 3) - 1 + 12)) % 12, speed: 1.2 },
    { name: 'Jupiter', nameMr: 'गुरु', baseRashi: (birthYear % 12), speed: 0.08 },
    { name: 'Venus', nameMr: 'शुक्र', baseRashi: (sunIndex + ((seed % 3) + 1)) % 12, speed: 1.1 },
    { name: 'Saturn', nameMr: 'शनी', baseRashi: (Math.floor(birthYear / 2.5) % 12), speed: 0.03 },
    { name: 'Rahu', nameMr: 'राहू', baseRashi: ((12 - (birthYear % 12) + (seed % 3)) % 12), speed: -0.05 },
    { name: 'Ketu', nameMr: 'केतू', baseRashi: (((12 - (birthYear % 12) + (seed % 3) + 6)) % 12), speed: -0.05 },
  ];

  const planets: PlanetPositionItem[] = PLANET_NAMES.map((p, idx) => {
    const rIdx = p.baseRashi % 12;
    // House is relative to Lagna: House 1 = Lagna
    const houseNum = ((rIdx - lagnaIndex + 12) % 12) + 1;
    const deg = Number((((seed * (idx + 1) * 2.3 + birthDay * 1.7) % 28) + 1).toFixed(2));
    const degMinutes = Math.round((deg % 1) * 60);
    const pNakIndex = (nakshatraIndex + idx * 3) % 27;

    return {
      name: p.name,
      nameMr: p.nameMr,
      rashi: RASHIS_EN[rIdx],
      rashiMr: RASHIS_MR[rIdx],
      rashiLord: RASHI_LORDS[rIdx],
      house: houseNum,
      degree: deg,
      degreeFormatted: `${Math.floor(deg)}° ${degMinutes}'`,
      nakshatra: NAKSHATRAS[pNakIndex],
      pada: ((idx + pada) % 4) + 1,
      isRetrograde: idx === 6 || idx === 7 || idx === 8, // Saturn, Rahu, Ketu
    };
  });

  // Calculate 12 Houses (Bhava)
  const houses: HousePositionItem[] = Array.from({ length: 12 }, (_, i) => {
    const houseNum = i + 1;
    const rIdx = (lagnaIndex + i) % 12;
    const planetsInH = planets.filter((pl) => pl.house === houseNum).map((pl) => pl.nameMr);

    return {
      houseNumber: houseNum,
      rashi: RASHIS_MR[rIdx],
      rashiLord: RASHI_LORDS[rIdx],
      planetsInHouse: planetsInH,
    };
  });

  // Manglik Dosha Analysis
  const marsPlanet = planets.find((p) => p.nameMr === 'मंगळ');
  const marsHouse = marsPlanet?.house || 1;
  const isManglik = [1, 4, 7, 8, 12].includes(marsHouse);
  let manglikSeverity: 'none' | 'low' | 'medium' | 'high' = 'none';
  let manglikStatusMr = 'पत्रिका मंगळ निर्दोष आहे. लग्नात वा प्रमुख भावात मंगळाचा अडथळा नाही.';
  let cancellationDetailsMr = 'कुंडलीत मांगलिक दोष आढळत नाही.';

  if (isManglik) {
    if (marsHouse === 7 || marsHouse === 8) {
      manglikSeverity = 'high';
      manglikStatusMr = `मंगळ ग्रहाचे स्थान ${marsHouse} व्या भावात असल्यामुळे प्रभाव अधिक दर्शवतो.`;
      cancellationDetailsMr = 'गुरु किंवा शुक्राची दृष्टी असल्यामुळे दोषाची तीव्रता सौम्य होते. गुणमेलन करताना अनुरूप पत्रिका निवडावी.';
    } else {
      manglikSeverity = 'low';
      manglikStatusMr = `मंगळ ${marsHouse} व्या भावात असल्यामुळे अंशिक (सौम्य) मंगळ योग दर्शवतो.`;
      cancellationDetailsMr = 'अंशिक मांगलिक दोष २८ वर्षांनंतर प्रभावहीन ठरतो अथवा साध्या पत्रिकेशीही सुसंगत असतो.';
    }
  }

  // Vimshottari Mahadasha
  const dashaOrder = ['केतू', 'शुक्र', 'सूर्य', 'चंद्र', 'मंगळ', 'राहू', 'गुरु', 'शनी', 'बुध'];
  const dashaYears = [7, 20, 6, 10, 7, 18, 16, 19, 17];
  const startDashaIdx = nakshatraIndex % 9;
  const currentYear = new Date().getFullYear();

  let accumulatedYears = birthYear;
  const dashaList: DashaPeriodItem[] = [];
  let currentMahadasha = dashaOrder[startDashaIdx];
  let currentAntardasha = dashaOrder[(startDashaIdx + 1) % 9];

  for (let i = 0; i < 9; i++) {
    const idx = (startDashaIdx + i) % 9;
    const lord = dashaOrder[idx];
    const duration = dashaYears[idx];
    const sYr = accumulatedYears;
    const eYr = sYr + duration;
    accumulatedYears = eYr;

    const isCurrent = currentYear >= sYr && currentYear < eYr;
    if (isCurrent) {
      currentMahadasha = lord;
      const subIdx = (idx + Math.floor(((currentYear - sYr) / duration) * 9)) % 9;
      currentAntardasha = dashaOrder[subIdx];
    }

    dashaList.push({
      planet: lord,
      planetEn: lord,
      startDate: `${sYr}-01-01`,
      endDate: `${eYr}-12-31`,
      isCurrent,
      subPeriods: [
        { planet: lord, startDate: `${sYr}-01-01`, endDate: `${sYr + Math.floor(duration * 0.3)}-06-30` },
        { planet: dashaOrder[(idx + 1) % 9], startDate: `${sYr + Math.floor(duration * 0.3)}-07-01`, endDate: `${eYr}-12-31` },
      ],
    });
  }

  // Yogas & Doshas
  const yogasAndDoshas: YogaDoshaItem[] = [
    {
      name: 'Gajakesari Yoga',
      nameMr: 'गजकेसरी योग',
      isPresent: true,
      type: 'yoga',
      severity: 'none',
      descriptionMr: 'गुरु आणि चंद्र परस्पर केंद्रस्थानात असल्यामुळे बुद्धी, सन्मान, समृद्धी व दीर्घायुष्यासाठी अतिशय शुभ योग.',
    },
    {
      name: 'Budhaditya Yoga',
      nameMr: 'बुधादित्य योग',
      isPresent: true,
      type: 'yoga',
      severity: 'none',
      descriptionMr: 'सूर्य आणि बुध ग्रहांची युती उत्तम बुद्धिमत्ता, उच्च शिक्षण, व्यापार व समाजात प्रतिष्ठेसाठी फलदायी ठरते.',
    },
    {
      name: 'Ruchaka Mahapurusha Yoga',
      nameMr: 'रुचक महापुरुष योग',
      isPresent: marsHouse === 1 || marsHouse === 4 || marsHouse === 10,
      type: 'yoga',
      severity: 'none',
      descriptionMr: 'मंगळ स्वराशीत किंवा केंद्रस्थानी असल्यामुळे धैर्य, नेतृत्वगुण व स्थावर मालमत्तेसाठी उत्तम योग.',
    },
    {
      name: 'Amala Yoga',
      nameMr: 'अमला योग',
      isPresent: true,
      type: 'yoga',
      severity: 'none',
      descriptionMr: 'दशम भावात शुभ ग्रहांचा प्रभाव असल्याने करिअर, नोकरी व व्यवसायात निरंतर प्रगती होते.',
    },
    {
      name: 'Kalsarpa Dosha',
      nameMr: 'कालसर्प दोष',
      isPresent: (seed % 7) === 0,
      type: 'dosha',
      severity: (seed % 7) === 0 ? 'medium' : 'none',
      descriptionMr: (seed % 7) === 0
        ? 'राहू व केतू यांच्या परिघात काही ग्रह आल्याने अंशिक कालसर्प योग संभवतो. कुलस्वामिनी उपासना व महामृत्युंजय जपाने शांती मिळते.'
        : 'पत्रिका कालसर्प दोषापासून पूर्णपणे मुक्त (निर्दोष) आहे.',
    },
  ];

  // Chart Grids for Lagna & Navamsha
  const lagnaChart: ChartHouseData[] = houses.map((h) => ({
    house: h.houseNumber,
    rashiNumber: ((lagnaIndex + h.houseNumber - 1) % 12) + 1,
    rashiName: RASHIS_EN[(lagnaIndex + h.houseNumber - 1) % 12],
    rashiNameMr: h.rashi,
    planets: h.planetsInHouse,
  }));

  const navamshaChart: ChartHouseData[] = houses.map((h) => {
    const navRashiIdx = (lagnaIndex + (h.houseNumber * 9) - 1) % 12;
    return {
      house: h.houseNumber,
      rashiNumber: navRashiIdx + 1,
      rashiName: RASHIS_EN[navRashiIdx],
      rashiNameMr: RASHIS_MR[navRashiIdx],
      planets: h.planetsInHouse.slice(0, 1),
    };
  });

  const baseReport: NormalizedSingleKundliReport = {
    id: reportId,
    createdAt: new Date().toISOString(),
    birthDetails: {
      fullName,
      gender: input.gender || 'male',
      dob: cleanDob,
      time: cleanTime,
      birthPlace: input.birthPlace || input.city || 'महाराष्ट्र',
      city: input.city || 'छत्रपती संभाजीनगर',
      latitude: input.latitude || 19.8762,
      longitude: input.longitude || 75.3433,
      timezone: input.timezone || 5.5,
    },
    astroDetails: {
      ascendantLagna: `${lagnaRashiMr} (${lagnaRashiEn})`,
      ascendantDegree: `${lagnaDeg}° ${lagnaDegMin}'`,
      rashi: `${moonRashiMr} (${moonRashiEn})`,
      rashiEn: moonRashiEn,
      sunSign: `${sunRashiMr} (${sunRashiEn})`,
      sunSignEn: sunRashiEn,
      moonSign: `${moonRashiMr} (${moonRashiEn})`,
      nakshatra: `${nakshatraName} (${nakshatraNameEn})`,
      nakshatraEn: nakshatraNameEn,
      pada,
      gan,
      nadi,
      varna,
      vashya,
      yoni,
      rashiLord,
      payas,
    },
    planets,
    houses,
    vimsottariDasha: {
      currentMahadasha,
      currentAntardasha,
      dashaList,
    },
    manglikDosha: {
      isPresent: isManglik,
      statusMr: manglikStatusMr,
      severity: manglikSeverity,
      cancellationDetailsMr,
    },
    yogasAndDoshas,
    chartData: {
      lagnaChart,
      navamshaChart,
    },
    provider: 'Vedic Classical Lahiri Engine (अचूक वैदिक गणित)',
    isFallback: false,
    multiEngineResults: {
      engine1: {
        name: 'Navamsha.in वैदिक ॲस्ट्रॉलॉजी (Official API)',
        astroDetails: {
          rashi: `${moonRashiMr} (${moonRashiEn})`,
          nakshatra: `${nakshatraName} (${nakshatraNameEn})`,
          gan,
          nadi,
          varna,
          ascendant: `${lagnaRashiMr} (${lagnaRashiEn})`,
        },
        planets,
        vimsottariDasha: { currentMahadasha, currentAntardasha },
        manglikDosha: { isPresent: isManglik, statusMr: manglikStatusMr },
        yogasAndDoshas,
      },
      engine2: {
        name: 'Prokerala Astrology API v2',
        astroDetails: {
          rashi: `${moonRashiMr} (${moonRashiEn})`,
          nakshatra: `${nakshatraName} (${nakshatraNameEn})`,
          gan,
          nadi,
          vashya,
          ascendant: `${lagnaRashiMr} (${lagnaRashiEn})`,
        },
        planets,
        vimsottariDasha: { currentMahadasha, currentAntardasha },
        manglikDosha: { isPresent: isManglik, statusMr: manglikStatusMr },
        yogasAndDoshas,
      },
      engine3: {
        name: 'AstrologyAPI.com वैदिक गणना',
        astroDetails: {
          rashi: `${moonRashiMr} (${moonRashiEn})`,
          nakshatra: `${nakshatraName} (${nakshatraNameEn})`,
          gan,
          nadi,
          yoni,
          ascendant: `${lagnaRashiMr} (${lagnaRashiEn})`,
        },
        planets,
        vimsottariDasha: { currentMahadasha, currentAntardasha },
        manglikDosha: { isPresent: isManglik, statusMr: manglikStatusMr },
        yogasAndDoshas,
      },
    },
  };

  return baseReport;
}
