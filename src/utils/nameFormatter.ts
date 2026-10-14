import { transliterateMarathiToEnglish } from './transliterate';

export function getProfileSurnameOnly(profileName: string, language: 'mr' | 'en' = 'mr'): string {
  if (!profileName) return language === 'en' ? 'Candidate' : 'उमेदवार';

  const parts = profileName.trim().split(/\s+/);
  const honorifics = [
    'डॉ.', 'इंजि.', 'प्रा.', 'ॲड.', 'adv.', 'dr.', 'er.', 'prof.', 'mr.', 'mrs.', 'ms.', 'श्री.', 'सौ.', 'कु.', 'चि.'
  ];
  let honorific = '';
  let nameParts = [...parts];

  if (nameParts.length > 0 && honorifics.some((h) => h.toLowerCase() === nameParts[0].toLowerCase())) {
    honorific = nameParts[0] + ' ';
    nameParts = nameParts.slice(1);
  }

  const surname = nameParts.length > 0 ? nameParts[nameParts.length - 1] : profileName;
  const result = `${honorific}${surname}`.trim();
  return language === 'en' ? transliterateMarathiToEnglish(result) : result;
}

/**
 * Checks if a user has an active, paid plan
 */
export function isUserPlanActive(currentUser: any): boolean {
  if (!currentUser) return false;
  if (currentUser.isAdmin) return true;
  if (currentUser.isGuest || currentUser.id?.startsWith('guest')) return false;
  if (currentUser.isCustomAccessGranted === true) return true;

  const membership = currentUser.membership;
  if (membership && membership !== 'free') {
    if (currentUser.isPlanExpired === true) return false;
    if (currentUser.membershipExpiryDate) {
      const expDate = new Date(currentUser.membershipExpiryDate);
      if (!isNaN(expDate.getTime()) && expDate.getTime() < Date.now()) {
        return false;
      }
    }
    return true;
  }
  return false;
}

/**
 * Helper to slice a Marathi word to half representation (e.g. 'पाटील' -> 'पा...', 'सानप' -> 'सा...')
 */
function sliceMarathiWord(word: string): string {
  if (!word) return '';
  const chars = Array.from(word);
  if (chars.length <= 2) {
    return chars[0] + '...';
  }
  const matras = /[\u093E-\u094C\u0902\u0903\u094D]/;
  if (chars.length > 2 && matras.test(chars[1])) {
    if (chars.length > 3 && chars[2] === '\u094D') {
      return chars.slice(0, 4).join('') + '...';
    }
    return chars.slice(0, 2).join('') + '...';
  }
  return chars.slice(0, 2).join('') + '...';
}

/**
 * Generates the half name ("अर्धेच नाव") for members who haven't purchased a plan.
 * e.g.:
 * "राहुल पाटील" -> "राहुल पा..." (English: "Rahul P...")
 * "पूजा सानप" -> "पूजा सा..." (English: "Pooja S...")
 * "सचिन आव्हाड" -> "सचिन आव..." (English: "Sachin A...")
 * "गणेश फड" -> "गणेश फ..." (English: "Ganesh P...")
 * "प्रिया" -> "प्रि..." (English: "Pri...")
 */
export function getHalfName(fullName: string, language: 'mr' | 'en' = 'mr'): string {
  if (!fullName || typeof fullName !== 'string') {
    return language === 'en' ? 'Member' : 'सदस्य';
  }

  const trimmed = fullName.trim();
  if (!trimmed) return language === 'en' ? 'Member' : 'सदस्य';

  const honorifics = [
    'डॉ.', 'इंजि.', 'प्रा.', 'ॲड.', 'adv.', 'dr.', 'er.', 'prof.', 'mr.', 'mrs.', 'ms.', 'श्री.', 'सौ.', 'कु.', 'चि.'
  ];

  const parts = trimmed.split(/\s+/);
  let honorific = '';
  let nameParts = [...parts];

  if (nameParts.length > 0 && honorifics.some((h) => h.toLowerCase() === nameParts[0].toLowerCase())) {
    honorific = nameParts[0] + ' ';
    nameParts = nameParts.slice(1);
  }

  if (nameParts.length === 0) {
    return trimmed;
  }

  const isTargetEn = language === 'en';

  if (nameParts.length === 1) {
    const single = isTargetEn ? transliterateMarathiToEnglish(nameParts[0]) : nameParts[0];
    const halfLen = Math.max(2, Math.ceil(single.length / 2));
    return `${honorific}${single.slice(0, halfLen)}...`.trim();
  }

  const firstName = isTargetEn ? transliterateMarathiToEnglish(nameParts[0]) : nameParts[0];
  const lastName = isTargetEn
    ? transliterateMarathiToEnglish(nameParts[nameParts.length - 1])
    : nameParts[nameParts.length - 1];

  let halfLast = '';
  if (isTargetEn || /^[a-zA-Z]/.test(lastName)) {
    halfLast = lastName.charAt(0).toUpperCase() + '...';
  } else {
    halfLast = sliceMarathiWord(lastName);
  }

  return `${honorific}${firstName} ${halfLast}`.trim();
}

