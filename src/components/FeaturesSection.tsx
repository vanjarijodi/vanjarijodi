import React from 'react';
import { ShieldCheck, Lock, PhoneCall, UserCheck, Sparkles, CheckCircle2, Heart, Users, Shield, Award, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ICON_MAP: Record<string, any> = {
  ShieldCheck,
  Lock,
  PhoneCall,
  UserCheck,
  Sparkles,
  Heart,
  Users,
  Shield,
  Award,
  Phone
};

export const FeaturesSection: React.FC = () => {
  const { setIsRegisterOpen, siteConfig, language } = useApp();

  const customBoxes = siteConfig.featureBoxes?.filter((b) => b.isEnabled) || [];

  const defaultFeatures = [
    {
      id: 'f-1',
      icon: ShieldCheck,
      color: 'from-amber-500 to-orange-500',
      title: language === 'en' ? 'Verified Profiles' : 'सत्यापित प्रोफाइल (Verified Profiles)',
      desc: language === 'en' ? 'Mobile and profile details screened by Admin team for authentic matchmaking.' : 'मोबाईल आणि प्रोफाईल माहितीची ॲडमिन टीमद्वारे प्राथमिक पडताळणी केली जाते.'
    },
    {
      id: 'f-2',
      icon: Lock,
      color: 'from-orange-500 to-amber-600',
      title: language === 'en' ? 'Profile Privacy' : 'संपूर्ण गोपनीयता (Privacy & Safety)',
      desc: language === 'en' ? 'Your photos and personal details are fully safe. Contact options disclosed only with permission.' : 'तुमचे फोटो आणि वैयक्तिक माहिती पूर्णपणे सुरक्षित. तुमच्या परवानगीशिवाय संपर्क उघड केला जात नाही.'
    },
    {
      id: 'f-3',
      icon: PhoneCall,
      color: 'from-amber-600 to-rose-600',
      title: language === 'en' ? 'Secure Contact' : 'सुरक्षित संपर्क (Secure Contact)',
      desc: language === 'en' ? 'Mobile numbers are kept confidential and accessible only after Admin authorization.' : 'मोबाईल नंबर सार्वजनिकपणे उघडे नसून ॲडमिनद्वारे authorized झाल्यानंतरच संपर्क साधता येतो.'
    },
    {
      id: 'f-4',
      icon: UserCheck,
      color: 'from-amber-500 to-emerald-600',
      title: language === 'en' ? 'Admin Approval' : 'प्रशासकीय मान्यता (Admin Approval)',
      desc: language === 'en' ? 'Every new registration undergoes strict background check by Admin team before approval.' : 'प्रत्येक नवीन नोंदणीची ॲडमिन टीमद्वारे कसून तपासणी करूनच प्रणालीत मंजुरी दिली जाते.'
    }
  ];

  return (
    <section className="py-20 bg-slate-950 text-white relative overflow-hidden border-t border-amber-500/20">
      {/* Background Subtle Glows */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/30 uppercase tracking-widest shadow-inner">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>{language === 'en' ? 'Special Features' : 'खास वैशिष्ट्ये (Special Features)'}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {language === 'en' ? (
              <span>Safe & Modern Matrimonial Services for <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 bg-clip-text text-transparent">Vanjari Samaj</span></span>
            ) : (
              <>वंजारी समाजासाठी <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 bg-clip-text text-transparent">सुरक्षित व आधुनिक</span> सेवा</>
            )}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            {language === 'en'
              ? 'No. 1 matrimonial portal built with privacy, safety, and modern technology.'
              : 'सुरक्षितता, गोपनीयता आणि आधुनिक तंत्रज्ञानाची सांगड घालून तयार केलेले नंबर १ मॅट्रीमोनी पोर्टल.'}
          </p>
        </div>

        {/* Dynamic / Custom Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {customBoxes.length > 0
            ? customBoxes.map((box, idx) => {
                const IconComp = ICON_MAP[box.iconName] || ShieldCheck;
                return (
                  <div
                    key={box.id}
                    className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 rounded-3xl p-8 shadow-2xl hover:border-amber-400 transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-all pointer-events-none" />

                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 p-0.5 shadow-xl mb-6 group-hover:scale-110 transition-transform">
                        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                          <IconComp className="w-7 h-7 text-amber-300" />
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-300 transition-colors">
                        {box.title}
                      </h3>

                      <p className="text-slate-400 text-sm leading-relaxed">
                        {box.desc}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-900 flex items-center justify-between text-xs font-bold text-amber-400">
                      <span>{language === 'en' ? 'Safe & Verified Profiles' : 'सुरक्षित व पडताळणीकृत स्थळे'}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                  </div>
                );
              })
            : defaultFeatures.map((item) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={item.id}
                    className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 rounded-3xl p-8 shadow-2xl hover:border-amber-400 transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-all pointer-events-none" />

                    <div>
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${item.color} p-0.5 shadow-xl mb-6 group-hover:scale-110 transition-transform`}>
                        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                          <IconComp className="w-7 h-7 text-amber-300" />
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-300 transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-slate-400 text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-900 flex items-center justify-between text-xs font-bold text-amber-400">
                      <span>{language === 'en' ? 'Safe & Verified Profiles' : 'सुरक्षित व पडताळणीकृत स्थळे'}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                  </div>
                );
              })}

          {/* Quick Registration CTA Card */}
          <div
            onClick={() => setIsRegisterOpen(true)}
            className="bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 border border-amber-300/40 rounded-3xl p-8 shadow-2xl hover:brightness-110 transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col justify-between text-white group"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-white fill-white animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <h3 className="text-2xl font-black mb-3">
                {language === 'en' ? 'Register Profile Now!' : 'आत्ताच प्रोफाइल नोंदवा!'}
              </h3>
              <p className="text-amber-100 text-sm leading-relaxed">
                {language === 'en'
                  ? 'Register today for your family bride/groom and find the right match among thousands.'
                  : 'तुमच्या कुटुंबातील उपवधू-वरांसाठी आजच नोंदणी करा आणि हजारोंमधून योग्य जोडीदार शोधा.'}
              </p>
            </div>

            <div className="pt-6">
              <span className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-950 text-amber-300 font-extrabold text-xs shadow-xl group-hover:bg-slate-900 transition-colors">
                <span>{language === 'en' ? 'Open Registration Form' : 'नोंदणी फॉर्म उघडा'}</span>
                <Sparkles className="w-4 h-4 fill-amber-300" />
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

