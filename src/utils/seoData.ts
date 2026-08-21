/**
 * Technical SEO, Programmatic SEO, Schema.org and Sitemap Architecture
 * 100% Dedicated to Vanjari Community (वंजारी समाज वधू-वर विवाह पोर्टल)
 */

export interface VanjariSubCasteSeoItem {
  slug: string;
  nameMr: string;
  nameEn: string;
  shortDescMr: string;
  shortDescEn: string;
  popularDistrictsMr: string[];
  popularDistrictsEn: string[];
  cultureTraditionsMr: string;
  cultureTraditionsEn: string;
  majorGotrasSurnamesMr: string[];
  majorGotrasSurnamesEn: string[];
  faqs: { qMr: string; aMr: string; qEn: string; aEn: string }[];
}

export interface VanjariCitySeoItem {
  slug: string;
  nameMr: string;
  nameEn: string;
  divisionMr: string;
  divisionEn: string;
  landmarksMr: string[];
  landmarksEn: string[];
  descriptionMr: string;
  descriptionEn: string;
  vanjariTalukasMr: string[];
  vanjariTalukasEn: string[];
  faqs: { qMr: string; aMr: string; qEn: string; aEn: string }[];
}

export const VANJARI_SUB_CASTES: VanjariSubCasteSeoItem[] = [
  {
    slug: 'rao-vanjari',
    nameMr: 'राव वंजारी (Rao Vanjari)',
    nameEn: 'Rao Vanjari',
    shortDescMr: 'राव वंजारी समाजातील सुशिक्षित, उच्चपदस्थ अधिकारी, इंजिनिअर्स व डॉक्टर वधू-वर स्थळे.',
    shortDescEn: 'Verified matrimonial profiles of Rao Vanjari brides and grooms with high educational backgrounds.',
    popularDistrictsMr: ['बीड', 'नाशिक', 'अहमदनगर', 'पुणे', 'छत्रपती संभाजीनगर', 'जळगाव', 'लातूर', 'परभणी'],
    popularDistrictsEn: ['Beed', 'Nashik', 'Ahmednagar', 'Pune', 'Chhatrapati Sambhajinagar', 'Jalgaon', 'Latur', 'Parbhani'],
    cultureTraditionsMr: 'श्री संत भगवान बाबा व वामनभाऊंच्या पावन आशीर्वादाने राव वंजारी परंपरेत गोत्र व कुळशुद्धी पाळून पत्रिका जुळवणी केली जाते.',
    cultureTraditionsEn: 'Deep spiritual connection with Sant Bhagwan Baba and Shri Vamanbhau with strict Gotra and horoscope matching.',
    majorGotrasSurnamesMr: ['मुंडे', 'सानप', 'नागरे', 'काकड', 'घुगे', 'आव्हाड', 'फड', 'दराडे', 'पालवे', 'गिते', 'बडे', 'खाडे', 'केदार', 'तांबडे', 'कराड', 'आंधळे', 'शिरसाट', 'चाटे', 'ढाकणे'],
    majorGotrasSurnamesEn: ['Mundhe', 'Sanap', 'Nagre', 'Kakad', 'Ghuge', 'Awhad', 'Phad', 'Darade', 'Palve', 'Gite', 'Bade', 'Khade', 'Kedar', 'Tambade', 'Karad', 'Andhale', 'Shirsat', 'Chate', 'Dhakane'],
    faqs: [
      {
        qMr: 'राव वंजारी वधू-वरांसाठी मोफत नोंदणी आहे का?',
        aMr: 'होय, वंजारी जोडीवर सर्व राव वंजारी वधू आणि वरांसाठी १००% मोफत नोंदणी व बायोडाटा निर्मिती उपलब्ध आहे.',
        qEn: 'Is registration free for Rao Vanjari candidates?',
        aEn: 'Yes, online registration and biodata creation are 100% free for all Rao Vanjari candidates.'
      },
      {
        qMr: 'राव वंजारी समाजात गोत्र व सगोत्र विवाह कसा टाळला जातो?',
        aMr: 'आमच्या सिस्टीममध्ये गोत्र, कुळ व देवक नमूद केलेले असते, ज्यामुळे एकाच गोत्रातील स्थळे टाळून योग्य स्थळ निवडणे सोपे होते.',
        qEn: 'How is Gotra verified in Rao Vanjari matrimony?',
        aEn: 'Our system tracks Gotra, Devak, and Kul to ensure traditional matchmaking adherence.'
      }
    ]
  },
  {
    slug: 'lad-vanjari',
    nameMr: 'लाड वंजारी (Lad Vanjari)',
    nameEn: 'Lad Vanjari',
    shortDescMr: 'लाड वंजारी समाजातील व्यापारी, उद्योगपती, नोकरदार व व्यावसायिक वधू-वर बायोडाटा.',
    shortDescEn: 'Educated and business-oriented Lad Vanjari brides and grooms across Maharashtra and metro cities.',
    popularDistrictsMr: ['नाशिक', 'जळगाव', 'धुळे', 'अहमदनगर', 'पुणे', 'मुंबई', 'छत्रपती संभाजीनगर'],
    popularDistrictsEn: ['Nashik', 'Jalgaon', 'Dhule', 'Ahmednagar', 'Pune', 'Mumbai', 'Chhatrapati Sambhajinagar'],
    cultureTraditionsMr: 'व्यापार, शेती व सामाजिक क्षेत्रात अग्रेसर असलेल्या लाड वंजारी समाजातील प्रतिष्ठित विवाह परंपरा.',
    cultureTraditionsEn: 'Respected Lad Vanjari community matchmaking with focus on values and education.',
    majorGotrasSurnamesMr: ['लाड', 'गव्हाणे', 'पवार', 'शिंदे', 'गांगुर्डे', 'चौधरी', 'पाटील', 'सोनवणे', 'निकम', 'वाघ'],
    majorGotrasSurnamesEn: ['Lad', 'Gavhane', 'Pawar', 'Shinde', 'Gangurde', 'Chaudhari', 'Patil', 'Sonawane', 'Nikam', 'Wagh'],
    faqs: [
      {
        qMr: 'लाड वंजारी समाजातील स्थळे कशी शोधावीत?',
        aMr: 'पोटजात फिल्टरमध्ये "लाड वंजारी" निवडून नाशिक, खान्देश व पुण्यातील शेकडो सुशिक्षित स्थळे एका क्लिकवर पाहू शकता.',
        qEn: 'How to find Lad Vanjari profiles?',
        aEn: 'Select Lad Vanjari in the sub-caste filter to browse verified profiles from Nashik, Khandesh, and Pune.'
      }
    ]
  },
  {
    slug: 'kanher-vanjari',
    nameMr: 'कन्हेरे वंजारी (Kanhere Vanjari)',
    nameEn: 'Kanhere Vanjari',
    shortDescMr: 'कन्हेरे / कानहेर वंजारी समाजातील उच्चशिक्षित व सुसंस्कृत वधू-वर स्थळे.',
    shortDescEn: 'Cultured Kanhere Vanjari brides and grooms from respected families across Maharashtra.',
    popularDistrictsMr: ['बीड', 'जालना', 'परभणी', 'नांदेड', 'हिंगोली', 'लातूर', 'सोलापूर'],
    popularDistrictsEn: ['Beed', 'Jalna', 'Parbhani', 'Nanded', 'Hingoli', 'Latur', 'Solapur'],
    cultureTraditionsMr: 'कन्हेरे वंजारी समाजातील पारंपरिक कौटुंबिक नीतिमूल्ये आणि पत्रिका जुळवणीला सर्वोच्च प्राधान्य.',
    cultureTraditionsEn: 'Traditional values, horoscope compatibility, and family backgrounds for Kanhere Vanjari.',
    majorGotrasSurnamesMr: ['कान्हेरे', 'बोराडे', 'जाधव', 'तोडकर', 'खेडकर', 'मोरे', 'चव्हाण', 'गायकवाड'],
    majorGotrasSurnamesEn: ['Kanhere', 'Borade', 'Jadhav', 'Todkar', 'Khedkar', 'More', 'Chavan', 'Gaikwad'],
    faqs: [
      {
        qMr: 'कन्हेरे वंजारी वधू-वरांचे बायोडाटा पीडीएफ स्वरूपात डाऊनलोड करता येतात का?',
        aMr: 'होय, सुंदर आणि आकर्षक बायोडाटा मोफत तयार करून व्हॉट्सॲपवर शेअर अथवा पीडीएफ डाऊनलोड करता येतो.',
        qEn: 'Can we download Kanhere Vanjari biodatas as PDF?',
        aEn: 'Yes, users can generate professional marriage biodatas in Marathi or English and download PDF instantly.'
      }
    ]
  },
  {
    slug: 'matha-vanjari',
    nameMr: 'मठपती / मठा वंजारी (Matha Vanjari)',
    nameEn: 'Matha Vanjari',
    shortDescMr: 'मठपती वंजारी समाजातील सुविद्य, सेवाभावी व प्रतिष्ठित वधू-वर स्थळे.',
    shortDescEn: 'Respected Matha Vanjari matrimonial profiles with deep cultural and family traditions.',
    popularDistrictsMr: ['नांदेड', 'लातूर', 'परभणी', 'बीड', 'उस्मानाबाद / धाराशिव', 'सोलापूर'],
    popularDistrictsEn: ['Nanded', 'Latur', 'Parbhani', 'Beed', 'Dharashiv', 'Solapur'],
    cultureTraditionsMr: 'धार्मिक, आध्यात्मिक व सामाजिक परंपरा जोपासणाऱ्या मठा वंजारी कुटुंबांसाठी विश्वासू विवाह मंच.',
    cultureTraditionsEn: 'Trusted matrimonial platform for spiritual and culturally rooted Matha Vanjari families.',
    majorGotrasSurnamesMr: ['मठपती', 'स्वामी', 'जोशी', 'लिंगायत वंजारी', 'पाटील', 'देशमुख'],
    majorGotrasSurnamesEn: ['Mathapati', 'Swami', 'Joshi', 'Lingayat Vanjari', 'Patil', 'Deshmukh'],
    faqs: [
      {
        qMr: 'मठा वंजारी समाजातील शासकीय व खाजगी नोकरदार स्थळे कशी शोधावीत?',
        aMr: 'व्यवसाय फिल्टरमध्ये "सरकारी नोकरी", "IT / MNC", "बँकिंग" किंवा "शिक्षक" निवडून स्थळे शोधता येतात.',
        qEn: 'How to find govt and private job profiles in Matha Vanjari?',
        aEn: 'Use our occupation filter to search for government servants, software engineers, and bankers.'
      }
    ]
  },
  {
    slug: 'dhale-vanjari',
    nameMr: 'ढवळ / ढाले वंजारी (Dhale Vanjari)',
    nameEn: 'Dhale Vanjari',
    shortDescMr: 'विदर्भ व मराठवाड्यातील ढाले / ढवळ वंजारी समाजातील इंजिनिअर, डॉक्टर व नोकरदार स्थळे.',
    shortDescEn: 'Educated Dhale Vanjari brides and grooms across Vidarbha, Marathwada, and Northern Maharashtra.',
    popularDistrictsMr: ['नागपूर', 'अमरावती', 'यवतमाळ', 'वाशीम', 'बुलढाणा', 'जळगाव', 'अकोला'],
    popularDistrictsEn: ['Nagpur', 'Amravati', 'Yavatmal', 'Washim', 'Buldhana', 'Jalgaon', 'Akola'],
    cultureTraditionsMr: 'विदर्भ व खान्देशातील ढवळ वंजारी समाजातील विवाह परंपरा व नातेसंबंध जुळवणी.',
    cultureTraditionsEn: 'Matrimonial heritage and close-knit family connections for Dhale Vanjari in Vidarbha.',
    majorGotrasSurnamesMr: ['ढाले', 'ढवळे', 'काळदाते', 'राठोड', 'बगाडे', 'ठाकूर', 'वाघमारे'],
    majorGotrasSurnamesEn: ['Dhale', 'Dhawale', 'Kaldate', 'Rathod', 'Bagade', 'Thakur', 'Waghmare'],
    faqs: [
      {
        qMr: 'विदर्भातील ढाले वंजारी स्थळे शोधण्यासाठी कोणता फिल्टर वापरावा?',
        aMr: 'जिल्हा फिल्टरमध्ये अमरावती, यवतमाळ, वाशीम किंवा नागपूर निवडून स्थानिक स्थळे पाहू शकता.',
        qEn: 'How to filter Vidarbha Dhale Vanjari profiles?',
        aEn: 'Select Amravati, Yavatmal, Washim, or Nagpur in the district filter for regional matches.'
      }
    ]
  }
];

