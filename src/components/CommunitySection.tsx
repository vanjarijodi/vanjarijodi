import React from 'react';
import { useApp } from '../context/AppContext';
import { Heart, Sparkles, Award, Shield, BookOpen, Users } from 'lucide-react';

export const CommunitySection: React.FC = () => {
  const { t, language } = useApp();

  return (
    <section id="community-section" className="py-16 bg-slate-900 border-t border-amber-500/20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/30">
            <Users className="w-3.5 h-3.5 fill-amber-400" />
            <span>{t('community')}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {t('community_title')}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {t('community_text')}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-slate-950 p-6 rounded-3xl border border-amber-500/20 space-y-4 hover:border-amber-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-amber-300">
              {language === 'mr' ? 'संत श्री भगवान बाबा प्रेरणा' : 'Bhagwan Baba Inspiration'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'mr'
                ? 'भगवान गडावरून मिळणारी सद्भावना, एकता आणि नैतिक मूल्यांची शिकवण समाजात सदैव तेवत ठेवली आहे. वंजारीजोडी समाज बांधवांना जोडण्याचे पवित्र कार्य करत आहे.'
                : 'Guided by the spiritual ideals of Bhagwan Baba from Bhagwangad, fostering community brotherhood, unity, and integrity.'}
            </p>
          </div>

          <div className="bg-slate-950 p-6 rounded-3xl border border-amber-500/20 space-y-4 hover:border-amber-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-amber-300">
              {language === 'mr' ? 'सामाजिक व शैक्षणिक प्रगती' : 'Educational Advancement'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'mr'
                ? 'आज वंजारी समाजातील तरुण-तरुणी आयटी, वैद्यकीय, प्रशासकीय सेवेत (MPSC/UPSC), कृषी आणि उद्योगात उच्च शिखरावर पोहचत आहेत.'
                : 'Vanjari youth are achieving excellence across Engineering, Civil Services, Medicine, IT, Agriculture, and Entrepreneurship.'}
            </p>
          </div>

          <div className="bg-slate-950 p-6 rounded-3xl border border-amber-500/20 space-y-4 hover:border-amber-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center text-white shadow-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-amber-300">
              {language === 'mr' ? 'वधू-वर परिचय मेळावा' : 'Vadhu Var Melava Support'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'mr'
                ? 'डिजिटल माध्यमाच्या साहाय्याने प्रत्यक्ष वधू-वर मेळाव्याची सोय एकाच मोबाईल ॲपवर उपलब्ध करून दिली आहे.'
                : 'Digital Vadhu-Var Melava interface making physical travel unnecessary, accessible 24x7 from any district.'}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
