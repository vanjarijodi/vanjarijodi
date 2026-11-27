// Comprehensive Marathi (Devanagari) to English Transliteration Engine
// Supports common Vanjari & Marathi names/surnames dictionary + algorithmic fallback

const COMMON_MARATHI_WORDS: Record<string, string> = {
  // Honorifics
  'डॉ.': 'Dr.',
  'डॉ': 'Dr.',
  'प्रा.': 'Prof.',
  'प्रा': 'Prof.',
  'इंजि.': 'Er.',
  'इंजि': 'Er.',
  'ॲड.': 'Adv.',
  'ॲड': 'Adv.',
  'श्री.': 'Mr.',
  'श्री': 'Mr.',
  'सौ.': 'Mrs.',
  'सौ': 'Mrs.',
  'कु.': 'Ms.',
  'कु': 'Ms.',

  // Districts & Locations
  'बीड': 'Beed',
  'नाशिक': 'Nashik',
  'अहमदनगर': 'Ahmednagar',
  'छत्रपती संभाजीनगर': 'Chhatrapati Sambhajinagar',
  'औरंगाबाद': 'Aurangabad',
  'पुणे': 'Pune',
  'मुंबई': 'Mumbai',
  'ठाणे': 'Thane',
  'जालना': 'Jalna',
  'परभणी': 'Parbhani',
  'नांदेड': 'Nanded',
  'लातूर': 'Latur',
  'धाराशिव': 'Dharashiv',
  'उस्मानाबाद': 'Osmanabad',
  'सोलापूर': 'Solapur',
  'सांगली': 'Sangli',
  'सातारा': 'Satara',
  'कोल्हापूर': 'Kolhapur',
  'नागपूर': 'Nagpur',
  'अमरावती': 'Amravati',
  'अकोला': 'Akola',
  'यवतमाळ': 'Yavatmal',
  'बुलढाणा': 'Buldhana',
  'वाशिम': 'Washim',
  'धुळे': 'Dhule',
  'जळगाव': 'Jalgaon',
  'नंदुरबार': 'Nandurbar',
  'रायगड': 'Raigad',
  'रत्नागिरी': 'Ratnagiri',
  'सिंधुदुर्ग': 'Sindhudurg',
  'महाराष्ट्र': 'Maharashtra',

  // Common Occupations & Education
  'इंजिनिअर': 'Engineer',
  'सॉफ्टवेअर इंजिनिअर': 'Software Engineer',
  'आयटी इंजिनिअर': 'IT Engineer',
  'सिव्हिल इंजिनिअर': 'Civil Engineer',
  'मेकॅनिकल इंजिनिअर': 'Mechanical Engineer',
  'इलेक्ट्रिकल इंजिनिअर': 'Electrical Engineer',
  'डॉक्टर': 'Doctor',
  'एम.बी.बी.एस.': 'M.B.B.S.',
  'एम.डी.': 'M.D.',
  'बी.ए.एम.एस.': 'B.A.M.S.',
  'बी.एच.एम.एस.': 'B.H.M.S.',
  'शिक्षक': 'Teacher',
  'प्राध्यापक': 'Professor',
  'सरकारी नोकरी': 'Government Job',
  'शासकीय सेवा': 'Government Service',
  'सरकारी अधिकारी': 'Government Officer',
  'पोलीस': 'Police',
  'व्यावसायिक': 'Businessman',
  'व्यवसाय': 'Business',
  'शेती': 'Agriculture',
  'शेतकरी': 'Farmer',
  'बँक अधिकारी': 'Bank Officer',
  'सी.ए.': 'Chartered Accountant (CA)',
  'वकील': 'Advocate / Lawyer',
  'फार्मासिस्ट': 'Pharmacist',
  'बी.ई.': 'B.E.',
  'बी.टेक.': 'B.Tech.',
  'एम.टेक.': 'M.Tech.',
  'एम.बी.ए.': 'M.B.A.',
  'एम.सी.ए.': 'M.C.A.',
  'बी.सी.ए.': 'B.C.A.',
  'बी.कॉम.': 'B.Com.',
  'एम.कॉम.': 'M.Com.',
  'बी.ए.': 'B.A.',
  'एम.ए.': 'M.A.',
  'बी.एससी.': 'B.Sc.',
  'एम.एससी.': 'M.Sc.',
  'डिप्लोमा': 'Diploma',
  'माहिती उपलब्ध नाही': 'Information Not Available',

  // Marital Status & Subcastes
  'अविवाहित': 'Unmarried',
  'घटस्फोटित': 'Divorced',
  'विधवा': 'Widow',
  'विदुर': 'Widower',
  'वंजारी': 'Vanjari',
  'रावजी वंजारी': 'Raoji Vanjari',
  'लाड वंजारी': 'Lad Vanjari',
  'भगवानराव वंजारी': 'Bhagwanrao Vanjari',
  'मठपती वंजारी': 'Mathapati Vanjari',

  // Common Surnames
  'मुंडे': 'Munde',
  'सानप': 'Sanap',
  'फड': 'Phad',
  'गर्जे': 'Garje',
  'आंधळे': 'Andhale',
  'कराड': 'Karad',
  'दराडे': 'Darade',
  'काकडे': 'Kakade',
  'पालवे': 'Palve',
  'डोईफोडे': 'Doifode',
  'गित्ते': 'Gitte',
  'खेडेकर': 'Khedekar',
  'चव्हाण': 'Chavan',
  'पवार': 'Pawar',
  'देशमुख': 'Deshmukh',
  'पाटील': 'Patil',
  'जाधव': 'Jadhav',
  'शिंदे': 'Shinde',
  'मोहिते': 'Mohite',
  'कदम': 'Kadam',
  'जोशी': 'Joshi',
  'गायकवाड': 'Gaikwad',
  'सूर्यवंशी': 'Suryawanshi',
  'तांबडे': 'Tambade',
  'बोराडे': 'Borade',
  'आव्हाड': 'Awhad',
  'बडगुजर': 'Badgujar',
  'ठाकरे': 'Thakre',
  'राठोड': 'Rathod',
  'पवार-मुंडे': 'Pawar-Munde',

  // Common First & Middle Names
  'राहुल': 'Rahul',
  'बबनराव': 'Babanrao',
  'गणेश': 'Ganesh',
  'प्रियंका': 'Priyanka',
  'अजय': 'Ajay',
  'रामदास': 'Ramdas',
  'अशोक': 'Ashok',
  'सुनील': 'Sunil',
  'विकास': 'Vikas',
  'पूजा': 'Pooja',
  'स्नेहल': 'Snehal',
  'वैष्णवी': 'Vaishnavi',
  'अभिषेक': 'Abhishek',
  'सचिन': 'Sachin',
  'रोहन': 'Rohan',
  'अमित': 'Amit',
  'प्रशांत': 'Prashant',
  'महेश': 'Mahesh',
  'दिनेश': 'Dinesh',
  'सुरेश': 'Suresh',
  'रमेश': 'Ramesh',
  'ज्ञानेश्वर': 'Dnyaneshwar',
  'एकनाथ': 'Eknath',
  'भागवत': 'Bhagwat',
  'दत्तू': 'Dattu',
  'निलेश': 'Nilesh',
  'अमोल': 'Amol',
  'संजय': 'Sanjay',
  'मंगेश': 'Mangesh',
  'संतोष': 'Santosh',
  'दीपक': 'Deepak',
  'प्रदीप': 'Pradeep',
  'स्वाती': 'Swati',
  'अनिता': 'Anita',
  'सुप्रिया': 'Supriya',
  'आरती': 'Aarti',
  'कोमल': 'Komal',
  'शीतल': 'Sheetal',
  'मोनिका': 'Monika',
  'रुपाली': 'Rupali',
  'भाग्यश्री': 'Bhagyashree',
  'पल्लवी': 'Pallavi',
  'सोनाली': 'Sonali',
  'नेहा': 'Neha',
  'काजल': 'Kajal',
  'अंकिता': 'Ankita',
  'प्रणाली': 'Pranali'
};

