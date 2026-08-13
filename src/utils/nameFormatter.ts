import { transliterateMarathiToEnglish } from './transliterate';

export function formatProfileDisplayName(
  profileName: string,
  currentUser: any,
  isAdminLoggedIn: boolean,
  isAuthorized: boolean,
  siteConfig: any,
  language: 'mr' | 'en' = 'mr'
): string {
  if (!profileName) return language === 'en' ? 'Candidate' : 'उमेदवार';

  // Admin and authorized contacts see full name
  if (isAdminLoggedIn || isAuthorized) {
    return language === 'en' ? transliterateMarathiToEnglish(profileName) : profileName;
  }

  // Strict Guest Mode: Blur/Hide name for guest visitors
  const isGuest = !currentUser || currentUser.id.startsWith('guest');
  if (isGuest) {
    return language === 'en' ? '🔒 Vanjari Bride/Groom (Login to View)' : '🔒 वंजारी वधू-वर (नाव पाहण्यासाठी लॉगिन करा)';
  }

  // Free / Unpaid Member Mode
  const isPaidMember = Boolean(
    currentUser &&
      ((currentUser.membership && currentUser.membership !== 'free') ||
        currentUser.isCustomAccessGranted)
  );

  if (!isPaidMember) {
    const mode = siteConfig?.nameDisplayModeForFreeUsers || 'blurred_name';
    const parts = profileName.trim().split(/\s+/);
    const honorifics = ['डॉ.', 'इंजि.', 'प्रा.', 'ॲड.', 'adv.', 'dr.', 'er.', 'prof.', 'mr.', 'mrs.', 'ms.', 'श्री.', 'सौ.', 'कु.'];
    let honorific = '';
    let nameParts = [...parts];

    if (nameParts.length > 0 && honorifics.some((h) => h.toLowerCase() === nameParts[0].toLowerCase())) {
      honorific = nameParts[0] + ' ';
      nameParts = nameParts.slice(1);
    }

    let resultName = profileName;

    if (mode === 'blurred_name') {
      resultName = honorific + nameParts.map((p) => p.charAt(0) + '****').join(' ');
    } else if (mode === 'first_name_only') {
      if (nameParts.length > 0) resultName = `${honorific}${nameParts[0]}`;
    } else if (mode === 'first_and_last') {
      if (nameParts.length > 1) {
        const firstName = nameParts[0];
        const lastName = nameParts[nameParts.length - 1];
        resultName = `${honorific}${firstName} ${lastName}`;
      }
    } else if (mode === 'surname_only') {
      if (nameParts.length > 1) {
        const lastName = nameParts[nameParts.length - 1];
        resultName = `${honorific}${lastName}`;
      }
    } else if (mode === 'hidden_star') {
      resultName = parts.map((p) => p.charAt(0) + '****').join(' ');
    }

    if (language === 'en') {
      return transliterateMarathiToEnglish(resultName);
    }
    return resultName;
  }

  if (language === 'en') {
    return transliterateMarathiToEnglish(profileName);
  }

  return profileName;
}

