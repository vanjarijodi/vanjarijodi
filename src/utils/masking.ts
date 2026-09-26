/**
 * Utility functions for input masking and privacy displays
 */

/**
 * Mask an ID/Aadhaar number e.g. "123456789012" -> "XXXX-XXXX-9012"
 */
export function maskIdNumber(idStr?: string): string {
  if (!idStr) return 'उपलब्ध नाही (Not Provided)';
  const cleaned = idStr.replace(/\D/g, '');
  if (cleaned.length < 4) return 'XXXX-XXXX-XXXX';
  const lastFour = cleaned.slice(-4);
  return `XXXX-XXXX-${lastFour}`;
}

/**
 * Mask mobile number e.g. "9876543210" -> "98XXXXXX10"
 */
export function maskMobileNumber(mobileStr?: string): string {
  if (!mobileStr) return 'XXXXXXXXXX';
  const cleaned = mobileStr.replace(/\D/g, '');
  if (cleaned.length < 10) return 'XXXXXXXXXX';
  return `${cleaned.slice(0, 2)}XXXXXX${cleaned.slice(-2)}`;
}
