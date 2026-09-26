import { ExtractedBioData } from '../components/AIBioDataExtractor';

export interface OcrProgressInfo {
  status: string;
  progress: number; // 0 to 100
}

/**
 * Run client-side in-browser OCR using Tesseract.js
 * Supports Marathi ('mar') + English ('eng') scripts
 */
export const runInBrowserTesseractOcr = async (
  imageDataUrl: string,
  onProgress?: (info: OcrProgressInfo) => void
): Promise<{ text: string; confidence: number; data: ExtractedBioData }> => {
  try {
    onProgress?.({ status: 'Tesseract OCR इंजिन लोड करत आहे...', progress: 10 });
    
    // Dynamic import to prevent heavy initial bundle
    const { createWorker } = await import('tesseract.js');

    onProgress?.({ status: 'मराठी व इंग्रजी भाषा मॉडेल्स तयार करत आहे...', progress: 25 });

    let worker: any = null;
    try {
      worker = await createWorker(['mar', 'eng'], 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const pct = Math.min(95, Math.round(30 + (m.progress || 0) * 60));
            onProgress?.({
              status: `कागदपत्रातील मराठी मजकूर वाचत आहे (${pct}%)...`,
              progress: pct,
            });
          }
        },
      });
    } catch (langErr) {
      console.warn('Marathi traineddata load failed, falling back to English worker:', langErr);
      onProgress?.({ status: 'भाषा मॉडेल बॅकअप मोडमध्ये सुरू करत आहे...', progress: 35 });
      worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const pct = Math.min(95, Math.round(30 + (m.progress || 0) * 60));
            onProgress?.({
              status: `कागदपत्रातील मजकूर स्कॅन करत आहे (${pct}%)...`,
              progress: pct,
            });
          }
        },
      });
    }

    onProgress?.({ status: 'बायोडाटा मजकूर स्कॅन करत आहे...', progress: 60 });

    const ret = await worker.recognize(imageDataUrl);
    const rawText = ret.data.text || '';
    const confidence = ret.data.confidence || 0;

    onProgress?.({ status: 'मजकुरातून माहितीचे विश्लेषण करत आहे...', progress: 95 });

    try {
      await worker.terminate();
    } catch (tErr) {
      console.warn('Worker terminate notice:', tErr);
    }

    const parsedData = parseBioDataFromRawOCR(rawText);

    onProgress?.({ status: 'माहिती वाचन पूर्ण झाले!', progress: 100 });

    return {
      text: rawText,
      confidence,
      data: parsedData,
    };
  } catch (err: any) {
    console.error('Tesseract.js OCR Error:', err);
    throw new Error('In-browser OCR वाचनात अडचण आली: ' + (err.message || 'अज्ञात त्रुटी'));
  }
};

/**
 * Intelligent Devanagari & English Matrimonial Rule-Engine & Regex Parser
 */
