import React, { useState } from 'react';
import {
  FileText,
  Heart,
  Megaphone,
  HelpCircle,
  Shield,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Image as ImageIcon,
  Edit3
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SuccessStory } from '../types';

export const AdminCmsManager: React.FC = () => {
  const {
    siteConfig,
    setSiteConfig,
    successStories,
    addSuccessStory,
    deleteSuccessStory,
    approveSuccessStory
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'announcements' | 'stories' | 'faqs' | 'policies'>('announcements');

  // Announcement / Banners State
  const [noticeText, setNoticeText] = useState(siteConfig.noticeBannerText || siteConfig.topBarText || '');
  const [isNoticeEnabled, setIsNoticeEnabled] = useState(siteConfig.isNoticeBannerEnabled ?? true);
  const [heroHeading, setHeroHeading] = useState(siteConfig.heroHeading || '');
  const [heroSubheading, setHeroSubheading] = useState(siteConfig.heroSubheading || '');

  // New Story Form
  const [isAddingStory, setIsAddingStory] = useState(false);
  const [groomName, setGroomName] = useState('');
  const [brideName, setBrideName] = useState('');
  const [marriageDate, setMarriageDate] = useState('');
  const [storyText, setStoryText] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Policies State
  const [termsText, setTermsText] = useState(
    siteConfig.termsOfServiceText ||
      '१. वंजारी जोडी पोर्टलवर फक्त वंजारी समाजातील वधू-वरांसाठी नोंदणी अनुज्ञेय आहे.\n२. सर्व माहिती सत्य व खरी असणे बंधनकारक आहे.\n३. आधार पडताळणी केल्यावरच प्रोफाइलला अधिकृत Blue Tick प्राप्त होईल.\n४. कोणत्याही सदस्याशी गैरवर्तन केल्यास खाते तात्काळ कायमस्वरूपी ब्लॉक केले जाईल.'
  );
  const [privacyText, setPrivacyText] = useState(
    siteConfig.privacyPolicyText ||
      '१. सदस्यांची गोपनीय कागदपत्रे (उदा. आधार कार्ड) सुरक्षित साठवली जातात व केवळ ॲडमिन पडताळणीसाठी वापरली जातात.\n२. स्क्रीनशॉट प्रतिबंध व वॉटरमार्क तंत्रज्ञानाद्वारे सदस्यांचे फोटो व माहिती संरक्षित केली जाते.\n३. सदस्य त्यांच्या इच्छेनुसार प्रोफाइल लपवू (Hidden Mode) शकतात.'
  );

  // FAQs State
  const [faqs, setFaqs] = useState<Array<{ q: string; a: string }>>([
    {
      q: 'वंजारी जोडीवर नोंदणी कशी करावी?',
      a: 'नोंदणी करण्यासाठी "नवीन नोंदणी" बटनावर क्लिक करा, तुमचा चालू मोबाईल नंबर टाका, बायोडाटा व फोटो भरा.'
    },
    {
      q: 'ब्लू टिक (Blue Tick) व्हेरिफिकेशन कसे मिळवायचे?',
      a: 'प्रोफाइलमधील "सुरक्षा व पडताळणी" विभागात जाऊन आधार कार्ड समोरचा व मागचा फोटो आणि सेल्फी अपलोड करा. ॲडमिन तपासणीनंतर २४ तासांत ब्लू टिक मिळते.'
    },
    {
      q: 'स्क्रीनशॉट प्रोटेक्शन कसे काम करते?',
      a: 'मोबाइल ॲपमध्ये ॲप लेव्हलवर स्क्रीनशॉट व स्क्रीन रेकॉर्डिंग ब्लॉक असते. वेबवर कॉपी प्रतिबंध आणि सुरक्षित वॉटरमार्क लागू असतो.'
    }
  ]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  const handleSaveAnnouncements = () => {
    setSiteConfig((prev) => ({
      ...prev,
      noticeBannerText: noticeText,
      topBarText: noticeText,
      isNoticeBannerEnabled: isNoticeEnabled,
      heroHeading,
      heroSubheading
    }));
    alert('✅ बॅनर व घोषणा यशस्वीरित्या सेव्ह झाल्या!');
  };

  const handleSavePolicies = () => {
    setSiteConfig((prev) => ({
      ...prev,
      termsOfServiceText: termsText,
      privacyPolicyText: privacyText
    }));
    alert('✅ अटी व शर्ती (Terms) आणि गोपनीयता धोरण (Privacy Policy) यशस्वीरित्या अपडेट झाले!');
  };

  const handleAddStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groomName.trim() || !brideName.trim()) {
      alert('कृपया वर आणि वधूचे नाव भरा');
      return;
    }

    const story: SuccessStory = {
      id: `story_${Date.now()}`,
      groomName,
      brideName,
      marriageDate: marriageDate || '२०२६',
      story: storyText || 'वंजारी जोडीच्या माध्यमातून आमचे लग्न जुळले!',
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&auto=format&fit=crop&q=80',
      likes: 15,
      status: 'approved'
    };

    addSuccessStory(story);
    setGroomName('');
    setBrideName('');
    setMarriageDate('');
    setStoryText('');
    setPhotoUrl('');
    setIsAddingStory(false);
    alert('✅ नवीन यशोगाथा (Success Story) यशस्वीरीत्या प्रसिद्ध झाली!');
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setFaqs((prev) => [...prev, { q: newQuestion.trim(), a: newAnswer.trim() }]);
    setNewQuestion('');
    setNewAnswer('');
  };

  const handleDeleteFaq = (index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-5">
      {/* CMS Header & Sub-Tabs */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-amber-300 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-black">
            <FileText className="w-6 h-6 text-[#800C1E]" />
          </div>
          <div>
            <h2 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
              कंटेंट मॅनेजमेंट सिस्टीम (CMS)
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#800C1E] text-white font-bold">
                Live CMS
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-semibold">
              वेबसाइट व ॲपवरील बॅनर, यशोगाथा, वारंवार विचारले जाणारे प्रश्न (FAQs) आणि कायदेशीर धोरणे व्यवस्थापित करा
            </p>
          </div>
        </div>

        {/* Sub-Navigation Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('announcements')}
            className={`px-3 py-1.5 text-xs font-black rounded-xl transition ${
              activeSubTab === 'announcements'
                ? 'bg-[#800C1E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📢 घोषणा व बॅनर
          </button>
          <button
            onClick={() => setActiveSubTab('stories')}
            className={`px-3 py-1.5 text-xs font-black rounded-xl transition ${
              activeSubTab === 'stories'
                ? 'bg-[#800C1E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💖 यशोगाथा
          </button>
          <button
            onClick={() => setActiveSubTab('faqs')}
            className={`px-3 py-1.5 text-xs font-black rounded-xl transition ${
              activeSubTab === 'faqs'
                ? 'bg-[#800C1E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ❓ FAQs
          </button>
          <button
            onClick={() => setActiveSubTab('policies')}
            className={`px-3 py-1.5 text-xs font-black rounded-xl transition ${
              activeSubTab === 'policies'
                ? 'bg-[#800C1E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚖️ अटी व गोपनीयता
          </button>
        </div>
      </div>

      {/* SUB TAB 1: Announcements & Home Page Banners */}
      {activeSubTab === 'announcements' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-600" />
              होमपेज बॅनर व मुख्य सूचना (Notice Banner & Header)
            </h3>
            <button
              onClick={handleSaveAnnouncements}
              className="px-4 py-2 bg-[#800C1E] hover:bg-[#670A18] text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" /> सेव्ह करा
            </button>
          </div>

          <div className="space-y-4 text-xs font-bold text-slate-700">
            {/* Notice Banner Toggle */}
            <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-2xl">
              <div>
                <span className="text-slate-900 block font-black">सूचना पट्टी (Notice Marquee Banner)</span>
                <span className="text-slate-500 font-normal">होमपेजवर सर्वात वर धावती घोषणा पट्टी चालू ठेवा</span>
              </div>
              <input
                type="checkbox"
                checked={isNoticeEnabled}
                onChange={(e) => setIsNoticeEnabled(e.target.checked)}
                className="w-5 h-5 accent-[#800C1E] rounded cursor-pointer"
              />
            </div>

            {/* Notice Banner Text */}
            <div>
              <label className="block mb-1">घोषणा पट्टी मजकूर (Notice Text)</label>
              <textarea
                rows={2}
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                placeholder="उदा. 📢 ॥ श्री संत भगवान बाबा प्रसन्न ॥ — वंजारी समाजातील वधू-वरांसाठी अधिकृत नोंदणी व संपर्क सुविधा उपलब्ध!"
              />
            </div>

            {/* Hero Heading */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">मुख्य शीर्षक (Hero Heading)</label>
                <input
                  type="text"
                  value={heroHeading}
                  onChange={(e) => setHeroHeading(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                  placeholder="उदा. वंजारी समाजातील लाखो विश्वासू वधू-वर"
                />
              </div>
              <div>
                <label className="block mb-1">उपशीर्षक (Hero Subheading)</label>
                <input
                  type="text"
                  value={heroSubheading}
                  onChange={(e) => setHeroSubheading(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                  placeholder="उदा. सुरक्षित व खात्रीशीर विवाह जुळवणी मंच"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: Success Stories */}
      {activeSubTab === 'stories' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600" />
              यशोगाथा व्यवस्थापन (Success Stories - {successStories.length})
            </h3>
            <button
              onClick={() => setIsAddingStory(!isAddingStory)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> नवीन यशोगाथा जोडा
            </button>
          </div>

          {/* Add Story Form Modal */}
          {isAddingStory && (
            <form onSubmit={handleAddStory} className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
              <h4 className="font-black text-slate-900 text-xs">नवीन यशोगाथा माहिती प्रविष्ट करा</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
                <div>
                  <label className="block mb-1">वराचे नाव (Groom Name) *</label>
                  <input
                    required
                    type="text"
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                    placeholder="उदा. राहुल दराडे"
                  />
                </div>
                <div>
                  <label className="block mb-1">वधूचे नाव (Bride Name) *</label>
                  <input
                    required
                    type="text"
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                    placeholder="उदा. स्नेहा सानप"
                  />
                </div>
                <div>
                  <label className="block mb-1">विवाह तारीख / वर्ष</label>
                  <input
                    type="text"
                    value={marriageDate}
                    onChange={(e) => setMarriageDate(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                    placeholder="उदा. २५ डिसेंबर २०२५"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
                <div>
                  <label className="block mb-1">जोडप्याचा फोटो URL</label>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <div>
                  <label className="block mb-1">अनुभव / संदेश (Story)</label>
                  <textarea
                    rows={2}
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                    placeholder="वंजारी जोडी ॲपमुळे आमचा विवाह जुळला..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingStory(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#800C1E] text-white font-black text-xs rounded-xl shadow-xs"
                >
                  प्रसिद्ध करा
                </button>
              </div>
            </form>
          )}

          {/* Stories List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {successStories.map((s) => (
              <div
                key={s.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 relative"
              >
                <img
                  src={s.photoUrl}
                  alt={s.groomName}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-300 shrink-0"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="font-black text-slate-900 text-xs truncate">
                    {s.groomName} ❤️ {s.brideName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold">{s.marriageDate}</div>
                  <p className="text-[11px] text-slate-700 line-clamp-2 leading-relaxed">
                    "{s.story}"
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('ही यशोगाथा हटवायची आहे का?')) {
                      deleteSuccessStory(s.id);
                    }
                  }}
                  className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg shrink-0 cursor-pointer"
                  title="हटवा"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 3: FAQs */}
      {activeSubTab === 'faqs' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              वारंवार विचारले जाणारे प्रश्न (FAQs Management)
            </h3>
          </div>

          {/* Add FAQ Form */}
          <form onSubmit={handleAddFaq} className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-2xl space-y-3">
            <div className="font-bold text-xs text-indigo-950">नवीन FAQ जोडा</div>
            <div>
              <input
                required
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="प्रश्न (उदा. फोटो सुरक्षेसाठी काय सुविधा आहे?)"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold outline-none"
              />
            </div>
            <div>
              <textarea
                required
                rows={2}
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="उत्तर प्रविष्ट करा..."
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> FAQ जोडा
            </button>
          </form>

          {/* FAQ List */}
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="text-indigo-600">प्र. {index + 1}:</span>
                    {faq.q}
                  </div>
                  <div className="text-xs text-slate-600 font-medium leading-relaxed pl-5">
                    {faq.a}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteFaq(index)}
                  className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer shrink-0"
                  title="हटवा"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 4: Policies (Terms & Conditions and Privacy) */}
      {activeSubTab === 'policies' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#800C1E]" />
              नियम व अटी (Terms) आणि गोपनीयता धोरण (Privacy Policy)
            </h3>
            <button
              onClick={handleSavePolicies}
              className="px-4 py-2 bg-[#800C1E] hover:bg-[#670A18] text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" /> बदल सेव्ह करा
            </button>
          </div>

          <div className="space-y-4 text-xs font-bold text-slate-700">
            <div>
              <label className="block mb-1">नियम व अटी (Terms & Conditions Text)</label>
              <textarea
                rows={5}
                value={termsText}
                onChange={(e) => setTermsText(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block mb-1">गोपनीयता धोरण (Privacy Policy Text)</label>
              <textarea
                rows={5}
                value={privacyText}
                onChange={(e) => setPrivacyText(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
