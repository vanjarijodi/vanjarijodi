export function formatProfileDisplayName(
  profileName: string,
  currentUser: any,
  isAdminLoggedIn: boolean,
  isAuthorized: boolean,
  siteConfig: any
): string {
  if (!profileName) return 'उमेदवार';
  if (isAdminLoggedIn) return profileName;
  
  // Paid member or unlocked contact
  const isPaidMember = Boolean(
    currentUser &&
      ((currentUser.membership && currentUser.membership !== 'free') ||
        currentUser.isCustomAccessGranted)
  );

  if (isPaidMember || isAuthorized) {
    return profileName;
  }

  // Admin config mode for free members & guests
  const mode = siteConfig?.nameDisplayModeForFreeUsers || 'full_name';
  if (mode === 'first_name_only' || mode === 'middle_surname_only') {
    const parts = profileName.trim().split(/\s+/);
    const honorifics = ['डॉ.', 'इंजि.', 'प्रा.', 'ॲड.', 'adv.', 'dr.', 'er.', 'prof.', 'mr.', 'mrs.', 'ms.', 'श्री.', 'सौ.', 'कु.'];
    let honorific = '';
    let nameParts = [...parts];

    if (nameParts.length > 0 && honorifics.some((h) => h.toLowerCase() === nameParts[0].toLowerCase())) {
      honorific = nameParts[0] + ' ';
      nameParts = nameParts.slice(1);
    }

    if (nameParts.length <= 1) {
      return profileName;
    }

    // Hide first name, show middle name and surname (e.g., 'राहुल बबनराव मुंडे' -> 'बबनराव मुंडे')
    const middleAndSurname = nameParts.slice(1).join(' ');
    return `${honorific}${middleAndSurname}`;
  } else if (mode === 'hidden_star') {
    const parts = profileName.trim().split(/\s+/);
    return parts.map((p) => p.charAt(0) + '****').join(' ');
  }

  return profileName;
}