export const VANJARI_CITIES: VanjariCitySeoItem[] = [
  {
    slug: 'beed',
    nameMr: 'बीड व परळी वैजनाथ (Beed & Parli Vaijnath)',
    nameEn: 'Beed & Parli Vaijnath',
    divisionMr: 'मराठवाडा (वंजारी समाज बालेकिल्ला)',
    divisionEn: 'Marathwada (Vanjari Samaj Citadel)',
    landmarksMr: ['श्री वैजनाथ ज्योतिर्लिंग (परळी)', 'श्री क्षेत्र भगवानगड', 'अंबाजोगाई', 'पाटोदा', 'गेवराई', 'आष्टी', 'शिरूर कासार', 'वडवणी', 'केज'],
    landmarksEn: ['Parli Vaijnath Jyotirlinga', 'Shri Kshetra Bhagwangad', 'Ambajogai', 'Patoda', 'Gevrai', 'Ashti', 'Shirur Kasar', 'Wadwani', 'Kej'],
    vanjariTalukasMr: ['परळी', 'पाटोदा', 'बीड शहर', 'शिरूर (का.)', 'गेवराई', 'अंबाजोगाई', 'आष्टी', 'वडवणी'],
    vanjariTalukasEn: ['Parli', 'Patoda', 'Beed City', 'Shirur Kasar', 'Gevrai', 'Ambajogai', 'Ashti', 'Wadwani'],
    descriptionMr: 'परळी वैजनाथ, बीड, पाटोदा व भगवानगड परिसरातील उच्चशिक्षित, क्लास-१ अधिकारी, शेतकरी व प्रतिष्ठित वंजारी कुटुंबे.',
    descriptionEn: 'Prominent Vanjari families, Class-1 govt officers, doctors, and engineers from Beed, Parli, and Bhagwangad belt.',
    faqs: [
      {
        qMr: 'बीड व परळी परिसरातील वंजारी वधू-वर स्थळे कशी शोधावीत?',
        aMr: 'जिल्हा मध्ये "बीड" निवडा. येथे परळी, पाटोदा, अंबाजोगाई व शिरूर कासार भागातील हजारो अधिकृत वंजारी स्थळे उपलब्ध आहेत.',
        qEn: 'How to search Beed and Parli Vanjari profiles?',
        aEn: 'Select Beed in the district filter to view verified Vanjari profiles from Parli, Ambajogai, Patoda, and Ashti.'
      },
      {
        qMr: 'भगवानगड व पाटोदा परिसरातील गोत्र व पत्रिका जुळवणी कशी करावी?',
        aMr: 'आमच्या बायोडाटा कार्डवर राशी, नक्षत्र, नाडी, गण व मंगळ दोष स्पष्टपणे दिलेला असतो. एका क्लिकवर पत्रिका जुळवता येते.',
        qEn: 'How to match Kundali for Beed district candidates?',
        aEn: 'Every profile clearly lists Rashi, Nakshatra, Gan, Nadi, and Manglik status for accurate horoscope matching.'
      }
    ]
  },
  {
    slug: 'nashik',
    nameMr: 'नाशिक (Nashik - Vanjari Capital)',
    nameEn: 'Nashik (Vanjari Capital of North Maharashtra)',
    divisionMr: 'उत्तर महाराष्ट्र / खान्देश',
    divisionEn: 'North Maharashtra / Khandesh',
    landmarksMr: ['पंचवटी', 'गंगापूर रोड', 'इंदिरानगर', 'सिडको नाशिक', 'सिन्नर', 'दिंडोरी', 'निफाड', 'येवला', 'चांदवड'],
    landmarksEn: ['Panchavati', 'Gangapur Road', 'Indira Nagar', 'CIDCO Nashik', 'Sinnar', 'Dindori', 'Niphad', 'Yeola', 'Chandwad'],
    vanjariTalukasMr: ['सिन्नर', 'नाशिक शहर', 'दिंडोरी', 'निफाड', 'येवला', 'चांदवड', 'इगतपुरी'],
    vanjariTalukasEn: ['Sinnar', 'Nashik City', 'Dindori', 'Niphad', 'Yeola', 'Chandwad', 'Igatpuri'],
    descriptionMr: 'नाशिक शहर, सिन्नर, दिंडोरी व निफाड परिसरातील उद्योजक, आयटी इंजिनिअर्स, क्लास-१ अधिकारी व सुसंस्कृत वंजारी कुटुंबे.',
    descriptionEn: 'Leading Vanjari entrepreneurs, IT software engineers, grape exporters, and business leaders in Nashik & Sinnar.',
    faqs: [
      {
        qMr: 'नाशिक व सिन्नर भागातील वंजारी स्थळे कशी शोधावीत?',
        aMr: 'जिल्हा "नाशिक" आणि तालुका "सिन्नर" किंवा "नाशिक शहर" निवडून स्थानिक वंजारी स्थळे शोधता येतात.',
        qEn: 'How to search Nashik & Sinnar Vanjari profiles?',
        aEn: 'Filter by Nashik district to view profiles across CIDCO, Gangapur Road, Sinnar, and nearby talukas.'
      }
    ]
  },
  {
    slug: 'ahmednagar',
    nameMr: 'अहमदनगर / अहिल्यानगर (Ahmednagar & Bhagwangad)',
    nameEn: 'Ahmednagar / Ahilyanagar & Bhagwangad Belt',
    divisionMr: 'पश्चिम महाराष्ट्र',
    divisionEn: 'Western Maharashtra',
    landmarksMr: ['श्री क्षेत्र भगवानगड (पाथर्डी)', 'गर्भगिरी डोंगररांग', 'शेवगाव', 'श्रीगोंदा', 'संगमनेर', 'राहुरी', 'कर्जत', 'जामखेड'],
    landmarksEn: ['Shri Kshetra Bhagwangad (Pathardi)', 'Garbhagiri Hills', 'Shevgaon', 'Shrigonda', 'Sangamner', 'Rahuri', 'Karjat', 'Jamkhed'],
    vanjariTalukasMr: ['पाथर्डी', 'शेवगाव', 'जामखेड', 'कर्जत', 'अहिल्यानगर शहर', 'संगमनेर', 'श्रीगोंदा'],
    vanjariTalukasEn: ['Pathardi', 'Shevgaon', 'Jamkhed', 'Karjat', 'Ahilyanagar City', 'Sangamner', 'Shrigonda'],
    descriptionMr: 'पाथर्डी, शेवगाव, जामखेड व भगवानगड परिसरातील सुसंस्कृत, शेतीनिष्ठ व नोकरदार वंजारी कुटुंबे.',
    descriptionEn: 'Traditional agrarian, business, and professional Vanjari families from Pathardi, Shevgaon & Ahmednagar.',
    faqs: [
      {
        qMr: 'पाथर्डी व शेवगाव भागातील वंजारी स्थळे उपलब्ध आहेत का?',
        aMr: 'होय, पाथर्डी, शेवगाव, जामखेड व संगमनेर भागातील शेकडो वंजारी स्थळे वंजारी जोडीवर उपलब्ध आहेत.',
        qEn: 'Are Pathardi & Shevgaon Vanjari profiles available?',
        aEn: 'Yes, extensive verified Vanjari profiles from Pathardi, Shevgaon, Jamkhed, and Sangamner are available.'
      }
    ]
  },
  {
    slug: 'pune',
    nameMr: 'पुणे व पिंपरी चिंचवड (Pune & PCMC IT Metro)',
    nameEn: 'Pune & PCMC IT Metro',
    divisionMr: 'पश्चिम महाराष्ट्र',
    divisionEn: 'Western Maharashtra',
    landmarksMr: ['हिंजवडी आयटी पार्क', 'मगरपट्टा सायबरसिटी', 'कोथरूड', 'बाणेर', 'वाकड', 'हडपसर', 'सिंहगड रोड', 'भोसरी', 'चाकण'],
    landmarksEn: ['Hinjawadi IT Park', 'Magarpatta Cybercity', 'Kothrud', 'Baner', 'Wakad', 'Hadapsar', 'Sinhagad Road', 'Bhosari', 'Chakan'],
    vanjariTalukasMr: ['पुणे शहर', 'हवेली', 'शिरूर', 'खेड', 'जुन्नर', 'दौंड', 'मावळ'],
    vanjariTalukasEn: ['Pune City', 'Haveli', 'Shirur', 'Khed', 'Junnar', 'Daund', 'Maval'],
    descriptionMr: 'पुणे व पिंपरी चिंचवड परिसरातील स्थायिक वंजारी आयटी प्रोफेशनल्स, इंजिनिअर्स, डॉक्टर, क्लास-१ अधिकारी व उद्योजक.',
    descriptionEn: 'Vanjari IT software engineers, MNC corporate leaders, govt officers, and settled families in Pune metro.',
    faqs: [
      {
        qMr: 'पुण्यातील वंजारी आयटी व कॉर्पोरेट प्रोफाईल्स कशी शोधावीत?',
        aMr: 'आमच्या "IT / MNC नोकरी" आणि "पुणे" जिल्हा निवडून उच्च उत्पन्न असणाऱ्या वंजारी उमेदवारांची प्रोफाईल्स थेट पाहू शकता.',
        qEn: 'How to filter Pune Vanjari IT professionals?',
        aEn: 'Use the "MNC / IT" filter along with Pune district to find software engineers working in Hinjawadi & Magarpatta.'
      }
    ]
  },
  {
    slug: 'chhatrapati-sambhajinagar',
    nameMr: 'छत्रपती संभाजीनगर व जालना (Sambhajinagar & Jalna)',
    nameEn: 'Chhatrapati Sambhajinagar & Jalna',
    divisionMr: 'मराठवाडा राजधानी',
    divisionEn: 'Marathwada Region',
    landmarksMr: ['सिडको औरंगाबाद', 'वाळूज एमआयडीसी', 'शेendra DMIC', 'पैठण', 'गंगापूर', 'जालना शहर', 'अंबड', 'मंथन'],
    landmarksEn: ['CIDCO Aurangabad', 'Waluj MIDC', 'Shendra DMIC', 'Paithan', 'Gangapur', 'Jalna City', 'Ambad', 'Mantha'],
    vanjariTalukasMr: ['संभाजीनगर शहर', 'पैठण', 'गंगापूर', 'जालना', 'अंबड', 'घनसावंगी', 'कन्नड'],
    vanjariTalukasEn: ['Sambhajinagar City', 'Paithan', 'Gangapur', 'Jalna', 'Ambad', 'Ghansawangi', 'Kannad'],
    descriptionMr: 'संभाजीनगर, जालना, अंबड व वाळूज परिसरातील प्रतिष्ठित वंजारी क्लास-१ अधिकारी, डॉक्टर, व्यावसायिक व सुशिक्षित स्थळे.',
    descriptionEn: 'Class-1 officers, doctors, industrialists, and educated Vanjari brides and grooms in Sambhajinagar & Jalna.',
    faqs: [
      {
        qMr: 'संभाजीनगर व जालन्यातील वंजारी स्थळांची पडताळणी कशी केली जाते?',
        aMr: 'प्रत्येक उमेदवाराचा आधार क्रमांक व संपर्क नंबर आमच्या स्थानिक टीमद्वारे प्रत्यक्ष तपासूनच व्हेरिफाईड बॅज दिला जातो.',
        qEn: 'How are Sambhajinagar Vanjari profiles verified?',
        aEn: 'Our admin team verifies Aadhaar cards and mobile numbers before issuing the verified trust badge.'
      }
    ]
  },
  {
    slug: 'mumbai-thane',
    nameMr: 'मुंबई, ठाणे व नवी मुंबई (Mumbai Metro)',
    nameEn: 'Mumbai, Thane & Navi Mumbai',
    divisionMr: 'मुंबई महानगर / कोकण',
    divisionEn: 'Mumbai Metropolitan Region',
    landmarksMr: ['दादर', 'अंधेरी', 'ठाणे पश्चिम', 'नवी मुंबई (वाशी/नेरूळ)', 'कल्याण-डोंबिवली', 'बोरीवली', 'पनवेल'],
    landmarksEn: ['Dadar', 'Andheri', 'Thane West', 'Navi Mumbai (Vashi/Nerul)', 'Kalyan-Dombivli', 'Borivali', 'Panvel'],
    vanjariTalukasMr: ['मुंबई उपनगर', 'ठाणे', 'कल्याण', 'नवी मुंबई', 'पनवेल'],
    vanjariTalukasEn: ['Mumbai Suburban', 'Thane', 'Kalyan', 'Navi Mumbai', 'Panvel'],
    descriptionMr: 'मुंबई, ठाणे, नवी मुंबई व कल्याण-डोंबिवली परिसरातील कॉर्पोरेट, बँकिंग, रेल्वे व शासकीय सेवेत स्थायिक वंजारी कुटुंबे.',
    descriptionEn: 'Vanjari corporate professionals, bankers, engineers, and settled families across Mumbai & Thane metro.',
    faqs: [
      {
        qMr: 'मुंबई-ठाण्यातील वंजारी वधू-वर स्थळे कशी शोधावीत?',
        aMr: 'जिल्हा मध्ये मुंबई किंवा ठाणे निवडा. येथे कॉर्पोरेट व नामांकित कंपन्यांमध्ये कार्यरत शेकडो वंजारी स्थळे मिळतील.',
        qEn: 'How to search Mumbai & Thane Vanjari profiles?',
        aEn: 'Select Mumbai or Thane in the district filter for corporate & banking matches.'
      }
    ]
  },
  {
    slug: 'jalgaon-khandesh',
    nameMr: 'जळगाव व धुळे (Khandesh Vanjari Belt)',
    nameEn: 'Jalgaon & Dhule (Khandesh Belt)',
    divisionMr: 'उत्तर महाराष्ट्र / खान्देश',
    divisionEn: 'Khandesh Region',
    landmarksMr: ['चाळीसगाव', 'पाचोरा', 'जळगाव शहर', 'जामनेर', 'धुळे शहर', 'साक्री', 'शिंदखेडा'],
    landmarksEn: ['Chalisgaon', 'Pachora', 'Jalgaon City', 'Jamner', 'Dhule City', 'Sakri', 'Shindkheda'],
    vanjariTalukasMr: ['चाळीसगाव', 'पाचोरा', 'जामनेर', 'जळगाव', 'धुळे'],
    vanjariTalukasEn: ['Chalisgaon', 'Pachora', 'Jamner', 'Jalgaon', 'Dhule'],
    descriptionMr: 'चाळीसगाव, पाचोरा, जामनेर, धुळे व खान्देश पट्ट्यातील सुशिक्षित व शेतीनिष्ठ वंजारी कुटुंबे.',
    descriptionEn: 'Respected Vanjari agricultural and business families from Chalisgaon, Pachora, Jamner, and Dhule.',
    faqs: [
      {
        qMr: 'चाळीसगाव व खान्देशातील वंजारी स्थळे उपलब्ध आहेत का?',
        aMr: 'होय, चाळीसगाव, पाचोरा व जळगाव परिसरातील शेकडो राव व लाड वंजारी स्थळे वंजारी जोडीवर उपलब्ध आहेत.',
        qEn: 'Are Khandesh Vanjari profiles available?',
        aEn: 'Yes, verified Rao and Lad Vanjari profiles from Chalisgaon, Pachora, and Jalgaon are registered.'
      }
    ]
  },
  {
    slug: 'latur-nanded-parbhani',
    nameMr: 'लातूर, परभणी व नांदेड (Latur, Parbhani & Nanded)',
    nameEn: 'Latur, Parbhani & Nanded (Marathwada Belt)',
    divisionMr: 'मराठवाडा',
    divisionEn: 'Marathwada Region',
    landmarksMr: ['लातूर एज्युकेशन हब', 'रेणापूर', 'अहमदपूर', 'जिंतूर', 'गंगाखेड', 'परभणी शहर', 'मुखेड', 'कंधार'],
    landmarksEn: ['Latur Education Hub', 'Renapur', 'Ahmedpur', 'Jintur', 'Gangakhed', 'Parbhani City', 'Mukhed', 'Kandhar'],
    vanjariTalukasMr: ['रेणापूर', 'लातूर', 'अहमदपूर', 'जिंतूर', 'गंगाखेड', 'परभणी', 'मुखेड', 'कंधार'],
    vanjariTalukasEn: ['Renapur', 'Latur', 'Ahmedpur', 'Jintur', 'Gangakhed', 'Parbhani', 'Mukhed', 'Kandhar'],
    descriptionMr: 'रेणापूर, अहमदपूर, जिंतूर, गंगाखेड व नांदेड परिसरातील उच्चशिक्षित, डॉक्टर, प्राध्यापक व वंजारी स्थळे.',
    descriptionEn: 'Educated Vanjari doctors, professors, teachers, and business families from Latur & Parbhani belt.',
    faqs: [
      {
        qMr: 'लातूर व परभणी भागातील वंजारी स्थळे कशी शोधावीत?',
        aMr: 'जिल्हा मध्ये लातूर, परभणी किंवा नांदेड निवडून स्थानिक स्थळे पाहू शकता.',
        qEn: 'How to search Latur & Parbhani Vanjari profiles?',
        aEn: 'Select Latur, Parbhani, or Nanded in the district filter to view regional candidates.'
      }
    ]
  }
];

