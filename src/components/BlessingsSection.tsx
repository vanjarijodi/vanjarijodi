import React from 'react';
import { Sparkles, Compass, ShieldCheck, Heart, Users } from 'lucide-react';
import { SantBhagwanBabaPortrait } from './SantBhagwanBabaPortrait';
import { useApp } from '../context/AppContext';

export const BlessingsSection: React.FC = () => {
  const { siteConfig, language } = useApp();

  // The authentic historical photograph of Shree Kshetra Bhagwangad Temple
  const bhagwangadImg = siteConfig.bhagwangadImg || "https://upload.wikimedia.org/wikipedia/mr/f/f3/%E0%A4%AD%E0%A4%97%E0%A4%B5%E0%A4%BE%E0%A4%A8%E0%A4%97%E0%A4%A1.JPG";
  const bhagwangadBadgeText = siteConfig.bhagwangadBadgeText || "॥ पावन तीर्थक्षेत्र ॥";
  const bhagwangadHeading = siteConfig.bhagwangadHeading || "श्री क्षेत्र भगवानगड (खरवंडी)";
  const bhagwangadSubtitle = siteConfig.bhagwangadSubtitle || "वंजारी समाजाची सर्वात मोठी सांस्कृतिक व आध्यात्मिक राजधानी";
  const bhagwangadDescription = siteConfig.bhagwangadDescription || "भगवानगड हे महाराष्ट्रातील अहमदनगर जिल्ह्यातील पाथर्डी तालुक्यात डोंगरावर वसलेले वंजारी समाजाचे सर्वोच्च श्रद्धास्थान व शक्तीपीठ आहे. राष्ट्रसंत भगवान बाबांनी या गडाची स्थापना करून समाजाला प्रबोधनाचा व समाजसुधारणेचा मार्ग दाखवला. गडावरील दसरा मेळाव्याचा ऐतिहासिक सोहळा आणि संत सेवा वंजारी समाजाच्या प्रत्येक बांधवाच्या मनात आदराचे स्थान ठेवून आहे. आम्ही या पवित्र संस्कृतीचा वारसा जपत, संपूर्ण महाराष्ट्रातील वंजारी उपवधू-वरांना एका सुसंस्कृत धाग्यात बांधण्याचे प्रामाणिक काम करत आहोत.";
  const bhagwangadHighlight1 = siteConfig.bhagwangadHighlight1 || "वारसा आणि तत्त्वे";
  const bhagwangadHighlight2 = siteConfig.bhagwangadHighlight2 || "लाखो समाधानी कुटुंबे";
  const bhagwangadHighlight3 = siteConfig.bhagwangadHighlight3 || "पवित्र विवाह बंधने";

  return (
    <section id="blessings-heritage" className="py-12 sm:py-16 bg-[#FFFDF8] border-b border-amber-200 relative overflow-hidden">
      {/* Decorative Ornate Background elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-amber-100/40 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-rose-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 text-[#800C1E] border border-amber-300 text-xs sm:text-sm font-black uppercase tracking-widest shadow-sm">
            <Sparkles className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{language === 'en' ? 'Heritage & Blessing' : 'परंपरा, श्रद्धा आणि आशीर्वाद (Heritage & Blessing)'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#800C1E] tracking-tight">
            {language === 'en' ? 'Rashtrasant Shree Sant Bhagwan Baba & Bhagwangad' : 'राष्ट्रसंत श्री संत भगवान बाबा व भगवानगड'}
          </h2>
          <div className="h-1 w-28 bg-gradient-to-r from-transparent via-[#800C1E] to-transparent mx-auto mt-2 rounded" />
          <p className="text-sm sm:text-base text-slate-700 font-extrabold leading-relaxed mt-2">
            {language === 'en' ? 'Matrimonial services under the divine blessings and culture of Vanjari Samaj!' : 'वंजारी समाजाचे आराध्य दैवत व संस्कृतीच्या पावन आशीर्वादाने वधू-वर सूचक कार्य!'}
          </p>
        </div>

        {/* TWO COLUMN CONTENT - SAINT & TEMPLE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* COLUMN 1: SANT BHAGWAN BABA CARD */}
          <div className="lg:col-span-5 bg-white border-2 border-amber-200 rounded-3xl shadow-lg p-5 sm:p-7 flex flex-col justify-between relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            {/* Soft saffron aura background */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition-all duration-500" />
            
            <div className="space-y-5">
              {/* Image Frame Component with Toggleable Art & Photo */}
              <SantBhagwanBabaPortrait />

              {/* Devotional Description Text */}
              <div className="text-center space-y-2">
                <p className="text-xs sm:text-sm text-slate-700 font-bold leading-relaxed pt-2">
                  {language === 'en'
                    ? 'Great social reformer and spiritual saint of the Vanjari community. He emphasized education, moral values, and social harmony. Inspired by his sacred ideals, we built the VanjariJodi platform.'
                    : 'वंजारी समाजाचे महान प्रबोधनकार, समाजसुधारक आणि राष्ट्रसंत. सावधगिरी, नीतिमत्ता व कौटुंबिक संस्कारांचे महत्त्व त्यांनी समाजाला पटवून दिले. त्यांच्या पवित्र संस्कारांना समोर ठेवून आम्ही \'वंजारी जोडी\' मंचाची निर्मिती केली आहे.'}
                </p>
              </div>
            </div>

            {/* Core Values / Highlights inside Baba Card */}
            <div className="grid grid-cols-2 gap-3 pt-5 mt-5 border-t border-amber-100 text-[11px] sm:text-xs font-black text-slate-800">
              <div className="flex items-center gap-1.5 p-2 bg-amber-50/40 rounded-xl border border-amber-200/50">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{language === 'en' ? '100% Pure Values' : '१००% शुद्ध संस्कार'}</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-amber-50/40 rounded-xl border border-amber-200/50">
                <Heart className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{language === 'en' ? 'Family Trust' : 'कौटुंबिक विश्वास'}</span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: SACRED BHAGWANGAD FORTRESS/TEMPLE CARD */}
          <div className="lg:col-span-7 bg-white border-2 border-amber-200 rounded-3xl shadow-lg overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
            
            {/* Banner Photo Frame */}
            <div className="relative h-56 sm:h-72 overflow-hidden bg-slate-900 shrink-0">
              <img
                src={bhagwangadImg}
                alt="Pavitra Kshetra Bhagwangad Temple"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center opacity-90 transform group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              
              {/* Floating Title & Calligraphy over Banner */}
              <div className="absolute bottom-4 left-4 sm:left-6 text-amber-100 space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#800C1E] text-amber-100 text-[10px] sm:text-xs font-black shadow border border-amber-300/40 uppercase">
                  {language === 'en' ? 'Sacred Holy Shrine' : bhagwangadBadgeText}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {language === 'en' ? 'Shree Kshetra Bhagwangad (Kharwandi)' : bhagwangadHeading}
                </h3>
                <p className="text-[10px] sm:text-xs text-amber-100/90 font-extrabold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {language === 'en' ? 'Cultural and Spiritual Capital of Vanjari Samaj' : bhagwangadSubtitle}
                </p>
              </div>
            </div>

            {/* Description Body */}
            <div className="p-5 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs sm:text-sm text-slate-700 font-bold leading-relaxed">
                {language === 'en'
                  ? 'Bhagwangad is the supreme seat of faith and spiritual strength for the Vanjari community, located on a hill in Pathardi taluka, Ahilyanagar (Ahmednagar) district, Maharashtra. Founded by Rashtrasant Bhagwan Baba, it guided society towards enlightenment and reform. The historic Dasara Melava gathering holds a place of deep respect in the heart of every Vanjari brother & sister. Preserving this sacred heritage, we sincerely work to connect Vanjari brides and grooms across Maharashtra in a cultured bond.'
                  : bhagwangadDescription}
              </p>

              {/* Highlights Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-amber-100">
                <div className="flex items-center gap-2 p-2.5 bg-amber-50/30 rounded-xl border border-amber-100 text-center flex-col sm:justify-center">
                  <Compass className="w-5 h-5 text-amber-600" />
                  <span className="text-xs font-black text-slate-800">{language === 'en' ? 'Heritage & Values' : bhagwangadHighlight1}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-amber-50/30 rounded-xl border border-amber-100 text-center flex-col sm:justify-center">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span className="text-xs font-black text-slate-800">{language === 'en' ? 'Thousands of Happy Families' : bhagwangadHighlight2}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-amber-50/30 rounded-xl border border-amber-100 text-center flex-col sm:justify-center">
                  <Sparkles className="w-5 h-5 text-[#800C1E]" />
                  <span className="text-xs font-black text-slate-800">{language === 'en' ? 'Sacred Marriage Bonds' : bhagwangadHighlight3}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM MOTIVATIONAL QUOTE */}
        <div className="mt-10 sm:mt-12 bg-gradient-to-r from-amber-50 via-amber-100/80 to-amber-50 border-2 border-amber-200 rounded-3xl p-5 text-center max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-2xl bg-[#800C1E] text-amber-100">
              <Heart className="w-5 h-5 text-amber-200 fill-amber-200" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black text-[#800C1E]">
                {language === 'en'
                  ? 'Uniting brides and grooms from our Vanjari community is not just a marriage, but a beautiful union of two cultured families.'
                  : 'आपल्या वंजारी समाजातील वधू-वरांचे विवाह जमवणे हे केवळ लग्न नसून दोन संस्कारशील कुटुंबांची सुंदर जोडणी आहे.'}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-600 font-bold">
                {language === 'en'
                  ? 'A sacred matrimony portal based on the teachings of Bhagwan Baba.'
                  : 'संत ज्ञानेश्वर आणि भगवान बाबांच्या शिकवणुकीवर आधारित पवित्र विवाह मंच.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById('profiles-section') || document.querySelector('header');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-5 py-2.5 rounded-2xl bg-[#800C1E] hover:bg-[#600816] text-amber-100 text-xs sm:text-sm font-black shadow transition-transform active:scale-95 whitespace-nowrap cursor-pointer"
          >
            {language === 'en' ? 'Start Searching BioData' : 'बायोडाटा शोधणे सुरू करा'}
          </button>
        </div>

      </div>
    </section>
  );
};

