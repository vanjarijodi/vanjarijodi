import { UserProfile, Plan } from '../types';

export interface PlanExpiryInfo {
  daysRemaining: number;
  totalDays: number;
  isExpiringSoon: boolean; // 1 to 6 days remaining
  isExpired: boolean;
  expiryDate: Date | null;
  expiryDateFormatted: string;
  planName: string;
  statusTextMr: string;
  statusBadgeColor: 'emerald' | 'amber' | 'rose' | 'slate';
}

/**
 * Calculates remaining days and expiry details for a user's subscription.
 */
export function calculatePlanExpiryInfo(
  profile: UserProfile | null | undefined,
  plansList?: Plan[]
): PlanExpiryInfo {
  if (!profile) {
    return {
      daysRemaining: 0,
      totalDays: 0,
      isExpiringSoon: false,
      isExpired: false,
      expiryDate: null,
      expiryDateFormatted: 'लागू नाही',
      planName: 'मोफत (Free)',
      statusTextMr: 'विनामूल्य खाते',
      statusBadgeColor: 'slate',
    };
  }

  const membership = profile.membership || profile.membershipTier || 'free';

  if (membership === 'free' || membership === 'admin' || membership === 'lifetime') {
    return {
      daysRemaining: 9999,
      totalDays: 9999,
      isExpiringSoon: false,
      isExpired: false,
      expiryDate: null,
      expiryDateFormatted: membership === 'lifetime' ? 'आजीवन (Lifetime)' : 'विनामूल्य (Free)',
      planName: membership === 'lifetime' ? 'आजीवन सदस्यत्व' : 'मोफत खाते',
      statusTextMr: membership === 'lifetime' ? 'आजीवन सक्रिय' : 'मोफत सदस्य',
      statusBadgeColor: 'emerald',
    };
  }

  let expiryDate: Date | null = null;
  let totalDays = 30;

  // 1. Direct explicit expiry date
  if (profile.membershipExpiryDate) {
    const d = new Date(profile.membershipExpiryDate);
    if (!isNaN(d.getTime())) {
      expiryDate = d;
    }
  }

  // 2. Computed from paidAt / paymentApprovedAt / createdAt and plan duration
  if (!expiryDate) {
    const baseDateStr = profile.paymentApprovedAt || profile.paidAt || profile.createdAt;
    const baseDate = baseDateStr ? new Date(baseDateStr) : new Date();
    
    // Find matching plan
    const matchingPlan = plansList?.find((p) => p.id === membership);
    
    // Extract days from plan text or durationMonths
    if (matchingPlan) {
      if (matchingPlan.duration) {
        const matchDays = matchingPlan.duration.match(/(\d+)\s*(दिवस|days|day)/i);
        if (matchDays && matchDays[1]) {
          totalDays = parseInt(matchDays[1], 10);
        } else {
          const matchMonths = matchingPlan.duration.match(/(\d+)\s*(महिने|महिना|months|month)/i);
          if (matchMonths && matchMonths[1]) {
            totalDays = parseInt(matchMonths[1], 10) * 30;
          } else if (matchingPlan.durationMonths) {
            totalDays = matchingPlan.durationMonths * 30;
          }
        }
      } else if (matchingPlan.durationMonths) {
        totalDays = matchingPlan.durationMonths * 30;
      }
    } else if (membership === 'yearly') {
      totalDays = 365;
    } else if (membership === 'diamond' || membership === 'gold') {
      totalDays = 180;
    } else if (membership === 'silver') {
      totalDays = 90;
    } else {
      totalDays = 30;
    }

    expiryDate = new Date(baseDate.getTime() + totalDays * 24 * 60 * 60 * 1000);
  }

  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  const isExpired = daysRemaining <= 0 || profile.isPlanExpired === true;
  const isExpiringSoon = !isExpired && daysRemaining <= 6 && daysRemaining > 0;

  const expiryDateFormatted = expiryDate.toLocaleDateString('mr-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const matchingPlan = plansList?.find((p) => p.id === membership);
  const planName = matchingPlan?.nameMr || matchingPlan?.name || (membership ? `${membership.toUpperCase()} Plan` : 'प्रीमियम');

  let statusTextMr = '';
  let statusBadgeColor: 'emerald' | 'amber' | 'rose' | 'slate' = 'emerald';

  if (isExpired) {
    statusTextMr = 'प्लॅन संपला आहे (Expired)';
    statusBadgeColor = 'rose';
  } else if (isExpiringSoon) {
    statusTextMr = `फक्त ${daysRemaining} दिवस शिल्लक (लवकरच संपणार)`;
    statusBadgeColor = 'amber';
  } else {
    statusTextMr = `${daysRemaining} दिवस शिल्लक (सक्रिय)`;
    statusBadgeColor = 'emerald';
  }

  return {
    daysRemaining: Math.max(0, daysRemaining),
    totalDays,
    isExpiringSoon,
    isExpired,
    expiryDate,
    expiryDateFormatted,
    planName,
    statusTextMr,
    statusBadgeColor,
  };
}
