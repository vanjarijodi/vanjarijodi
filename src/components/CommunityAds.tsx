import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Megaphone,
  Calendar,
  ExternalLink,
  Sparkles,
  PlusCircle,
  Phone,
  MessageCircle,
  Building2,
  Camera,
  GraduationCap,
  Tag,
  X,
  Info,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Eye,
  Award
} from 'lucide-react';
import { CommunityAd } from '../types';

export const CommunityAds: React.FC = () => {
  const { communityAds, language, setIsAdminOpen, isAdsEnabled } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeAdModal, setActiveAdModal] = useState<CommunityAd | null>(null);

  if (!isAdsEnabled) return null;

  const activeAds = (communityAds || []).filter((ad) => ad.isActive);

  // Filter ads based on category tab
  const filteredAds = activeAds.filter((ad) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'meetup') return ad.type === 'meetup' || ad.categoryTag?.includes('मेळावा');
    if (selectedCategory === 'hall') return ad.categoryTag?.includes('मंगल') || ad.categoryTag?.includes('हॉल');
    if (selectedCategory === 'photography') return ad.categoryTag?.includes('फोटो') || ad.categoryTag?.includes('कॅमेरा');
    if (selectedCategory === 'sponsor') return ad.type === 'sponsor' || ad.type === 'business';
    return true;
  });

  return (
    <section id="ads-section" className="py-16 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white relative overflow-hidden border-t-4 border-amber-500">
      
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Badge & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-amber-500/20">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 text-xs font-black mb-3 border border-amber-500/40 shadow-lg">
              <Megaphone className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>{language === 'en' ? 'Community Ads & Showcase' : 'डिजिटल जाहिरात व प्रायोजित उपक्रम मंच (Community Ads & Showcase)'}</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-black text-amber-200 tracking-tight leading-tight">
              {language === 'en' ? 'Vanjari Community Meetups, Ads & Sponsors' : 'वंजारी समाज जाहिराती, मेळावे व प्रायोजक'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-2 max-w-2xl">
              {language === 'en'
                ? 'Official matrimonial meets, wedding halls, photography, businesses, and community services.'
                : 'वंजारी समाजातील अधिकृत वधू-वर मेळावे, मंगल कार्यालये, व्यवसाय, सेवा व उपक्रमांच्या आकर्षित जाहिराती.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm border border-amber-300 shadow-xl flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{language === 'en' ? 'Add / Edit Ad (Admin)' : 'जाहिरात जोडा / संपादन (Admin)'}</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {[
            { id: 'all', label: language === 'en' ? 'All Ads' : 'सर्व जाहिराती', icon: Megaphone, count: activeAds.length },
            { id: 'meetup', label: language === 'en' ? 'Matrimonial Meets' : 'वधू-वर मेळावे', icon: Calendar, count: activeAds.filter(a => a.type === 'meetup' || a.categoryTag?.includes('मेळावा')).length },
            { id: 'hall', label: language === 'en' ? 'Wedding Halls' : 'मंगल कार्यालये', icon: Building2, count: activeAds.filter(a => a.categoryTag?.includes('मंगल') || a.categoryTag?.includes('हॉल')).length },
            { id: 'photography', label: language === 'en' ? 'Photography' : 'फोटोग्राफी व कॅमेरा', icon: Camera, count: activeAds.filter(a => a.categoryTag?.includes('फोटो')).length },
            { id: 'sponsor', label: language === 'en' ? 'Sponsors' : 'विशेष प्रायोजक', icon: Award, count: activeAds.filter(a => a.type === 'sponsor' || a.type === 'business').length },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg scale-105'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{cat.label}</span>
                {cat.count > 0 && (
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${isSelected ? 'bg-slate-950 text-amber-300' : 'bg-slate-900 text-slate-300'}`}>
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Advertisements Grid */}
        {filteredAds.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 p-8">
            <Megaphone className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-60" />
            <p className="text-base font-bold text-slate-300">{language === 'en' ? 'No advertisements available in this category currently.' : 'या श्रेणीमध्ये सध्या जाहिराती उपलब्ध नाहीत.'}</p>
            <p className="text-xs text-slate-400 mt-1">{language === 'en' ? 'New ads can be added instantly from Admin panel.' : 'ॲडमिन पॅनेलवरून नवीन जाहिरात त्वरित जोडता येईल.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredAds.map((ad) => (
              <div
                key={ad.id}
                className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl hover:border-amber-400 transition-all duration-300 group flex flex-col justify-between hover:shadow-amber-500/10"
              >
                {/* Banner Image Container */}
                <div className="relative h-60 sm:h-72 overflow-hidden bg-slate-950 cursor-pointer" onClick={() => setActiveAdModal(ad)}>
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 opacity-90"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {/* Category Tag / Badge Top Left */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3.5 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl flex items-center gap-1.5 border border-amber-300">
                      <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                      <span>{ad.categoryTag || (ad.type === 'meetup' ? (language === 'en' ? 'Matrimony Meet' : 'वधू-वर मेळावा') : (language === 'en' ? 'Sponsored Ad' : 'प्रायोजित जाहिरात'))}</span>
                    </span>
                    {ad.badgeText && (
                      <span className="px-3 py-1.5 rounded-full bg-rose-600 text-white font-black text-xs shadow-xl border border-rose-300">
                        {ad.badgeText}
                      </span>
                    )}
                  </div>

                  {/* Quick View Button Overlay */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 text-amber-300 p-2 rounded-full border border-amber-400/50">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3
                      onClick={() => setActiveAdModal(ad)}
                      className="text-xl sm:text-2xl font-black text-amber-300 group-hover:text-amber-200 transition-colors cursor-pointer leading-snug"
                    >
                      {ad.title}
                    </h3>
                    
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                      {ad.description}
                    </p>
                  </div>

                  {/* Actions & Contact Buttons */}
                  <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                    {ad.contactPhone ? (
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${ad.contactPhone}`}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all"
                        >
                          <Phone className="w-3.5 h-3.5 text-amber-400" />
                          <span>{ad.contactPhone}</span>
                        </a>

                        <a
                          href={`https://wa.me/${ad.contactPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello, I saw your ad on VanjariJodi.')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-500/40 transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{language === 'en' ? 'Verified VanjariJodi Ad' : 'वंजारी जोडी प्रमाणित जाहिरात'}</span>
                      </div>
                    )}

                    <button
                      onClick={() => setActiveAdModal(ad)}
                      className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1.5 ml-auto transition-all"
                    >
                      <span>{language === 'en' ? 'Full Details' : 'पूर्ण माहिती'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Full Advertisement Detail Modal */}
      {activeAdModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative text-white my-8">
            
            <button
              onClick={() => setActiveAdModal(null)}
              className="absolute top-4 right-4 z-20 bg-slate-950/80 hover:bg-slate-950 text-amber-300 p-2 rounded-full border border-amber-400/50 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-950">
              <img
                src={activeAdModal.imageUrl}
                alt={activeAdModal.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40" />
              
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                <span className="px-3.5 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider">
                  {activeAdModal.categoryTag || (language === 'en' ? 'Sponsored Ad' : 'विशेष प्रायोजित जाहिरात')}
                </span>
                {activeAdModal.badgeText && (
                  <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-black text-xs">
                    {activeAdModal.badgeText}
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              <h3 className="text-2xl sm:text-3xl font-black text-amber-300 leading-tight">
                {activeAdModal.title}
              </h3>

              <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-400" />
                  <span>{language === 'en' ? 'Detailed Ad Information' : 'जाहिरात सविस्तर तपशील'}</span>
                </h4>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line">
                  {activeAdModal.description}
                </p>
              </div>

              {/* Contact Actions in Modal */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                {activeAdModal.contactPhone && (
                  <>
                    <a
                      href={`tel:${activeAdModal.contactPhone}`}
                      className="w-full sm:w-auto flex-1 py-3 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{language === 'en' ? 'Call Now' : 'कॉल करा'}: {activeAdModal.contactPhone}</span>
                    </a>

                    <a
                      href={`https://wa.me/${activeAdModal.contactPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello, I am interested in your ad on VanjariJodi.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto flex-1 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{language === 'en' ? 'Chat on WhatsApp' : 'WhatsApp वर चॅट करा'}</span>
                    </a>
                  </>
                )}

                {activeAdModal.linkUrl && (
                  <a
                    href={activeAdModal.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-sm border border-amber-500/40 flex items-center justify-center gap-2 transition-all"
                  >
                    <span>{language === 'en' ? 'Website / Link' : 'वेबसाईट / लिंक'}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
