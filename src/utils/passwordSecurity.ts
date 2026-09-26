import bcrypt from 'bcryptjs';

/**
 * Enterprise-Grade Bcrypt Password Hashing & Verification
 * Prevents plain-text credential leaks and ensures legal & data protection compliance.
 */

const SALT_ROUNDS = 10;

/**
 * Check if a string is already a valid Bcrypt hash
 */
export function isBcryptHash(str?: string): boolean {
  if (!str || typeof str !== 'string') return false;
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(str.trim());
}

/**
 * Hash a plain-text password or PIN using Bcrypt
 */
export function hashPassword(plainPassword: string): string {
  const clean = (plainPassword || '').trim();
  if (!clean) return '';
  // If already hashed, return as is
  if (isBcryptHash(clean)) return clean;
  return bcrypt.hashSync(clean, SALT_ROUNDS);
}

/**
 * Securely verify a plain-text password against a stored password or hash
 * Supports backward-compatible upgrade for legacy accounts.
 */
export function verifyPassword(plainPassword: string, storedPasswordOrHash?: string): boolean {
  if (!plainPassword || !storedPasswordOrHash) return false;
  const cleanInput = plainPassword.trim();
  const cleanStored = storedPasswordOrHash.trim();

  try {
    if (isBcryptHash(cleanStored)) {
      return bcrypt.compareSync(cleanInput, cleanStored);
    }
    // Backward compatibility for legacy plain-text entries
    return cleanInput === cleanStored;
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}