/**
 * Generate Structured JSON-LD Data for SEO Rich Snippets (100% Vanjari Samaj Focus)
 */
export function generateStructuredJsonLd(config: {
  siteUrl: string;
  siteNameMr: string;
  siteNameEn: string;
  logoUrl: string;
  supportPhone: string;
  supportEmail: string;
  address: string;
  totalMembersCount?: number;
}) {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'MarriageAgency'],
    '@id': `${config.siteUrl}/#organization`,
    name: 'वंजारी जोडी (Vanjari Jodi)',
    alternateName: [
      'वंजारी',
      'Vanjari',
      'Vanjari Jodi',
      'वंजारी जोडी वधू-वर सूचक केंद्र',
      'Vanjari Jodi Matrimony',
      'vanjarijodi.web.app',
      'Vanjari Vivah',
      'वंजारी समाज विवाह मंडळ',
      'Rao Vanjari Vivah'
    ],
    url: config.siteUrl,
    logo: config.logoUrl || `${config.siteUrl}/logo.png`,
    image: config.logoUrl || `${config.siteUrl}/logo.png`,
    description: 'महाराष्ट्र व जगभरातील १# मानांकित अधिकृत वंजारी समाज वधू-वर सूचक केंद्र (Official Vanjari Community Matrimonial Portal - vanjarijodi.web.app).',
    telephone: config.supportPhone || '+91-9800000000',
    email: config.supportEmail || 'support@vanjarijodi.org',
    priceRange: '₹0 - ₹999',
    currenciesAccepted: 'INR',
    paymentAccepted: 'UPI, Google Pay, PhonePe, Paytm, Net Banking, Credit Card',
    areaServed: [
      {
        '@type': 'AdministrativeArea',
        name: 'Maharashtra'
      },
      {
        '@type': 'Country',
        name: 'India'
      }
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Beed / Pune / Nashik / Ahmednagar',
      addressRegion: 'Maharashtra',
      addressCountry: 'IN'
    },
    sameAs: [
      'https://t.me/vanjarijodi_official',
      'https://facebook.com/vanjarijodi',
      'https://instagram.com/vanjarijodi_official'
    ],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '08:00',
      closes: '22:00'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.95',
      reviewCount: '2840',
      bestRating: '5',
      worstRating: '1'
    }
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${config.siteUrl}/#website`,
    url: config.siteUrl,
    name: 'वंजारी जोडी - वंजारी समाज वधू-वर सूचक केंद्र',
    alternateName: 'Vanjari Jodi Official Matrimony',
    inLanguage: ['mr', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${config.siteUrl}/?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${config.siteUrl}/#service`,
    name: 'Vanjari Samaj Matrimonial Matchmaking & Kundali Matching Services',
    serviceType: 'Vanjari Matrimonial Matchmaking, Gotra Verification, BioData Creation',
    provider: {
      '@id': `${config.siteUrl}/#organization`
    },
    areaServed: {
      '@type': 'State',
      name: 'Maharashtra'
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Vanjari Matrimony Membership Packages',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Free Basic Vanjari Registration & Biodata Maker'
          },
          price: '0',
          priceCurrency: 'INR'
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Welcome Special Plan (30 Days Direct Contact Access)'
          },
          price: '299',
          priceCurrency: 'INR'
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Gold Plan (6 Months Verified Family Access)'
          },
          price: '999',
          priceCurrency: 'INR'
        }
      ]
    }
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'मुख्यपृष्ठ (Home)',
        item: config.siteUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'वंजारी वधू-वर स्थळे (Vanjari Profiles)',
        item: `${config.siteUrl}/#profiles`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'वंजारी बायोडाटा मेकर (BioData Maker)',
        item: `${config.siteUrl}/#biodata-maker`
      }
    ]
  };

  return {
    orgSchema,
    webSiteSchema,
    serviceSchema,
    breadcrumbSchema
  };
}

