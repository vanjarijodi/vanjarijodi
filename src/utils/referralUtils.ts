/**
 * Vanjari Jodi Matrimony - Referral Program & Custom Plan Utilities
 */

import { UserProfile } from '../types';

export function getCleanReferralCode(profile: Partial<UserProfile>): string {
  if (profile.referralCode && profile.referralCode.trim()) {
    return profile.referralCode.trim().toUpperCase();
  }

  const prefix = (profile.fullName?.split(' ')[0] || 'VJ')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 4) || 'VJ';

  const suffix = profile.mobile
    ? profile.mobile.replace(/\D/g, '').slice(-4)
    : (profile.id ? profile.id.replace(/\D/g, '').slice(-4) : '2026');

  return `VJ-${prefix}-${suffix}`;
}

export function getReferralShareLink(referralCode: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vanjarijodi.web.app';
  return `${origin}/?ref=${encodeURIComponent(referralCode)}`;
}

export function getReferralWhatsAppMessage(memberName: string, referralCode: string): string {
  const link = getReferralShareLink(referralCode);
  return `🚩 *जय भगवान बाबा!* 🚩

नमस्कार! मी *वंजारी जोडी मॅट्रिमोनी* वर नोंदणी केली आहे. येथे आपल्या वंजारी समाजातील हजारो उच्चशिक्षित, नोकरदार व व्यावसायिक वधू-वरांचे बायोडाटा व पत्रिका उपलब्ध आहेत.

तुम्हीसुद्धा आजच खालील लिंकवरून मोफत नोंदणी करा:
👉 *${link}*

माझा रेफरल कोड: *${referralCode}*
_(नोंदणी करताना रेफरल कोड अवश्य वापरा!)_

- *वंजारी जोडी मॅट्रिमोनी*
_Owned & Operated by PRIME MULTI SERVICES AND SUPPLIERS_`;
}

export function getPlanGrantWhatsAppMessage(
  memberName: string,
  planName: string,
  durationText: string,
  expiryDateStr: string,
  adminNote?: string
): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vanjarijodi.web.app';
  
  let formattedDate = expiryDateStr;
  try {
    const d = new Date(expiryDateStr);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString('mr-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  } catch (e) {
    // ignore
  }

  return `*वंजारी जोडी मॅट्रिमोनी - विशेष अभिनंदन!* 🎉

नमस्कार *${memberName}* जी! 🙏

आनंदाची बातमी! वंजारी जोडी मॅट्रिमोनीकडून आपल्या खात्यावर *${planName}* (${durationText}) चा विशेष प्रीमियम ॲक्सेस यशस्वीरीत्या ॲक्टिव्हेट करण्यात आला आहे.

📅 *प्लॅन वैधता (Expiry):* ${formattedDate}
👑 *सुविधा:* सर्व बायोडाटा, फोटो, पत्रिका व संपर्क क्रमांक थेट पाहता येतील!
${adminNote ? `📝 *ॲडमिन संदेश:* ${adminNote}\n` : ''}
🔗 *आत्ताच लॉगिन करा व स्थळे पहा:*
👉 ${origin}

शुभेच्छांसह,
*वंजारी जोडी मॅट्रिमोनी परिवार*
_PRIME MULTI SERVICES AND SUPPLIERS_`;
}

export function openWhatsAppChat(mobile: string, text: string) {
  const cleanPhone = mobile.replace(/\D/g, '');
  const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const url = `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