/**
 * Masks the first name while preserving surname (used when admin setting blurFirstNameUntilMutualLike is active)
 * e.g. "राहुल कराड" -> "रा••• कराड"
 */
export function getFirstNameBlurredName(fullName: string, language: 'mr' | 'en' = 'mr'): string {
  if (!fullName) return language === 'en' ? 'Candidate' : 'उमेदवार';
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length === 0) return trimmed;

  const honorifics = [
    'डॉ.', 'इंजि.', 'प्रा.', 'ॲड.', 'adv.', 'dr.', 'er.', 'prof.', 'mr.', 'mrs.', 'ms.', 'श्री.', 'सौ.', 'कु.', 'चि.'
  ];
  let honorific = '';
  let nameParts = [...parts];

  if (nameParts.length > 0 && honorifics.some((h) => h.toLowerCase() === nameParts[0].toLowerCase())) {
    honorific = nameParts[0] + ' ';
    nameParts = nameParts.slice(1);
  }

  if (nameParts.length <= 1) {
    const word = nameParts[0] || trimmed;
    const firstChars = Array.from(word);
    const prefix = firstChars.length > 0 ? firstChars[0] : '';
    const masked = `${prefix}••• (नाव ब्लर)`;
    return `${honorific}${masked}`.trim();
  }

  const rawFirst = nameParts[0];
  const firstChars = Array.from(rawFirst);
  const prefix = firstChars.length > 0 ? firstChars[0] : '';
  const maskedFirst = `${prefix}•••`;
  const rest = nameParts.slice(1).join(' ');

  const result = `${honorific}${maskedFirst} ${rest}`.trim();
  return language === 'en' ? transliterateMarathiToEnglish(result) : result;
}

/**
 * Main Profile Display Name Formatter
 * Rule:
 * 1. Admin and Self viewers see full name.
 * 2. If siteConfig.blurFirstNameUntilMutualLike is active:
 *    - Mutual liked members see full name & contact number.
 *    - Otherwise, even paid members see blurred first name!
 * 3. Members with active paid plans see full name.
 * 4. Members who unlocked this specific contact see full name.
 * 5. Free/unpaid members see half name ("अर्धेच नाव", e.g. "राहुल पा...").
 */
export function formatProfileDisplayName(
  profileName: string,
  currentUser: any,
  isAdminLoggedIn: boolean,
  isAuthorized: boolean,
  siteConfig: any,
  language: 'mr' | 'en' = 'mr',
  isMutualLiked?: boolean,
  targetProfileId?: string
): string {
  if (!profileName) return language === 'en' ? 'Candidate' : 'उमेदवार';

  // 1. Admin and Self Viewers see full name unconditionally
  const isSelf = Boolean(
    currentUser && (
      (targetProfileId && currentUser.id === targetProfileId) ||
      (currentUser.fullName && currentUser.fullName.trim().toLowerCase() === profileName.trim().toLowerCase())
    )
  );

  if (isAdminLoggedIn || isSelf) {
    return language === 'en' ? transliterateMarathiToEnglish(profileName) : profileName;
  }

  // 2. First Name Blur Setting: "pahile naaw bluer pahije ka nahi yasathi admin kade setting mang jyani payment kele tyana pan pahile naww bluer disel mang matual like war naaw aani number disle ase kara"
  if (siteConfig?.blurFirstNameUntilMutualLike === true) {
    if (isMutualLiked) {
      // Mutual like achieved: Show full name!
      return language === 'en' ? transliterateMarathiToEnglish(profileName) : profileName;
    }
    // Mutual like not yet achieved: Mask first name even for paid members
    return getFirstNameBlurredName(profileName, language);
  }

  // 3. Paid Plan Check: "ज्यांनी प्लॅन घेतला आहे त्यांनाच पूर्ण सदस्यांचे नाव दिसलं पाहिजे"
  const hasPaidPlan = isUserPlanActive(currentUser);
  if (hasPaidPlan) {
    return language === 'en' ? transliterateMarathiToEnglish(profileName) : profileName;
  }

  // 4. Contact unlocked explicitly (e.g. single contact unlock)
  if (isAuthorized) {
    return language === 'en' ? transliterateMarathiToEnglish(profileName) : profileName;
  }

  // 5. Unpaid users: "ज्यांनी प्लॅन नाही घेतला त्यांना बाकी कडे सुद्धा अर्धेच नाव दिसले पाहिजे"
  return getHalfName(profileName, language);
}

