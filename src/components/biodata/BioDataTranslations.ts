export type BiodataLanguage = 'mr' | 'en';

export interface BiodataI18nStrings {
  modalTitle: string;
  modalSubtitle: string;
  themeLabel: string;
  watermarkBadge: string;
  tabForm: string;
  tabPreview: string;
  
  // Sections
  secPersonal: string;
  secFamily: string;
  secAstrology: string;
  secContact: string;
  secBlessingPhoto: string;
  secAll: string;
  
  // Personal Details
  genderLabel: string;
  genderGroom: string;
  genderBride: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  dobLabel: string;
  dobPlaceholder: string;
  birthTimeLabel: string;
  birthTimePlaceholder: string;
  birthPlaceLabel: string;
  birthPlacePlaceholder: string;
  heightLabel: string;
  heightPlaceholder: string;
  complexionLabel: string;
  complexionPlaceholder: string;
  bloodGroupLabel: string;
  bloodGroupPlaceholder: string;
  educationLabel: string;
  educationPlaceholder: string;
  jobLabel: string;
  jobPlaceholder: string;
  businessLabel: string;
  businessPlaceholder: string;
  incomeLabel: string;
  incomePlaceholder: string;

  // Family Details
  fatherNameLabel: string;
  fatherNamePlaceholder: string;
  fatherOccupationLabel: string;
  fatherOccupationPlaceholder: string;
  motherNameLabel: string;
  motherNamePlaceholder: string;
  brothersLabel: string;
  brothersPlaceholder: string;
  sistersLabel: string;
  sistersPlaceholder: string;
  mamaNameLabel: string;
  mamaNamePlaceholder: string;
  relativesLabel: string;
  relativesPlaceholder: string;

  // Astrology Details
  rashiLabel: string;
  rashiPlaceholder: string;
  nakshatraLabel: string;
  nakshatraPlaceholder: string;
  gotraLabel: string;
  gotraPlaceholder: string;
  devakLabel: string;
  devakPlaceholder: string;
  nadiLabel: string;
  nadiPlaceholder: string;
  mangalLabel: string;
  mangalPlaceholder: string;

  // Contact Details
  mobileLabel: string;
  mobilePlaceholder: string;
  nativePlaceLabel: string;
  nativePlacePlaceholder: string;
  addressLabel: string;
  addressPlaceholder: string;
  expectationsLabel: string;
  expectationsPlaceholder: string;

  // Blessing & Photo
  blessingLabel: string;
  blessingPlaceholder: string;
  photoLabel: string;
  photoUploaded: string;
  photoUploadBtn: string;
  photoRemove: string;
  
  // Custom Fields
  addNewField: string;
  fieldName: string;
  fieldValue: string;

  // Actions
  downloadJpg: string;
  downloadPdf: string;
  addToSystem: string;
  addedToSystem: string;
  shareTelegram: string;
  viewPreviewBtn: string;
  backBtn: string;
  nextBtn: string;
  editDetailsBtn: string;

  // Preview Card Labels
  previewDocTitle: string;
  previewDocSubtitle: string;
  previewCandidateNameDefault: string;
  previewEduPrefix: string;
  previewJobPrefix: string;
  previewBizPrefix: string;
  previewGroomPhoto: string;
  previewBridePhoto: string;

  previewDob: string;
  previewBirthTime: string;
  previewBirthPlace: string;
  previewHeight: string;
  previewComplexion: string;
  previewBloodGroup: string;
  previewIncome: string;

  previewFatherName: string;
  previewMotherName: string;
  previewBrothers: string;
  previewSisters: string;
  previewMamaName: string;
  previewRelatives: string;

  previewRashi: string;
  previewNakshatra: string;
  previewGotra: string;
  previewDevak: string;
  previewNadi: string;
  previewMangal: string;

  previewMobile: string;
  previewNativePlace: string;
  previewAddress: string;
  previewExpectations: string;

  previewFooterTitle: string;
  previewFooterSubtitle: string;
  previewScanQr: string;
}