const INDEPENDENT_VOWELS: Record<string, string> = {
  'अ': 'A', 'आ': 'Aa', 'इ': 'I', 'ई': 'Ee', 'उ': 'U', 'ऊ': 'Oo',
  'ऋ': 'Ru', 'ए': 'E', 'ऐ': 'Ai', 'ओ': 'O', 'औ': 'Au', 'अं': 'Am', 'अः': 'Ah'
};

const CONSONANTS: Record<string, string> = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h', 'ळ': 'l',
  'क्ष': 'ksh', 'ज्ञ': 'dny'
};

const VOWEL_SIGNS: Record<string, string> = {
  'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ः': 'h', 'ॅ': 'a', 'ॉ': 'o'
};

export function transliterateMarathiToEnglish(text: string): string {
  if (!text) return '';
  
  // If text is already mostly Latin/English letters, return as is
  if (/^[a-zA-Z0-9\s.,()-]+$/.test(text.trim())) {
    return text.trim();
  }

  const words = text.trim().split(/\s+/);
  
  const convertedWords = words.map(word => {
    const cleanWord = word.trim();
    if (!cleanWord) return '';

    // Check dictionary first
    if (COMMON_MARATHI_WORDS[cleanWord]) {
      return COMMON_MARATHI_WORDS[cleanWord];
    }

    // Algorithmic Transliteration
    let result = '';
    let i = 0;
    while (i < cleanWord.length) {
      const char = cleanWord[i];
      const nextChar = cleanWord[i + 1] || '';

      // Check two-char combinations (like ज्ञ, क्ष)
      if (char === '्' && nextChar) {
        // Halant suppresses inherent vowel
        i++;
        continue;
      }

      if (INDEPENDENT_VOWELS[char]) {
        result += INDEPENDENT_VOWELS[char];
        i++;
        continue;
      }

      if (CONSONANTS[char]) {
        let cons = CONSONANTS[char];
        // Check if next char is a vowel sign or halant
        if (VOWEL_SIGNS[nextChar]) {
          result += cons + VOWEL_SIGNS[nextChar];
          i += 2;
        } else if (nextChar === '्') {
          result += cons;
          i += 2;
        } else {
          // If at the end of word or before space, don't append trailing 'a' except for single chars
          const isEnd = (i === cleanWord.length - 1);
          if (isEnd) {
            result += cons;
          } else {
            result += cons + 'a';
          }
          i++;
        }
        continue;
      }

      if (VOWEL_SIGNS[char]) {
        result += VOWEL_SIGNS[char];
        i++;
        continue;
      }

      // Non-Devanagari characters (punctuation, numbers)
      result += char;
      i++;
    }

    // Capitalize first letter of word
    if (result.length > 0) {
      return result.charAt(0).toUpperCase() + result.slice(1);
    }
    return result;
  });

  return convertedWords.join(' ');
}
