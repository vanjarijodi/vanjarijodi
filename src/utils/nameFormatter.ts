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

  // Strict Guest Mode: Hide all names (First, Middle, Last) completely for guest visitors
  const isGuest = !currentUser || currentUser.id.startsWith('guest');
  if (isGuest && (siteConfig?.guestHideAllNames !== false || siteConfig?.isAutoModeEnabled !== false)) {
    return language === 'en' ? '🔒 Vanjari Bride/Groom (Name Hidden)' : '🔒 वंजारी वधू-वर (नाव लपवले आहे)';
  }

  let resultName = profileName;

  if (!isAdminLoggedIn) {
    // Paid member or unlocked contact
    const isPaidMember = Boolean(
      currentUser &&
        ((currentUser.membership && currentUser.membership !== 'free') ||
          currentUser.isCustomAccessGranted)
    );

    if (!isPaidMember && !isAuthorized) {
      // Admin config mode for free members & guests
      const mode = siteConfig?.nameDisplayModeForFreeUsers || 'full_name';
      const parts = profileName.trim().split(/\s+/);
      const honorifics = ['डॉ.', 'इंजि.', 'प्रा.', 'ॲड.', 'adv.', 'dr.', 'er.', 'prof.', 'mr.', 'mrs.', 'ms.', 'श्री.', 'सौ.', 'कु.'];
      let honorific = '';
      let nameParts = [...parts];

      if (nameParts.length > 0 && honorifics.some((h) => h.toLowerCase() === nameParts[0].toLowerCase())) {
        honorific = nameParts[0] + ' ';
        nameParts = nameParts.slice(1);
      }

      if (mode === 'first_name_only') {
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
      } else if (mode === 'middle_surname_only') {
        if (nameParts.length > 1) {
          const middleAndSurname = nameParts.slice(1).join(' ');
          resultName = `${honorific}${middleAndSurname}`;
        }
      } else if (mode === 'hidden_star') {
        resultName = parts.map((p) => p.charAt(0) + '****').join(' ');
      } else if (siteConfig?.hideMiddleNameForFreeUsers || siteConfig?.hideLastNameForFreeUsers) {
        if (nameParts.length >= 3) {
          const firstName = nameParts[0];
          const middleName = siteConfig?.hideMiddleNameForFreeUsers ? '****' : nameParts[1];
          const lastName = siteConfig?.hideLastNameForFreeUsers ? '****' : nameParts[2];
          resultName = `${honorific}${firstName} ${middleName} ${lastName}`;
        } else if (nameParts.length === 2 && siteConfig?.hideLastNameForFreeUsers) {
          resultName = `${honorific}${nameParts[0]} ****`;
        }
      }
    }
  }

  // If language is English, transliterate Marathi text to English
  if (language === 'en') {
    return transliterateMarathiToEnglish(resultName);
  }

  return resultName;
}