export const BIODATA_I18N: Record<BiodataLanguage, BiodataI18nStrings> = {
  mr: {
    modalTitle: 'ऑनलाईन बायोडाटा मेकर',
    modalSubtitle: 'सुंदर डिझाईन आणि फॉन्टमध्ये HD बायोडाटा तयार करा',
    themeLabel: 'थीम:',
    watermarkBadge: '🔒 अधिकृत वॉटरमार्क',
    tabForm: '✏️ माहिती भरा (Form)',
    tabPreview: '👁️ बायोडाटा पहा (Preview)',

    secPersonal: '१. वैयक्तिक',
    secFamily: '२. कुटुंब',
    secAstrology: '३. पत्रिका',
    secContact: '४. संपर्क',
    secBlessingPhoto: '५. आशीर्वाद व फोटो',
    secAll: 'सर्व रकाने',

    genderLabel: 'वधू / वर:',
    genderGroom: 'वर (मुलगा)',
    genderBride: 'वधू (मुलगी)',
    fullNameLabel: 'पूर्ण नाव:',
    fullNamePlaceholder: 'उदा. नाव मधले नाव आडनाव',
    dobLabel: 'जन्मतारीख:',
    dobPlaceholder: 'उदा. १५/०८/१९९८',
    birthTimeLabel: 'जन्मवेळ:',
    birthTimePlaceholder: 'उदा. सकाळी ०८:३०',
    birthPlaceLabel: 'जन्मठिकाण:',
    birthPlacePlaceholder: 'उदा. बीड / पुणे',
    heightLabel: 'उंची:',
    heightPlaceholder: 'उदा. ५ फूट ७ इंच',
    complexionLabel: 'रंग (Complexion):',
    complexionPlaceholder: 'उदा. गोरा / गव्हाळ',
    bloodGroupLabel: 'रक्तगट (Blood Grp):',
    bloodGroupPlaceholder: 'उदा. O +ve',
    educationLabel: 'शिक्षण (Education):',
    educationPlaceholder: 'उदा. B.E. Computer Science / MBA',
    jobLabel: 'नोकरी (Job / Occupation):',
    jobPlaceholder: 'उदा. सरकारी नोकरी / सॉफ्टवेअर इंजिनिअर',
    businessLabel: 'व्यवसाय (Business):',
    businessPlaceholder: 'उदा. स्वतःचा उद्योग / कृषी व बागायत',
    incomeLabel: 'वार्षिक उत्पन्न:',
    incomePlaceholder: 'उदा. १० लाख प्रतिवर्ष',

    fatherNameLabel: 'वडिलांचे नाव:',
    fatherNamePlaceholder: 'उदा. वडिलांचे पूर्ण नाव',
    fatherOccupationLabel: 'वडिलांचा व्यवसाय:',
    fatherOccupationPlaceholder: 'उदा. शेती / सेवानिवृत्त अधिकारी',
    motherNameLabel: 'आईचे नाव:',
    motherNamePlaceholder: 'उदा. आईचे पूर्ण नाव (गृहणी)',
    brothersLabel: 'भाऊ:',
    brothersPlaceholder: 'उदा. १ भाऊ (विवाहित)',
    sistersLabel: 'बहीण:',
    sistersPlaceholder: 'उदा. १ बहीण (विवाहित)',
    mamaNameLabel: 'मामाचे नाव व मूळ गाव:',
    mamaNamePlaceholder: 'उदा. श्री. अशोकराव ... (पाथर्डी)',
    relativesLabel: 'नातेसंबंधातील आडनावे:',
    relativesPlaceholder: 'उदा. सानप, आंधळे, बडे, नागरगोजे, गिते...',

    rashiLabel: 'रास:',
    rashiPlaceholder: 'उदा. कुंभ / मेष',
    nakshatraLabel: 'नक्षत्र:',
    nakshatraPlaceholder: 'उदा. पूर्वाभाद्रपदा',
    gotraLabel: 'गोत्र:',
    gotraPlaceholder: 'उदा. कश्यप',
    devakLabel: 'देवक:',
    devakPlaceholder: 'उदा. पंचपल्लव',
    nadiLabel: 'नाडी:',
    nadiPlaceholder: 'उदा. आद्य / मध्य',
    mangalLabel: 'मंगळ:',
    mangalPlaceholder: 'उदा. नाही / होय (सौम्य)',

    mobileLabel: 'मोबाईल नंबर:',
    mobilePlaceholder: 'उदा. 9822XXXXXX',
    nativePlaceLabel: 'मूळ गाव / तालुका:',
    nativePlacePlaceholder: 'उदा. पाथर्डी, जि. अहिल्यानगर',
    addressLabel: 'पत्ता (Address):',
    addressPlaceholder: 'उदा. सध्याचा राहण्याचा पत्ता',
    expectationsLabel: 'अपेक्षा (Expectations):',
    expectationsPlaceholder: 'उदा. सुशिक्षित, सुसंस्कृत व अनुरूप स्थळ',

    blessingLabel: 'संत आशीर्वाद व शीर्षक:',
    blessingPlaceholder: 'उदा. ॥ श्री गणेशाय नमः ॥ ॥ श्री संत भगवान बाबा प्रसन्न ॥',
    photoLabel: 'उमेदवाराचा फोटो:',
    photoUploaded: '✓ फोटो जोडला आहे',
    photoUploadBtn: '📸 बायोडाटावर फोटो लावण्यासाठी निवडा',
    photoRemove: 'हटवा',

    addNewField: '+ नवीन रकाना',
    fieldName: 'रकाण्याचे नाव',
    fieldValue: 'माहिती',

    downloadJpg: 'HD JPG',
    downloadPdf: 'PDF A4',
    addToSystem: 'सिस्टीमला जोडा',
    addedToSystem: 'सिस्टीममध्ये जोडले',
    shareTelegram: 'Telegram',
    viewPreviewBtn: '👁️ बायोडाटा पहा (Preview)',
    backBtn: '← मागे',
    nextBtn: 'पुढे जा →',
    editDetailsBtn: '✏️ माहिती संपादित करा',

    previewDocTitle: 'विवाह बायोडाटा',
    previewDocSubtitle: 'पवित्र नात्यांची सुंदर सुरुवात',
    previewCandidateNameDefault: 'उमेदवाराचे संपूर्ण नाव',
    previewEduPrefix: 'शिक्षण:',
    previewJobPrefix: 'काम:',
    previewBizPrefix: 'व्यवसाय:',
    previewGroomPhoto: 'वर फोटो',
    previewBridePhoto: 'वधू फोटो',

    previewDob: 'जन्मतारीख :-',
    previewBirthTime: 'जन्मवेळ :-',
    previewBirthPlace: 'जन्मठिकाण :-',
    previewHeight: 'उंची :-',
    previewComplexion: 'रंग :-',
    previewBloodGroup: 'रक्तगट :-',
    previewIncome: 'वार्षिक उत्पन्न :-',

    previewFatherName: 'वडिलांचे नाव :-',
    previewMotherName: 'आईचे नाव :-',
    previewBrothers: 'भाऊ :-',
    previewSisters: 'बहीण :-',
    previewMamaName: 'मामाचे नाव :-',
    previewRelatives: 'नातेसंबंध :-',

    previewRashi: 'रास :-',
    previewNakshatra: 'नक्षत्र :-',
    previewGotra: 'गोत्र :-',
    previewDevak: 'देवक :-',
    previewNadi: 'नाडी :-',
    previewMangal: 'मंगळ :-',

    previewMobile: 'मोबाईल :-',
    previewNativePlace: 'मूळ गाव :-',
    previewAddress: 'पत्ता :-',
    previewExpectations: 'अपेक्षा :-',

    previewFooterTitle: 'वंजारी जोडी — अधिकृत वधू-वर सूचक व विवाह जुळवणी मंच',
    previewFooterSubtitle: 'हजारो अनुरूप वधू-वर प्रोफाईल्ससाठी भेट द्या:',
    previewScanQr: 'स्कॅन करा',
  },

  en: {
    modalTitle: 'BioData Maker',
    modalSubtitle: 'Create high quality matrimonial biodata in English & Marathi',
    themeLabel: 'Theme:',
    watermarkBadge: '🔒 Official Watermark',
    tabForm: '✏️ Fill Details (Form)',
    tabPreview: '👁️ View BioData (Preview)',

    secPersonal: '1. Personal',
    secFamily: '2. Family',
    secAstrology: '3. Horoscope',
    secContact: '4. Contact',
    secBlessingPhoto: '5. Blessing & Photo',
    secAll: 'All Fields',

    genderLabel: 'Candidate:',
    genderGroom: 'Groom (Male)',
    genderBride: 'Bride (Female)',
    fullNameLabel: 'Full Name:',
    fullNamePlaceholder: 'e.g. First Middle Last Name',
    dobLabel: 'Date of Birth:',
    dobPlaceholder: 'e.g. 15/08/1998',
    birthTimeLabel: 'Time of Birth:',
    birthTimePlaceholder: 'e.g. 08:30 AM',
    birthPlaceLabel: 'Place of Birth:',
    birthPlacePlaceholder: 'e.g. Beed / Pune',
    heightLabel: 'Height:',
    heightPlaceholder: 'e.g. 5 ft 8 in',
    complexionLabel: 'Complexion:',
    complexionPlaceholder: 'e.g. Fair / Wheatish',
    bloodGroupLabel: 'Blood Group:',
    bloodGroupPlaceholder: 'e.g. O +ve',
    educationLabel: 'Education:',
    educationPlaceholder: 'e.g. B.E. Computer Science / MBA',
    jobLabel: 'Job / Occupation:',
    jobPlaceholder: 'e.g. Software Engineer / Govt Officer',
    businessLabel: 'Business:',
    businessPlaceholder: 'e.g. Private Enterprise / Hospital',
    incomeLabel: 'Annual Income:',
    incomePlaceholder: 'e.g. 12 Lakhs per annum',

    fatherNameLabel: "Father's Name:",
    fatherNamePlaceholder: "e.g. Father's Full Name",
    fatherOccupationLabel: "Father's Occupation:",
    fatherOccupationPlaceholder: 'e.g. Agriculture / Retired Officer',
    motherNameLabel: "Mother's Name:",
    motherNamePlaceholder: "e.g. Mother's Name (Homemaker)",
    brothersLabel: 'Brothers:',
    brothersPlaceholder: 'e.g. 1 Brother (Married)',
    sistersLabel: 'Sisters:',
    sistersPlaceholder: 'e.g. 1 Sister (Unmarried)',
    mamaNameLabel: 'Maternal Uncle (Mama):',
    mamaNamePlaceholder: 'e.g. Shri Ashokrao ... (Pathardi)',
    relativesLabel: 'Relative Surnames:',
    relativesPlaceholder: 'e.g. Sanap, Andhale, Bade, Gite, Jaybhaye...',

    rashiLabel: 'Rashi (Moon Sign):',
    rashiPlaceholder: 'e.g. Aquarius (Kumbh)',
    nakshatraLabel: 'Nakshatra:',
    nakshatraPlaceholder: 'e.g. Purva Bhadrapada',
    gotraLabel: 'Gotra:',
    gotraPlaceholder: 'e.g. Kashyap',
    devakLabel: 'Devak:',
    devakPlaceholder: 'e.g. Panchpalvi',
    nadiLabel: 'Nadi:',
    nadiPlaceholder: 'e.g. Madhya / Adya',
    mangalLabel: 'Mangal Dosha:',
    mangalPlaceholder: 'e.g. No / Mild (Anshik)',

    mobileLabel: 'Mobile Number:',
    mobilePlaceholder: 'e.g. 9822XXXXXX',
    nativePlaceLabel: 'Native Place:',
    nativePlacePlaceholder: 'e.g. Pathardi, Dist. Ahilyanagar',
    addressLabel: 'Residential Address:',
    addressPlaceholder: 'e.g. Current Living Address',
    expectationsLabel: 'Expectations:',
    expectationsPlaceholder: 'e.g. Well-educated, cultured and compatible match',

    blessingLabel: 'Header Blessing / Title:',
    blessingPlaceholder: 'e.g. || Shree Ganeshay Namah || || Shri Sant Bhagwan Baba Prasanna ||',
    photoLabel: 'Candidate Photo:',
    photoUploaded: '✓ Photo attached',
    photoUploadBtn: '📸 Click to upload candidate photo',
    photoRemove: 'Remove',

    addNewField: '+ Add Field',
    fieldName: 'Field Name',
    fieldValue: 'Value',

    downloadJpg: 'HD JPG',
    downloadPdf: 'PDF A4',
    addToSystem: 'Add to Portal',
    addedToSystem: 'Added to Portal',
    shareTelegram: 'Telegram',
    viewPreviewBtn: '👁️ View Live BioData (Preview)',
    backBtn: '← Back',
    nextBtn: 'Next →',
    editDetailsBtn: '✏️ Edit Details',

    previewDocTitle: 'MARRIAGE BIODATA',
    previewDocSubtitle: 'A Sacred Beginning of Matrimony',
    previewCandidateNameDefault: "Candidate's Full Name",
    previewEduPrefix: 'Education:',
    previewJobPrefix: 'Job:',
    previewBizPrefix: 'Business:',
    previewGroomPhoto: 'Groom Photo',
    previewBridePhoto: 'Bride Photo',

    previewDob: 'Date of Birth :-',
    previewBirthTime: 'Time of Birth :-',
    previewBirthPlace: 'Place of Birth :-',
    previewHeight: 'Height :-',
    previewComplexion: 'Complexion :-',
    previewBloodGroup: 'Blood Group :-',
    previewIncome: 'Annual Income :-',

    previewFatherName: "Father's Name :-",
    previewMotherName: "Mother's Name :-",
    previewBrothers: 'Brothers :-',
    previewSisters: 'Sisters :-',
    previewMamaName: 'Maternal Uncle :-',
    previewRelatives: 'Relatives :-',

    previewRashi: 'Rashi :-',
    previewNakshatra: 'Nakshatra :-',
    previewGotra: 'Gotra :-',
    previewDevak: 'Devak :-',
    previewNadi: 'Nadi :-',
    previewMangal: 'Mangal :-',

    previewMobile: 'Mobile No. :-',
    previewNativePlace: 'Native Place :-',
    previewAddress: 'Address :-',
    previewExpectations: 'Expectations :-',

    previewFooterTitle: 'Vanjari Jodi — Official Matrimony & Matchmaking Portal',
    previewFooterSubtitle: 'Visit for verified matches and community profiles:',
    previewScanQr: 'Scan QR',
  },
};
