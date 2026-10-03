import { UserProfile } from '../types';

/**
 * Calculates a match score percentage (50% to 98%) between logged-in user and candidate profile
 */
export function calculateMatchScore(user: UserProfile | null, candidate: UserProfile): number {
  if (!user || user.id === candidate.id) return 75; // Default score for guests

  let score = 60; // Base score

  // 1. Opposite gender preference
  if (user.gender !== candidate.gender) {
    score += 10;
  }

  // 2. District compatibility (same or nearby district)
  if (user.district && candidate.district && user.district === candidate.district) {
    score += 10;
  }

  // 3. SubCaste match
  if (user.subCaste && candidate.subCaste && user.subCaste.toLowerCase() === candidate.subCaste.toLowerCase()) {
    score += 8;
  }

  // 4. Education level compatibility
  if (user.education && candidate.education) {
    score += 5;
  }

  // 5. Marital status preference
  if (user.maritalStatus === candidate.maritalStatus) {
    score += 5;
  }

  // Cap between 60% and 98%
  return Math.min(98, Math.max(60, score));
}