/**
 * Generate XML Sitemap content dynamically (100% Vanjari Dedicated)
 */
export function generateDynamicXmlSitemap(baseUrl: string, profilesList: Array<{ id: string; updatedAt?: string; lastActive?: string }>): string {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const nowIso = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: `${cleanBaseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${cleanBaseUrl}/profiles`, priority: '0.95', changefreq: 'hourly' },
    { loc: `${cleanBaseUrl}/plans`, priority: '0.85', changefreq: 'weekly' },
    { loc: `${cleanBaseUrl}/biodata-maker`, priority: '0.85', changefreq: 'weekly' },
    { loc: `${cleanBaseUrl}/success-stories`, priority: '0.75', changefreq: 'weekly' },
    { loc: `${cleanBaseUrl}/vendors`, priority: '0.70', changefreq: 'daily' },
    { loc: `${cleanBaseUrl}/about`, priority: '0.60', changefreq: 'monthly' },
    { loc: `${cleanBaseUrl}/contact`, priority: '0.60', changefreq: 'monthly' },
    { loc: `${cleanBaseUrl}/terms`, priority: '0.50', changefreq: 'yearly' },
    { loc: `${cleanBaseUrl}/privacy`, priority: '0.50', changefreq: 'yearly' },
  ];

  const subCasteUrls = VANJARI_SUB_CASTES.map((c) => ({
    loc: `${cleanBaseUrl}/vanjari-matrimony/${c.slug}`,
    priority: '0.90',
    changefreq: 'daily'
  }));

  const cityUrls = VANJARI_CITIES.map((c) => ({
    loc: `${cleanBaseUrl}/vanjari-matrimony/city/${c.slug}`,
    priority: '0.90',
    changefreq: 'daily'
  }));

  const profileUrls = (profilesList || []).slice(0, 1000).map((p) => ({
    loc: `${cleanBaseUrl}/profile/${p.id}`,
    priority: '0.80',
    changefreq: 'weekly',
    lastmod: p.updatedAt ? p.updatedAt.split('T')[0] : nowIso
  }));

  const allUrls = [...staticUrls, ...subCasteUrls, ...cityUrls, ...profileUrls];

  const urlXmlNodes = allUrls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${(u as any).lastmod || nowIso}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
    <xhtml:link rel="alternate" hreflang="mr" href="${u.loc}?lang=mr" />
    <xhtml:link rel="alternate" hreflang="en" href="${u.loc}?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${u.loc}" />
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlXmlNodes}
</urlset>`;
}

/**
 * Generate Robots.txt Content dynamically
 */
export function generateRobotsTxt(baseUrl: string): string {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  return `# =========================================================
# Robots.txt for Vanjari Jodi Matrimony Portal (100% Vanjari Samaj)
# Official Search Engine Optimization Directives
# =========================================================
User-agent: *
Allow: /
Allow: /profiles
Allow: /vanjari-matrimony/*
Allow: /profile/*
Allow: /plans
Allow: /biodata-maker
Allow: /success-stories
Allow: /vendors
Allow: /terms
Allow: /privacy
Allow: /about
Allow: /contact

# Protect private admin and payment workflows
Disallow: /admin/
Disallow: /api/
Disallow: /checkout/
Disallow: /dashboard/

# Sitemap Location
Sitemap: ${cleanBaseUrl}/sitemap.xml
Host: ${cleanBaseUrl}
`;
}