/**
 * Ensures that notifications show blurred or half names according to admin privacy settings.
 * If user has bought a plan AND admin blur settings are OFF (or mutual like is achieved), full name is preserved.
 * If siteConfig.blurNameInNotifications or siteConfig.blurFirstNameUntilMutualLike is active,
 * even paid users see blurred names until mutual like!
 */
export function maskNotificationTextForUser(
  text: string,
  isPaidUser: boolean,
  language: 'mr' | 'en' = 'mr',
  senderName?: string,
  profiles?: any[],
  siteConfig?: any,
  isMutualLiked?: boolean
): string {
  if (!text || typeof text !== 'string') return text || '';

  // Mutual liked members always see full names
  if (isMutualLiked) return text;

  // Determine if notification name blur is enabled by admin
  const isBlurEnabledByAdmin =
    siteConfig?.blurNameInNotifications === true ||
    siteConfig?.blurFirstNameUntilMutualLike === true;

  // If user is paid and admin hasn't enabled blur, show full name
  if (isPaidUser && !isBlurEnabledByAdmin) return text;

  let masked = text;

  const maskFn = (name: string, lang: 'mr' | 'en' = language) => {
    if (siteConfig?.blurFirstNameUntilMutualLike || siteConfig?.blurNameInNotifications) {
      return getFirstNameBlurredName(name, lang);
    }
    return getHalfName(name, lang);
  };

  // 1. Replace explicit senderName if provided
  if (senderName && typeof senderName === 'string' && senderName.trim().length > 1) {
    const rawSender = senderName.trim();
    const maskedMr = maskFn(rawSender, 'mr');
    const maskedEn = maskFn(rawSender, 'en');

    if (masked.includes(rawSender)) {
      masked = masked.split(rawSender).join(language === 'en' ? maskedEn : maskedMr);
    }
    const enSender = transliterateMarathiToEnglish(rawSender);
    if (enSender && enSender !== rawSender && masked.includes(enSender)) {
      masked = masked.split(enSender).join(maskedEn);
    }
  }

  // 2. Check all known profile names from profiles array
  if (Array.isArray(profiles) && profiles.length > 0) {
    for (const p of profiles) {
      if (p && p.fullName && p.fullName.trim().length > 2) {
        const pName = p.fullName.trim();
        if (masked.includes(pName)) {
          const mName = maskFn(pName, language);
          masked = masked.split(pName).join(mName);
        }
        const pEnName = transliterateMarathiToEnglish(pName);
        if (pEnName && pEnName !== pName && masked.includes(pEnName)) {
          const mEnName = maskFn(pName, 'en');
          masked = masked.split(pEnName).join(mEnName);
        }
      }
    }
  }

  // 3. Regex matching for Marathi honorifics / suffixes like "... यांनी", "... यांच्या", "... यांना"
  // e.g. "राहुल पाटील यांनी" -> "रा•••• पाटील यांनी" किंवा "राहुल पा... यांनी"
  // e.g. "चि. सचिन आव्हाड यांनी" -> "चि. स•••• आव्हाड यांनी"
  masked = masked.replace(
    /((?:(?:चि\.|सौ\.|श्री\.|कु\.|डॉ\.|इंजि\.|प्रा\.|ॲड\.)\s+)?[\u0900-\u097F]+(?:\s+[\u0900-\u097F]+){1,2})\s+(यांनी|यांच्या|यांना)/g,
    (match, nameGroup, particle) => {
      if (
        nameGroup.includes('ॲडमिन') ||
        nameGroup.includes('प्रशासक') ||
        nameGroup.includes('वंजारी जोडी') ||
        nameGroup.includes('टीम') ||
        nameGroup.includes('सदस्य') ||
        nameGroup.includes('बायोडाटा') ||
        nameGroup.includes('पेमेंट')
      ) {
        return match;
      }
      const blurred = maskFn(nameGroup, 'mr');
      return `${blurred} ${particle}`;
    }
  );

  return masked;
}


