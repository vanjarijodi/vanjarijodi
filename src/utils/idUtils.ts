import { UserProfile } from '../types';

/**
 * Formats any member ID into a short, clean, human-readable ID (e.g. VJ-102, VJ-1085).
 * Eliminates long timestamps like 'vj-1729384910293-8472'.
 */
export function formatMemberId(rawId?: string | null): string {
  if (!rawId) return 'VJ-101';
  const clean = String(rawId).trim();

  // If already like VJ-102 or VJ-1005 (1 to 4 digits), return standard uppercase
  if (/^vj-\d{1,4}$/i.test(clean)) {
    return clean.toUpperCase();
  }

  // If like vj-groom-104 or vj-bride-101
  const roleMatch = clean.match(/^vj-(?:groom|bride)-(\d+)/i);
  if (roleMatch) {
    return `VJ-${roleMatch[1]}`;
  }

  // If prefix like vj-g-123456 or vj-m-123456 or vj-tc-123456 or vj-e-123456
  const subPrefixMatch = clean.match(/^vj-(?:g|m|tc|e)-(\d+)/i);
  if (subPrefixMatch) {
    const rawNum = subPrefixMatch[1];
    const shortNum = rawNum.length > 4 ? rawNum.slice(-4) : rawNum;
    return `VJ-${parseInt(shortNum, 10) || 101}`;
  }

  // If like vj-1729384910293-8472
  const parts = clean.split('-');
  if (parts.length >= 3) {
    const lastPart = parts[parts.length - 1];
    if (/^\d+$/.test(lastPart)) {
      const shortNum = lastPart.length > 4 ? lastPart.slice(-4) : lastPart;
      return `VJ-${parseInt(shortNum, 10) || 101}`;
    }
  }

  // Extract all digits; if it's a long timestamp (> 5 digits), take the last 4 digits
  const digits = clean.replace(/\D/g, '');
  if (digits.length >= 5) {
    const shortDigits = digits.slice(-4);
    return `VJ-${parseInt(shortDigits, 10) || 101}`;
  } else if (digits.length > 0) {
    return `VJ-${digits}`;
  }

  return clean.toUpperCase();
}

/**
 * Generates a clean, short, sequential new member ID (e.g. VJ-107, VJ-108).
 * Never creates long timestamps.
 */
export function generateCleanMemberId(existingProfiles: { id?: string }[] = []): string {
  const existingNumbers = new Set<number>();

  existingProfiles.forEach((p) => {
    if (!p.id) return;
    const formatted = formatMemberId(p.id);
    const num = parseInt(formatted.replace(/\D/g, ''), 10);
    if (!isNaN(num) && num > 0 && num < 100000) {
      existingNumbers.add(num);
    }
  });

  let next = 101;
  while (existingNumbers.has(next)) {
    next++;
  }
  return `VJ-${next}`;
}
