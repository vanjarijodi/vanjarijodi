export interface MaharashtraCity {
  id: string;
  nameMr: string;
  nameEn: string;
  districtMr: string;
  latitude: number;
  longitude: number;
}

export const MAHARASHTRA_CITIES: MaharashtraCity[] = [
  { id: 'pune', nameMr: 'पुणे', nameEn: 'Pune', districtMr: 'पुणे', latitude: 18.5204, longitude: 73.8567 },
  { id: 'beed', nameMr: 'बीड', nameEn: 'Beed', districtMr: 'बीड', latitude: 18.9891, longitude: 75.7601 },
  { id: 'nashik', nameMr: 'नाशिक', nameEn: 'Nashik', districtMr: 'नाशिक', latitude: 19.9975, longitude: 73.7898 },
  { id: 'csn', nameMr: 'छत्रपती संभाजीनगर (औरंगाबाद)', nameEn: 'Chhatrapati Sambhajinagar', districtMr: 'छत्रपती संभाजीनगर', latitude: 19.8762, longitude: 75.3433 },
  { id: 'ahmednagar', nameMr: 'अहिल्यानगर (अहमदनगर)', nameEn: 'Ahilyanagar / Ahmednagar', districtMr: 'अहिल्यानगर', latitude: 19.0948, longitude: 74.7480 },
  { id: 'mumbai', nameMr: 'मुंबई', nameEn: 'Mumbai', districtMr: 'मुंबई', latitude: 19.0760, longitude: 72.8777 },
  { id: 'thane', nameMr: 'ठाणे', nameEn: 'Thane', districtMr: 'ठाणे', latitude: 19.2183, longitude: 72.9781 },
  { id: 'navimumbai', nameMr: 'नवी मुंबई', nameEn: 'Navi Mumbai', districtMr: 'ठाणे', latitude: 19.0330, longitude: 73.0297 },
  { id: 'jalgaon', nameMr: 'जळगाव', nameEn: 'Jalgaon', districtMr: 'जळगाव', latitude: 21.0077, longitude: 75.5626 },
  { id: 'latur', nameMr: 'लातूर', nameEn: 'Latur', districtMr: 'लातूर', latitude: 18.4088, longitude: 76.5604 },
  { id: 'nanded', nameMr: 'नांदेड', nameEn: 'Nanded', districtMr: 'नांदेड', latitude: 19.1383, longitude: 77.3210 },
  { id: 'parbhani', nameMr: 'परभणी', nameEn: 'Parbhani', districtMr: 'परभणी', latitude: 19.2686, longitude: 76.7735 },
  { id: 'jalna', nameMr: 'जालना', nameEn: 'Jalna', districtMr: 'जालना', latitude: 19.8410, longitude: 75.8864 },
  { id: 'buldhana', nameMr: 'बुलढाणा', nameEn: 'Buldhana', districtMr: 'बुलढाणा', latitude: 20.5312, longitude: 76.1844 },
  { id: 'kolhapur', nameMr: 'कोल्हापूर', nameEn: 'Kolhapur', districtMr: 'कोल्हापूर', latitude: 16.7050, longitude: 74.2433 },
  { id: 'solapur', nameMr: 'सोलापूर', nameEn: 'Solapur', districtMr: 'सोलापूर', latitude: 17.6599, longitude: 75.9064 },
  { id: 'satara', nameMr: 'सातारा', nameEn: 'Satara', districtMr: 'सातारा', latitude: 17.6805, longitude: 74.0183 },
  { id: 'sangli', nameMr: 'सांगली', nameEn: 'Sangli', districtMr: 'सांगली', latitude: 16.8524, longitude: 74.5815 },
  { id: 'dharashiv', nameMr: 'धाराशिव (उस्मानाबाद)', nameEn: 'Dharashiv / Osmanabad', districtMr: 'धाराशिव', latitude: 18.1856, longitude: 76.0419 },
  { id: 'dhule', nameMr: 'धुळे', nameEn: 'Dhule', districtMr: 'धुळे', latitude: 20.9042, longitude: 74.7749 },
  { id: 'nandurbar', nameMr: 'नंदुरबार', nameEn: 'Nandurbar', districtMr: 'नंदुरबार', latitude: 21.3705, longitude: 74.2405 },
  { id: 'amravati', nameMr: 'अमरावती', nameEn: 'Amravati', districtMr: 'अमरावती', latitude: 20.9374, longitude: 77.7796 },
  { id: 'akola', nameMr: 'अकोला', nameEn: 'Akola', districtMr: 'अकोला', latitude: 20.7002, longitude: 77.0082 },
  { id: 'washim', nameMr: 'वाशीम', nameEn: 'Washim', districtMr: 'वाशीम', latitude: 20.1112, longitude: 77.1352 },
  { id: 'yavatmal', nameMr: 'यवतमाळ', nameEn: 'Yavatmal', districtMr: 'यवतमाळ', latitude: 20.3888, longitude: 78.1204 },
  { id: 'nagpur', nameMr: 'नागपूर', nameEn: 'Nagpur', districtMr: 'नागपूर', latitude: 21.1458, longitude: 79.0882 },
  { id: 'wardha', nameMr: 'वर्धा', nameEn: 'Wardha', districtMr: 'वर्धा', latitude: 20.7453, longitude: 78.6022 },
  { id: 'chandrapur', nameMr: 'चंद्रपूर', nameEn: 'Chandrapur', districtMr: 'चंद्रपूर', latitude: 19.9615, longitude: 79.2961 },
  { id: 'bhandara', nameMr: 'भंडारा', nameEn: 'Bhandara', districtMr: 'भंडारा', latitude: 21.1685, longitude: 79.6542 },
  { id: 'gondia', nameMr: 'गोंदिया', nameEn: 'Gondia', districtMr: 'गोंदिया', latitude: 21.4556, longitude: 80.1963 },
  { id: 'gadchiroli', nameMr: 'गडचिरोली', nameEn: 'Gadchiroli', districtMr: 'गडचिरोली', latitude: 20.1809, longitude: 79.9984 },
  { id: 'hingoli', nameMr: 'हिंगोली', nameEn: 'Hingoli', districtMr: 'हिंगोली', latitude: 19.7197, longitude: 77.1472 },
  { id: 'raigad', nameMr: 'रायगड (अलिबाग)', nameEn: 'Alibag / Raigad', districtMr: 'रायगड', latitude: 18.6534, longitude: 72.8777 },
  { id: 'ratnagiri', nameMr: 'रत्नागिरी', nameEn: 'Ratnagiri', districtMr: 'रत्नागिरी', latitude: 16.9902, longitude: 73.3120 },
  { id: 'sindhudurg', nameMr: 'सिंधुदुर्ग (ओरोस)', nameEn: 'Sindhudurg', districtMr: 'सिंधुदुर्ग', latitude: 16.1478, longitude: 73.6933 },
  // Important Vanjari Samaj Dominant Talukas & Religious Places
  { id: 'parli', nameMr: 'परळी वैजनाथ (बीड)', nameEn: 'Parli Vaijnath', districtMr: 'बीड', latitude: 18.8492, longitude: 76.5367 },
  { id: 'bhagwangad', nameMr: 'भगवानगड / पाथर्डी', nameEn: 'Bhagwangad / Pathardi', districtMr: 'अहिल्यानगर', latitude: 19.1667, longitude: 75.1833 },
  { id: 'majalgaon', nameMr: 'माजलगाव (बीड)', nameEn: 'Majalgaon', districtMr: 'बीड', latitude: 19.1500, longitude: 76.0667 },
  { id: 'georai', nameMr: 'गेवराई (बीड)', nameEn: 'Georai', districtMr: 'बीड', latitude: 19.2667, longitude: 75.7500 },
  { id: 'ambajogai', nameMr: 'अंबाजोगाई (बीड)', nameEn: 'Ambajogai', districtMr: 'बीड', latitude: 18.7300, longitude: 76.3800 },
  { id: 'patoda', nameMr: 'पाटोदा (बीड)', nameEn: 'Patoda', districtMr: 'बीड', latitude: 18.9667, longitude: 75.4500 },
  { id: 'ashti', nameMr: 'आष्टी (बीड)', nameEn: 'Ashti', districtMr: 'बीड', latitude: 18.8000, longitude: 75.1667 },
  { id: 'kaij', nameMr: 'केज (बीड)', nameEn: 'Kaij', districtMr: 'बीड', latitude: 18.7000, longitude: 76.0167 },
  { id: 'shirur_kasar', nameMr: 'शिरूर कासार (बीड)', nameEn: 'Shirur Kasar', districtMr: 'बीड', latitude: 19.0667, longitude: 75.3333 },
  { id: 'wadwani', nameMr: 'वडवणी (बीड)', nameEn: 'Wadwani', districtMr: 'बीड', latitude: 18.9500, longitude: 75.9833 },
  { id: 'dharur', nameMr: 'धारूर (बीड)', nameEn: 'Dharur', districtMr: 'बीड', latitude: 18.8167, longitude: 76.1167 },
  { id: 'sangamner', nameMr: 'संगमनेर', nameEn: 'Sangamner', districtMr: 'अहिल्यानगर', latitude: 19.5775, longitude: 74.2081 },
  { id: 'kopargaon', nameMr: 'कोपरगाव', nameEn: 'Kopargaon', districtMr: 'अहिल्यानगर', latitude: 19.8833, longitude: 74.4833 },
  { id: 'shirdi', nameMr: 'शिर्डी', nameEn: 'Shirdi', districtMr: 'अहिल्यानगर', latitude: 19.7667, longitude: 74.4767 },
  { id: 'shevgaon', nameMr: 'शेवगाव', nameEn: 'Shevgaon', districtMr: 'अहिल्यानगर', latitude: 19.3400, longitude: 75.3000 },
  { id: 'sinnar', nameMr: 'सिन्नर', nameEn: 'Sinnar', districtMr: 'नाशिक', latitude: 19.8456, longitude: 74.0000 },
  { id: 'malegaon', nameMr: 'मालेगाव', nameEn: 'Malegaon', districtMr: 'नाशिक', latitude: 20.5539, longitude: 74.5298 },
  { id: 'kalyan', nameMr: 'कल्याण-डोंबिवली', nameEn: 'Kalyan-Dombivli', districtMr: 'ठाणे', latitude: 19.2403, longitude: 73.1305 },
  { id: 'panvel', nameMr: 'पनवेल', nameEn: 'Panvel', districtMr: 'रायगड', latitude: 18.9894, longitude: 73.1175 },
  { id: 'pandharpur', nameMr: 'पंढरपूर', nameEn: 'Pandharpur', districtMr: 'सोलापूर', latitude: 17.6775, longitude: 75.3265 },
  { id: 'baramati', nameMr: 'बारामती', nameEn: 'Baramati', districtMr: 'पुणे', latitude: 18.1517, longitude: 74.5777 },
];

export function findCityCoordinates(cityNameOrQuery: string): { latitude: number; longitude: number; nameMr: string } {
  if (!cityNameOrQuery) {
    return { latitude: 19.8762, longitude: 75.3433, nameMr: 'छत्रपती संभाजीनगर' };
  }

  const q = cityNameOrQuery.toLowerCase().trim();
  const match = MAHARASHTRA_CITIES.find(
    (c) =>
      c.nameMr.toLowerCase().includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.districtMr.toLowerCase().includes(q) ||
      q.includes(c.nameEn.toLowerCase()) ||
      q.includes(c.nameMr)
  );

  if (match) {
    return { latitude: match.latitude, longitude: match.longitude, nameMr: match.nameMr };
  }

  // Default Central Maharashtra coordinates
  return { latitude: 18.9891, longitude: 75.7601, nameMr: cityNameOrQuery };
}
