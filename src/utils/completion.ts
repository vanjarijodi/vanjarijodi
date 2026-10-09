import { UserProfile } from '../types';

/**
 * Dynamically calculate profile completion percentage (0 to 100%)
 */
export function calculateProfileCompletion(profile: UserProfile): number {
  if (!profile) return 0;

  const weights = [
    { field: 'fullName', weight: 8 },
    { field: 'gender', weight: 5 },
    { field: 'dob', weight: 5 },
    { field: 'mobile', weight: 8 },
    { field: 'district', weight: 5 },
    { field: 'education', weight: 8 },
    { field: 'occupation', weight: 8 },
    { field: 'income', weight: 5 },
    { field: 'maritalStatus', weight: 5 },
    { field: 'subCaste', weight: 5 },
    { field: 'fatherOccupation', weight: 5 },
    { field: 'expectations', weight: 8 },
    { check: () => Array.isArray(profile.photos) && profile.photos.length > 0, weight: 12 },
    { check: () => Boolean(profile.bio || profile.currentAddress || profile.nativeAddress), weight: 5 },
    { check: () => Boolean(profile.idVerificationNumber || profile.aadhaarCardUrl || profile.idProofUrl || profile.aadhaarVerified), weight: 8 },
  ];

  let totalScore = 0;
  for (const item of weights) {
    if (item.field) {
      const val = (profile as any)[item.field];
      if (val !== undefined && val !== null && val !== '') {
        totalScore += item.weight;
      }
    } else if (item.check) {
      if (item.check()) {
        totalScore += item.weight;
      }
    }
  }

  return Math.min(100, Math.max(0, totalScore));
}