export const parseBioDataFromRawOCR = (text: string): ExtractedBioData => {
  const clean = (text || '')
    .replace(/\r\n/g, '\n')
    .replace(/[|│]/g, ' ')
    .trim();

  const lines = clean.split('\n').map((l) => l.trim()).filter(Boolean);

  const findValue = (keywords: string[]): string => {
    for (const kw of keywords) {
      const regex = new RegExp(`(?:^|\\b|\\s)${kw}\\s*[:\\-–=–—.]?\\s*([^\\n,;]+)`, 'i');
      const match = clean.match(regex);
      if (match && match[1]?.trim()) {
        let val = match[1].trim();
        // Clean out trailing unwanted tokens
        val = val.replace(/^[:\-–=–—.]\s*/, '').trim();
        if (val.length > 1 && !val.includes('बायोडाटा')) {
          return val;
        }
      }
    }
    return '';
  };

  // 1. Mobile Number
  const mobileMatch =
    clean.match(/(?:मोबाईल|मोबाइल|संपर्क|फोन|Phone|Mobile|Contact|Cell)[\s:\-–=–—.]*([6-9]\d{9})/i) ||
    clean.match(/([6-9]\d{4}\s?[0-9]\d{4})/i) ||
    clean.match(/([6-9]\d{9})/);
  
  let mobile = '';
  if (mobileMatch) {
    mobile = mobileMatch[1].replace(/\s+/g, '');
  }

  // 2. Candidate Full Name
  let fullName = findValue([
    'मुलाचे नाव', 'मुलीचे नाव', 'मुलाचे नांव', 'मुलीचे नांव',
    'उमेदवाराचे नाव', 'उमेदवाराचे नांव', 'उमेदवाराचे पूर्ण नाव',
    'पूर्ण नाव', 'पूर्ण नांव', 'नाव', 'नांव',
    'Name', 'Full Name', 'Candidate Name', 'Name of Candidate'
  ]);

  if (!fullName) {
    // Check honorific prefixes
    const matchHonorific = clean.match(/(?:चि\.|चिरंजीव|कु\.|कुमारी|सौ\.का\.|सौ\.|श्री\.|Chi\.|Kum\.|Mr\.|Ms\.)\s*([^\n,;:]+)/i);
    if (matchHonorific && matchHonorific[1]?.trim()) {
      fullName = matchHonorific[0].trim();
    }
  }

  if (!fullName) {
    // Check first 4 valid lines
    for (let i = 0; i < Math.min(lines.length, 6); i++) {
      const line = lines[i];
      if (/^(बायोडाटा|बायो-डाटा|biodata|bio-data|matrimonial|kundali|पत्रिका|श्री गणेशाय नमः|॥|शुभ विवाह|परिचय पत्र)$/i.test(line)) continue;
      if (line.length >= 4 && line.length <= 45 && !line.includes(':') && !line.includes('=')) {
        fullName = line;
        break;
      }
    }
  }

  // 3. Gender Detection
  let gender: 'bride' | 'groom' = 'groom';
  if (/(?:मुलीचे|वधू|कन्या|कु\.|कुमारी|सौ\.का\.|Bride|Girl|Female|Daughter|मुलीची)/i.test(clean)) {
    gender = 'bride';
  } else if (/(?:मुलाचे|वर|कुमार|चि\.|चिरंजीव|Groom|Boy|Male|Son|मुलाची)/i.test(clean)) {
    gender = 'groom';
  }

  if (fullName) {
    if (/(?:कु\.|कुमारी|सौ\.का\.)/i.test(fullName)) {
      gender = 'bride';
    } else if (/(?:चि\.|चिरंजीव)/i.test(fullName)) {
      gender = 'groom';
    }
  }

  // 4. Date of Birth
  const rawDob =
    findValue(['जन्म तारीख', 'जन्मतारीख', 'जन्म दिनांक', 'दिनांक', 'DOB', 'Date of Birth', 'Birth Date']) ||
    clean.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/)?.[1] ||
    '';
  
  let formattedDob = rawDob;
  if (rawDob) {
    const parts = rawDob.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
    if (parts) {
      const d = parts[1].padStart(2, '0');
      const m = parts[2].padStart(2, '0');
      const y = parts[3];
      formattedDob = `${y}-${m}-${d}`;
    }
  }

  // 5. Astrological Details
  const birthTime = findValue(['जन्म वेळ', 'वेळ', 'Birth Time', 'Time of Birth']);
  const birthPlace = findValue(['जन्म ठिकाण', 'जन्मगाव', 'जन्म स्थळ', 'Birth Place', 'Place of Birth']);
  const gotra = findValue(['गोत्र', 'Gotra']) || 'कश्यप';
  const rashi = findValue(['रास', 'राशी', 'Rashi']);
  const nakshatra = findValue(['नक्षत्र', 'Nakshatra']);
  const gan = findValue(['गण', 'Gan']);
  const nadi = findValue(['नाडी', 'Nadi']);

  // 6. Physical Attributes
  const height = findValue(['उंची', 'Height']) || clean.match(/(\d\s*['’ft]\s*\d{1,2}\s*["”in]*)/i)?.[1] || '';
  const weight = findValue(['वजन', 'Weight']) || clean.match(/(\d{2,3}\s*(?:kg|किलो))/i)?.[1] || '';
  const bloodGroup = findValue(['रक्तगट', 'रक्त गट', 'Blood Group']) || clean.match(/\b(A|B|AB|O)[\s]*[\+\-]\b/i)?.[0] || '';
  const complexion = findValue(['वर्ण', 'रंग', 'Complexion']) || 'निमगोरा';

  // 7. Education & Career
  const education =
    findValue(['शिक्षण', 'Degree', 'Education', 'पात्रता', 'शैक्षणिक पात्रता', 'Qualification']) ||
    clean.match(/\b(B\.?Tech|M\.?Tech|B\.?E|M\.?E|B\.?A|M\.?A|B\.?Com|M\.?Com|B\.?Sc|M\.?Sc|Diploma|MBBS|MD|BAMS|BHMS|B\.?Pharm|M\.?Pharm|Ph\.?D|MBA|MCA|BCA|BCS|MCS|12th|Graduate|Post Graduate)\b/i)?.[0] ||
    '';

  const occupation =
    findValue(['नोकरी', 'व्यवसाय', 'कामकाज', 'Occupation', 'Job', 'Profession', 'Service', 'सर्व्हिस']) ||
    '';

  const companyName = findValue(['कंपनी', 'कंपनीचे नाव', 'कार्यालय', 'Company', 'Office', 'Workplace']);
  const income = findValue(['उत्पन्न', 'वार्षिक उत्पन्न', 'मासिक उत्पन्न', 'Income', 'Salary', 'CTC', 'पगार']);

  // 8. Family Details
  const fatherName = findValue(['वडिलांचे नाव', 'वडीलांचे नाव', 'वडिलांचे नांव', 'वडील', 'Father Name', 'Father']);
  const fatherOccupation = findValue(['वडिलांचा व्यवसाय', 'वडिलांची नोकरी', 'वडील व्यवसाय']);
  const motherName = findValue(['आईचे नाव', 'आईचे नांव', 'आई', 'Mother Name', 'Mother']);
  const motherOccupation = findValue(['आईचा व्यवसाय', 'आई गृहिणी']);

  // Brothers & Sisters count / details
  const brotherDetails = findValue(['भाऊ', 'भाऊंची माहिती', 'Brothers', 'Brother Details']);
  let brothers = 0;
  if (brotherDetails) {
    const bMatch = brotherDetails.match(/(\d+)/);
    brothers = bMatch ? parseInt(bMatch[1], 10) : 1;
  }

  const sisterDetails = findValue(['बहीण', 'बहिणी', 'बहिणींची माहिती', 'Sisters', 'Sister Details']);
  let sisters = 0;
  if (sisterDetails) {
    const sMatch = sisterDetails.match(/(\d+)/);
    sisters = sMatch ? parseInt(sMatch[1], 10) : 1;
  }

  // Relative Surnames
  const knownVanjariSurnames = [
    'मुंडे', 'सानप', 'नागरे', 'घुगे', 'आंधळे', 'दराडे', 'फड', 'काकड',
    'आव्हाड', 'गर्जे', 'पालवे', 'तांबडे', 'चाटे', 'नागरगोजे', 'गिते',
    'खाडे', 'बडे', 'शिंगणे', 'अंधारे', 'सोनवणे', 'वारभुवन', 'शिरसाट',
    'मोटे', 'केकाण', 'सपकाळ', 'जाधव', 'पवार', 'गायकवाड', 'चव्हाण'
  ];

  const foundSurnames: string[] = [];
  const rawSurnamesText = findValue(['पाहुणे', 'नातेसंबंध', 'नातेवाईक आडनावे', 'आडनावे', 'Relatives', 'Relative Surnames']);
  
  if (rawSurnamesText) {
    const tokens = rawSurnamesText.split(/[,;\s/]+/).map((t) => t.trim()).filter(Boolean);
    for (const tok of tokens) {
      if (tok.length >= 2 && !foundSurnames.includes(tok)) {
        foundSurnames.push(tok);
      }
    }
  }

  // Also search whole text for known Vanjari surnames
  for (const sName of knownVanjariSurnames) {
    if (clean.includes(sName) && !foundSurnames.includes(sName) && fullName !== sName) {
      foundSurnames.push(sName);
    }
  }

  // 9. Mama
  const mamaName = findValue(['मामाचे नाव', 'मामाचे नांव', 'मामा', 'Mama Name', 'Maternal Uncle']);
  const mamaNative = findValue(['मामाचे गाव', 'मामा गाव', 'मामा पत्ता', 'Mama Native']);

  // 10. Address & Region
  const currentAddress = findValue(['पत्ता', 'सध्याचा पत्ता', 'राहणार', 'Address', 'Current Address']);
  const nativeAddress = findValue(['मूळ गाव', 'मूळ पत्ता', 'गाव', 'Native Place', 'Native Address']);
  
  // District detection
  const maharashtraDistricts = [
    'बीड', 'अहमदनगर', 'छत्रपती संभाजीनगर', 'औरंगाबाद', 'जालना', 'पुणे', 'नाशिक',
    'लातूर', 'परभणी', 'नांदेड', 'हिंगोली', 'धाराशिव', 'उस्मानाबाद', 'सोलापूर',
    'ठाणे', 'मुंबई', 'रायगड', 'सातारा', 'सांगली', 'कोल्हापूर', 'नागपूर', 'अमरावती',
    'बुलढाणा', 'अकोला', 'वाशीम', 'यवतमाळ', 'वर्धा', 'चंद्रपूर', 'गोंदिया', 'गडचिरोली'
  ];

  let district = findValue(['जिल्हा', 'District']);
  if (!district) {
    for (const dist of maharashtraDistricts) {
      if (clean.includes(dist)) {
        district = dist;
        break;
      }
    }
  }

  const taluka = findValue(['तालुका', 'ता.', 'Taluka']);
  const city = findValue(['शहर', 'City']) || district || '';
  const email = clean.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] || '';
  const expectations = findValue(['अपेक्षा', 'वधूची अपेक्षा', 'वराची अपेक्षा', 'Expectations', 'Partner Expectations']);

  return {
    fullName: fullName || '',
    gender,
    dob: formattedDob || '1998-05-15',
    birthTime,
    birthPlace,
    caste: 'वंजारी (NT-D)',
    subCaste: 'वंजारी',
    gotra,
    rashi,
    nakshatra,
    gan,
    nadi,
    height,
    weight,
    bloodGroup,
    complexion,
    education: education || 'पदवीधर (Graduate)',
    occupation: occupation || 'व्यवसाय / नोकरी',
    companyName,
    income,
    maritalStatus: 'never_married',
    fatherName,
    fatherOccupation,
    motherName,
    motherOccupation,
    brothers,
    brotherDetails,
    sisters,
    sisterDetails,
    relativeSurnames: foundSurnames.slice(0, 10),
    mamaName,
    mamaNative,
    mobile,
    email,
    currentAddress,
    nativeAddress,
    district,
    taluka,
    city,
    expectations: expectations || 'सुशिक्षित व सुसंस्कृत वंजारी जोडीदार',
    rawSummary: clean || 'In-Browser OCR द्वारे मजकूर वाचला गेला.',
  };
};
