import React from 'react';
import { ShieldCheck, Award, Briefcase, Heart, Sparkles, MapPin, GraduationCap, IndianRupee, Sun, Camera, CheckCircle2, Stethoscope, Code2, Landmark } from 'lucide-react';
import { UserProfile } from '../types';
import { useApp } from '../context/AppContext';
import { getStructuredProfessionInfo, getTagStyleClass } from '../utils/professionUtils';

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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-950 border border-rose-300 shadow-xs">
            <span>{isEn ? 'Divorced' : '💔 घटस्फोटित'}</span>
          </span>
        );
      case 'widowed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-900 border border-purple-300 shadow-xs">
            <span>{isEn ? 'Widowed' : '🕊️ विधवा / विधुर'}</span>
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

  // 2. Extract Structured Profession Info
  const {
    isGovt,
    isDoctor,
    isEngineer,
    isOfficer,
    isTeacher,
    isPolice,
    isBusiness,
    isFarmer,
    allBadges
  } = getStructuredProfessionInfo(profile);

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

  // Custom tags from profile (excluding ones already rendered in main roles if duplicate)
  const additionalTags = (profile.professionTags || []).filter(t => t && t.trim().length > 0);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Primary Badges (Verification, Govt, Doctor, Profession) */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Phone Verified Badge */}
        {(profile.isPhoneVerified || profile.truecallerVerified) && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-blue-600 to-cyan-600 text-white border border-blue-300 shadow-xs" title={profile.truecallerName ? `Truecaller व्हेरिफाइड: ${profile.truecallerName}` : "मोबाईल नंबर पडताळणी पूर्ण"}>
            <CheckCircle2 className="w-3 h-3 text-cyan-100" />
            <span>{profile.phoneVerificationMethod === 'truecaller' ? (isEn ? 'Truecaller Verified' : 'Truecaller व्हेरिफाइड') : (isEn ? 'Phone Verified' : '📱 नंबर व्हेरिफाइड')}</span>
          </span>
        )}

        {/* Face Verified Badge */}
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
            <span>{isEn ? 'Verified' : 'पडताळणीकृत'}</span>
          </span>
        )}

        {/* Custom Admin Badge */}
        {profile.adminBadge && !profile.hideBadge && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-[#A71930] to-[#800C1E] text-amber-200 border border-amber-400 shadow-xs">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>{profile.adminBadge}</span>
          </span>
        )}

        {/* 🏛️ 1. Government Job / Sector Badge */}
        {isGovt && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 border border-amber-600 shadow-xs">
            <Landmark className="w-3.5 h-3.5 text-slate-950" />
            <span>{isEn ? '🏛️ Govt. Job / Officer' : '🏛️ शासकीय / सरकारी नोकरी'}</span>
          </span>
        )}

        {/* 🏛️ 2. Class 1 / Class 2 Officer Badge */}
        {isOfficer && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-700 to-yellow-800 text-amber-100 border border-amber-400 shadow-xs">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>{isEn ? '🏛️ Class-1 / Class-2 Officer' : '🏛️ वर्ग-१ / वर्ग-२ अधिकारी'}</span>
          </span>
        )}

        {/* 🩺 3. Doctor / Medical Officer Badge */}
        {isDoctor && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-teal-700 to-emerald-800 text-teal-100 border border-teal-400 shadow-xs">
            <Stethoscope className="w-3.5 h-3.5 text-teal-300" />
            <span>{isEn ? '🩺 Doctor / Medical' : '🩺 डॉक्टर / मेडिकल ऑफिसर'}</span>
          </span>
        )}

        {/* 💻 4. Engineer / IT Badge */}
        {isEngineer && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-cyan-800 to-blue-900 text-cyan-100 border border-cyan-400 shadow-xs">
            <Code2 className="w-3.5 h-3.5 text-cyan-300" />
            <span>{isEn ? '💻 Engineer / IT' : '💻 इंजिनिअर / IT'}</span>
          </span>
        )}

        {/* 👨‍🏫 5. Teacher / Professor Badge */}
        {isTeacher && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-800 text-indigo-100 border border-indigo-400 shadow-xs">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-300" />
            <span>{isEn ? '👨‍🏫 Professor / Teacher' : '👨‍🏫 प्राध्यापक / शिक्षक'}</span>
          </span>
        )}

        {/* 👮 6. Police / Defence Badge */}
        {isPolice && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-900 text-blue-100 border border-blue-400 shadow-xs">
            <span>{isEn ? '👮 Police / Defence' : '👮 पोलीस / सैन्यदल'}</span>
          </span>
        )}

        {/* 🏢 7. Business Badge (if not govt) */}
        {!isGovt && isBusiness && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-800 text-purple-100 border border-purple-400 shadow-xs">
            <Briefcase className="w-3.5 h-3.5 text-purple-300" />
            <span>{isEn ? '🏢 Business / Self-Employed' : '🏢 व्यावसायिक / उद्योगपती'}</span>
          </span>
        )}

        {/* 🌾 8. Farmer / Agriculture Badge */}
        {!isGovt && isFarmer && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-900 text-emerald-100 border border-emerald-500 shadow-xs">
            <span>{isEn ? '🌾 Agriculture & Farming' : '🌾 शेतकरी / बागायतदार'}</span>
          </span>
        )}

        {/* Additional Custom Profile Tags (deduplicated) */}
        {additionalTags.map((tag, idx) => {
          // Avoid duplicating tags already rendered above
          if (
            (isGovt && tag.includes('सरकारी')) ||
            (isDoctor && tag.includes('डॉक्टर')) ||
            (isEngineer && (tag.includes('इंजिनिअर') || tag.includes('आयटी'))) ||
            (isTeacher && tag.includes('शिक्षक')) ||
            (isPolice && tag.includes('पोलीस'))
          ) {
            return null;
          }
          return (
            <span
              key={idx}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border shadow-xs ${getTagStyleClass(tag)}`}
            >
              {tag}
            </span>
          );
        })}

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

