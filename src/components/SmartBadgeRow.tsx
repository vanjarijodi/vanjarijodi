import React from 'react';
import { ShieldCheck, Award, Briefcase, Heart, Sparkles, MapPin, GraduationCap, IndianRupee, Sun, Camera } from 'lucide-react';
import { UserProfile } from '../types';
import { useApp } from '../context/AppContext';

interface SmartBadgeRowProps {
  profile: UserProfile;
  compact?: boolean;
  showQuickInfo?: boolean;
  className?: string;
}

export const SmartBadgeRow: React.FC<SmartBadgeRowProps> = ({
  profile,
  compact = false,
  showQuickInfo = true,
  className = '',
}) => {
  const { language } = useApp();
  const isEn = language === 'en';

  // 1. Determine Marital Status Pill Tag
  const getMaritalBadge = () => {
    switch (profile.maritalStatus) {
      case 'never_married':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-sky-100 text-sky-900 border border-sky-300 shadow-xs">
            <Heart className="w-3 h-3 text-sky-600 fill-current" />
            <span>{isEn ? 'Never Married' : 'अविवाहित'}</span>
          </span>
        );
      case 'divorced':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-800 border border-slate-300 shadow-xs">
            <span>{isEn ? 'Divorced' : 'घटस्फोटित'}</span>
          </span>
        );
      case 'widowed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-900 border border-purple-300 shadow-xs">
            <span>{isEn ? 'Widowed' : 'विधवा / विधुर'}</span>
          </span>
        );
      case 'separated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
            <span>{isEn ? 'Separated' : 'विभक्त'}</span>
          </span>
        );
      default:
        return null;
    }
  };

  // 2. Determine Profession Capsule Badge
  const isGovtJob =
    profile.professionCategory === 'govt_job' ||
    /सरकारी|शासकीय|govt|government|officer|class-1|class-2|पोलीस|तलाठी|शिक्षक|mpsc|upsc/i.test(
      `${profile.occupation} ${profile.companyName || ''} ${profile.professionTags?.join(' ') || ''}`
    );

  const isDoctorOrEngineer =
    profile.professionCategory === 'doctor_engineer' ||
    /doctor|dr|mbbs|bams|bhms|md|engineer|b\.tech|m\.tech|software|developer|it/i.test(
      `${profile.occupation} ${profile.education} ${profile.companyName || ''}`
    );

  const isBusiness =
    profile.professionCategory === 'business_self' ||
    /business|उद्योग|व्यापार|दुकान|self-employed|entrepreneur/i.test(
      `${profile.occupation} ${profile.companyName || ''}`
    );

  const isAgri =
    profile.professionCategory === 'agriculture_business' ||
    /शेतकरी|शेती|कृषी|farmer|agriculture/i.test(
      `${profile.occupation} ${profile.professionTags?.join(' ') || ''}`
    );

  // 3. Manglik / Horoscope Info
  const getHoroscopeLabel = () => {
    if (profile.horoscopeManglik === 'manglik') return isEn ? 'Manglik' : 'मांगलिक (Manglik)';
    if (profile.horoscopeManglik === 'non_manglik') return isEn ? 'Non-Manglik' : 'निर्दोष पत्रिका (Non-Manglik)';
    if (profile.rashi || profile.nakshatra) {
      return `${profile.rashi || ''} ${profile.nakshatra ? `(${profile.nakshatra})` : ''}`.trim();
    }
    return null;
  };

  const horoscopeLabel = getHoroscopeLabel();

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Capsule Badges (Pill Tags) Row */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Face Verified Badge (📸 फेस व्हेरिफाइड) */}
        {profile.isFaceVerified && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-teal-500 to-emerald-600 text-white border border-teal-300 shadow-xs">
            <Camera className="w-3 h-3 text-teal-100" />
            <span>{isEn ? 'Face Verified' : '📸 फेस व्हेरिफाइड'}</span>
          </span>
        )}

        {/* Verification Gold / Blue Badge */}
        {(profile.isVerified || profile.aadhaarVerified || profile.isIdVerified) && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border border-amber-500 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-950 fill-amber-300" />
            <span>{isEn ? '100% Verified' : '100% व्हेरिफाइड'}</span>
          </span>
        )}

        {/* Custom Admin Badge */}
        {profile.adminBadge && !profile.hideBadge && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-[#A71930] to-[#800C1E] text-amber-200 border border-amber-400 shadow-xs">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>{profile.adminBadge}</span>
          </span>
        )}

        {/* Government Job / Class-1 Dark Emerald Capsule */}
        {isGovtJob ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-800 text-emerald-100 border border-emerald-600 shadow-xs">
            <Briefcase className="w-3 h-3 text-emerald-300" />
            <span>{isEn ? '🏛️ Govt. Job / Officer' : '🏛️ शासकीय / सरकारी नोकरी'}</span>
          </span>
        ) : isDoctorOrEngineer ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-700 text-indigo-100 border border-indigo-500 shadow-xs">
            <GraduationCap className="w-3 h-3 text-indigo-300" />
            <span>{isEn ? '🩺 Doctor / Engineer' : '🩺 डॉक्टर / इंजिनिअर'}</span>
          </span>
        ) : isBusiness ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-700 text-amber-100 border border-amber-500 shadow-xs">
            <Briefcase className="w-3 h-3 text-amber-200" />
            <span>{isEn ? '💼 Business / Self-Employed' : '💼 व्यवसाय / बिझनेस'}</span>
          </span>
        ) : isAgri ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-teal-800 text-teal-100 border border-teal-600 shadow-xs">
            <span>{isEn ? '🌾 Agriculture & Business' : '🌾 शेती + व्यवसाय'}</span>
          </span>
        ) : null}

        {/* Marital Status Tag */}
        {getMaritalBadge()}

        {/* VIP Member Badge */}
        {(profile.membership === 'vip' || profile.membership === 'diamond') && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-900 text-amber-300 border border-amber-400 shadow-xs">
            <Award className="w-3 h-3 text-amber-300" />
            <span>{isEn ? 'VIP Member' : 'VIP सदस्य'}</span>
          </span>
        )}
      </div>

      {/* Quick-Info Chip Row below user's name: [Education] • [Income] • [City / Origin] • [Horoscope / Manglik] */}
      {showQuickInfo && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-700 font-bold pt-0.5">
          {profile.education && (
            <span className="inline-flex items-center gap-1 text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span>{profile.education}</span>
            </span>
          )}

          {profile.income && (
            <span className="inline-flex items-center gap-1 text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-extrabold">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-700" />
              <span>{profile.income}</span>
            </span>
          )}

          {(profile.city || profile.district) && (
            <span className="inline-flex items-center gap-1 text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>{[profile.city, profile.district].filter(Boolean).join(', ')}</span>
            </span>
          )}

          {horoscopeLabel && (
            <span className="inline-flex items-center gap-1 text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>{horoscopeLabel}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
