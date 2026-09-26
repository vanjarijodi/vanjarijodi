export interface PresetFieldOption {
  id: string;
  label: string;
  placeholder: string;
  section: 'personal' | 'astrology' | 'family' | 'contact';
}

export const BLESSING_PRESETS = [
  '॥ श्री गणेशाय नमः ॥  ॥ श्री संत भगवान बाबा प्रसन्न ॥',
  '॥ श्री गणेशाय नमः ॥  ॥ श्री संत वामनभाऊ प्रसन्न ॥',
  '॥ श्री गणेशाय नमः ॥  ॥ श्री संत भगवान बाबा व वामनभाऊ प्रसन्न ॥',
  '॥ श्री कुलदैवत प्रसन्न ॥  ॥ श्री महालक्ष्मी प्रसन्न ॥',
  '॥ ॐ नमः शिवाय ॥  ॥ श्री संत भगवान बाबा प्रसन्न ॥',
  '॥ श्री गणेशाय नमः ॥  ॥ ॐ नमो भगवते वासुदेवाय ॥',
  '॥ श्री गणेशाय नमः ॥',
];

export const FIELD_PRESETS: PresetFieldOption[] = [
  // Family Presets
  { id: 'chulte', label: 'चुलते (काका)', placeholder: 'उदा. श्री. नामदेव रामराव ... (व्यवसाय/गाव)', section: 'family' },
  { id: 'aatya', label: 'आत्या व आतोबा', placeholder: 'उदा. सौ. व श्री. ... (गाव)', section: 'family' },
  { id: 'mama_gav', label: 'मामाचे नाव व मूळ गाव', placeholder: 'उदा. श्री. अशोकराव ... (मूळ गाव- पाथर्डी)', section: 'family' },
  { id: 'ajoba', label: 'आजोबा / आजी', placeholder: 'उदा. कै. / श्री. ...', section: 'family' },
  { id: 'bhavoji', label: 'भावोजी / मेहुणे', placeholder: 'उदा. श्री. ... (नोकरी/गाव)', section: 'family' },
  { id: 'sheti', label: 'शेती व स्थावर मालमत्ता', placeholder: 'उदा. ५ एकर बागायत शेती, स्वतःचे घर', section: 'family' },
  { id: 'ghar_vahan', label: 'घर व वाहन', placeholder: 'उदा. स्वतःचा फ्लॅट (पुणे), ४ चाकी वाहन', section: 'family' },
  { id: 'relatives_surnames', label: 'पाहुणे / नातेसंबंधातील आडनावे', placeholder: 'उदा. सानप, आंधळे, बडे, नागरगोजे, गिते, जायभाये...', section: 'family' },

  // Personal Presets
  { id: 'weight', label: 'वजन (Weight)', placeholder: 'उदा. ६२ किलो', section: 'personal' },
  { id: 'varna', label: 'वर्ण / रंग', placeholder: 'उदा. गोरा / गव्हाळ', section: 'personal' },
  { id: 'spectacles', label: 'चष्मा (Spectacles)', placeholder: 'उदा. नाही / होय (नंबर: ०.५)', section: 'personal' },
  { id: 'diet', label: 'आहार (Diet)', placeholder: 'उदा. शाकाहारी', section: 'personal' },
  { id: 'hobbies', label: 'छंद / आवड (Hobbies)', placeholder: 'उदा. वाचन, संगीत, प्रवास', section: 'personal' },
  { id: 'languages', label: 'अवगत भाषा (Languages)', placeholder: 'उदा. मराठी, हिंदी, इंग्रजी', section: 'personal' },

  // Astrology Presets
  { id: 'charan', label: 'चरण (Charan)', placeholder: 'उदा. द्वितीय चरण', section: 'astrology' },
  { id: 'gan', label: 'गण (Gan)', placeholder: 'उदा. मनुष्य गण / देव गण', section: 'astrology' },
  { id: 'yoni', label: 'योनी (Yoni)', placeholder: 'उदा. गज / अश्व', section: 'astrology' },

  // Contact Presets
  { id: 'alt_mobile', label: 'पर्यायी संपर्क नंबर', placeholder: 'उदा. 9822XXXXXX (वडिलांचा नंबर)', section: 'contact' },
  { id: 'email', label: 'ईमेल (Email)', placeholder: 'उदा. example@gmail.com', section: 'contact' },
  { id: 'instagram', label: 'सोशल मीडिया (Instagram)', placeholder: 'उदा. @username', section: 'contact' },
];
