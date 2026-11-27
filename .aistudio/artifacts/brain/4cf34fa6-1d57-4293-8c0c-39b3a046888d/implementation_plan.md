# वंजारी जोडी (Vanjari Jodi) — मास्टर ॲडमिन कस्टमायझेशन, Google Play सुरक्षितता व React हुक एरर फिक्स

हा प्लॅन अ‍ॅडमिन लॉगिनमधून **संपूर्ण ॲप (Android APK) आणि वेबसाईट (Desktop/Mobile Web)** एकाच मास्टर डॅशबोर्डवरून १००% कस्टमायझ करण्यासाठी, **Google Play Console पॉलिसीनुसार ॲपमध्ये पेमेंटचा कोणताही उल्लेख न ठेवण्यासाठी**, आणि ब्राउझरमधील **`Invalid hook call (useState)` एरर कायमस्वरूपी दुरुस्त करण्यासाठी** तयार केला आहे.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> खालील निर्णय तुमच्या निवडीप्रमाणे निश्चित केले आहेत. तुम्ही **Proceed** केल्यावर लगेच कोडमध्ये सर्व बदल लागू केले जातील.

- **Confirmed Decision 1 (अ‍ॅडमिनमधून संपूर्ण नियंत्रण - सर्व ४ पर्याय समाविष्ट)**:
  1. **ब्रँडिंग, मजकूर, लोगो, बॅनर, थीम व सेक्शन ऑन-ऑफ**: होमपेज शीर्षके, लोगो, ५ थीम प्रीसेट्स, स्वाइप/जेस्चर मोड, आणि कोणताही विभाग (यशोगाथा, वैशिष्ट्ये, आशीर्वाद, जाहिरात, Play Store बॉक्स) एका क्लिकवर चालू/बंद करणे.
  2. **नोंदणी फॉर्म फील्ड्स, बायोडाटा नियम व फोटो-संपर्क प्रायव्हसी**: नवीन नोंदणी ऑटो-अप्रूव्हल, पूर्ण नाव/आडनाव दृश्यता, फोटो ब्लर नियम, संपर्क क्रमांक दृश्यता (सर्वांसाठी / फक्त व्हेरिफाईड सदस्यांसाठी), आणि बायोडाटा वॉटरमार्क नियंत्रण.
  3. **प्रोमो कोड, प्लॅन किंमती व वेब पेमेंट पेज (`/pay`) सेटिंग्ज**: नवीन प्रोमो कोड तयार करणे (% किंवा ₹ सूट), मेंबरशिप प्लॅनच्या किंमती/कालावधी बदलणे, आणि वेब पेमेंट पेजवरील प्रत्येक शब्द व Razorpay/UPI सेटिंग्ज बदलणे.
  4. **पॉपअप जाहिरात, टिकर पट्टी व नोटिफिकेशन टेम्पलेट्स**: फ्लॅश पॉपअप जाहिरात (फोटो, बटन, वेळ), वरची धावती टिकर पट्टी (रंग, वेग, मजकूर), आणि ब्रॉडकास्ट/पुश नोटिफिकेशन टेम्पलेट्स थेट अ‍ॅडमिनमधून बदलणे.
- **Confirmed Decision 2 (Google Play Console पॉलिसी — ॲपमध्ये Zero Payment Mention)**:
  - **Android APK आणि Play मोडमध्ये पेमेंट, किंमती (`₹`), सबस्क्रिप्शन प्लॅन किंवा खरेदीचा कोणताही उल्लेख पूर्णपणे लपवला जाईल** (१००% मोफत वधू-वर समाज सेवा मंच).
  - पेमेंट गेटवे (Razorpay / UPI), प्लॅन किंमती आणि प्रोमो कोड **फक्त स्वतंत्र वेब पेमेंट पोर्टलवर (`/pay`)** आणि डेस्कटॉप/वेबसाईटवरच कार्यरत राहतील.
- **Recommended Default 3 (अ‍ॅडमिन कस्टमायझेशन रचना)**:
  - अ‍ॅडमिन पॅनेलमध्ये **"🎛️ मास्टर कस्टमायझेशन सेंटर (App + Website Full Control)"** हा एकच सुटसुटीत डॅशबोर्ड दिला जाईल, ज्यात स्पष्ट कॅटेगरी टॅब्स आणि थेट वेबसाईटवरील **Live Edit Mode** दोन्ही उपलब्ध असतील.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **React Invalid Hook Call Fix**: Vite बंडलरमध्ये React आणि React-DOM ची डुप्लिकेट कॉपी तयार होऊन `AudioCallModal` मध्ये येणारा `Cannot read properties of null (reading 'useState')` हा क्रॅश `dedupe: ['react', 'react-dom']` आणि सुरक्षित रेंडरिंग गार्डने कायमचा बंद करतो.
  2. **Unified Admin Studio**: अ‍ॅडमिनला कोडमध्ये हात न लावता अ‍ॅप आणि वेबसाईटमधील प्रत्येक मजकूर, फोटो, फील्ड, प्रायव्हसी नियम, प्रोमो कोड, प्लॅन्स आणि पॉपअप बदलण्याचे पूर्ण स्वातंत्र्य देतो.
  3. **Strict Play Store Compliance**: Android APK आणि Google Play रिव्ह्यू मोडमध्ये १००% मोफत समाज सेवा अनुभव ठेवतो, तर वेबवर (`/pay`) Razorpay पेमेंट व प्रोमो कोड्स पूर्णपणे चालतात.
- **Target Audience / Persona**: प्लॅटफॉर्मचे मुख्य अ‍ॅडमिन (ज्यांना मोबाईल किंवा कम्प्युटरवरून झटपट बदल करायचे आहेत) आणि वंजारी समाजातील वधू-वर व पालक.
- **Key Value**: कोणताही तांत्रिक एरर न येता, Google Play पॉलिसीचे १००% पालन करत अ‍ॅडमिनला संपूर्ण वेबसाईट व अ‍ॅपवर पूर्ण नियंत्रण मिळते.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **अ‍ॅडमिन फुल कस्टमायझेशन फ्लो**: अ‍ॅडमिन लॉगिन केल्यावर **"मास्टर सेटिंग्ज व CMS"** टॅबमध्ये ६ स्पष्ट विभाग दिसतील:
     - *१. ब्रँडिंग, थीम व सेक्शन ऑन-ऑफ (App & Web Layout)*
     - *२. नोंदणी, बायोडाटा व फोटो-संपर्क प्रायव्हसी (Privacy & Rules)*
     - *३. पॉपअप जाहिरात, टिकर पट्टी व नोटिफिकेशन्स (Marketing & Alerts)*
     - *४. प्रोमो कोड व प्लॅन किंमती (Web Plans & Promo Codes)*
     - *५. वेब पेमेंट पेज (`/pay`) संपूर्ण मजकूर एडिटर (Web CMS)*
     - *६. Google Play सेफ मोड व APK नियंत्रण (Play Console Compliance)*
  2. **रिअल-टाईम सेव्ह व टोस्ट फीडबॅक**: कोणताही टॉगल किंवा मजकूर बदलताच तो क्लाउड/सर्व्हरवर सेव्ह होतो आणि स्क्रीनवर स्वच्छ मराठी कन्फर्मेशन टोस्ट दिसतो (`window.alert` पॉपअपशिवाय).
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: पारंपारिक मंगल मॅट्रिमोनी ओळख (`Auspicious Crimson & Royal Gold`) आणि अ‍ॅडमिनसाठी स्वच्छ, उच्च-घनतेचा (High-Density) SaaS कंट्रोल डॅशबोर्ड.
  - *Color Palette & Mood*:
    - Primary Brand: `#800C1E` (Deep Auspicious Maroon) व `#A71930` (Rich Crimson)
    - Accent & Highlights: `#F59E0B` / `#FDE68A` (Warm Haldi Gold)
    - Admin Surface: `#FFFFFF` स्वच्छ कार्ड्स, `#F8FAFC` पार्श्वभूमी, आणि स्पष्ट स्टेटस रंग (`#16A34A` Active Green, `#D97706` Warning Amber, `#DC2626` Alert Crimson).
  - *Typography & Hierarchy*: मराठी देवनागरी आणि इंग्रजी मजकुरासाठी स्पष्ट बोल्ड शीर्षके, आकडेवारी व किंमतींसाठी `tabular-nums` (जेणेकरून आकडे हलत नाहीत), आणि कॉम्पॅक्ट कार्ड लेआउट.
- **Interactive Feedback & Motion**:
  - सर्व अ‍ॅडमिन फॉर्ममध्ये इनलाइन सेव्ह बॅनर, १-क्लिक रीसेट आणि थेट प्रीव्ह्यू; कोणत्याही मोडलमध्ये ब्राउझरचा `alert()` वापरला जाणार नाही.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Vite React Deduplication & Conditional Modal Mounting**
  - *Chosen Approach*: Vite कॉन्फिगरेशनमध्ये `resolve.dedupe: ['react', 'react-dom']` आणि `optimizeDeps.include: ['react', 'react-dom']` समाविष्ट करणे, तसेच `AudioCallModal` व इतर ग्लोबल मोडल्समध्ये सुरक्षित स्टेट हँडलिंग ठेवणे.
  - *Why*: Vite डेव्हलपमेंट सर्व्हरमध्ये वेगवेगळ्या चंक्स (`chunk-USTO3F3J.js` आणि `react-dom_client.js`) मुळे React चे दोन इन्स्टन्स लोड झाल्यास `useState` वर `null` एरर येतो. Deduplication मुळे नेहमी एकच React इन्स्टन्स वापरला जातो.
- **Decision 2: Strict App vs. Web Commercial Separation**
  - *Chosen Approach*: `isNativeAndroidApp()` आणि `isGooglePlayReviewActive(siteConfig)` या दोन्ही तपासण्यांद्वारे अ‍ॅपमध्ये सर्वत्र पेमेंट/किंमत/प्लॅन/रिफंड संदर्भ लपवणे, आणि अ‍ॅडमिनमध्येही **"Play Console 100% Free Safe Mode"** टॉगल देणे.
  - *Why*: Google Play Console च्या इन-ॲप परचेस व अँटी-स्टीयरिंग पॉलिसीचे उल्लंघन होऊ नये आणि APK १००% सुरक्षित राहावे.
- **Decision 3: Unified Master Customization Hub**
  - *Chosen Approach*: विखुरलेल्या सेटिंग्ज एकत्र करून `AdminMasterSettingsCenter` आणि `AdminCmsManager` मध्ये सर्व ६ कस्टमायझेशन विभाग टॅब्सद्वारे उपलब्ध करणे.
  - *Why*: अ‍ॅडमिनला वेगवेगळ्या मोडलमध्ये शोधाशोध न करता एकाच ठिकाणाहून अ‍ॅप आणि वेबसाईटमधील कोणताही बदल करता येतो.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                   VITE + REACT SINGLE-INSTANCE RUNTIME                    │
│        (resolve.dedupe: ['react', 'react-dom'] -> Zero Hook Crash)        │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│              GLOBAL APP CONTEXT & REAL-TIME SITE CONFIG STORE             │
│   • siteConfig (Branding, Sections, Privacy, Ticker, Flash Ad, PlayMode)  │
│   • websiteCms (All /pay Web Portal Visibility Toggles & Marathi Copy)    │
│   • plansList & promoCodes (Dynamic Pricing, Discounts, Validity)         │
└─────────────────┬───────────────────────────────────────┬─────────────────┘
                  │                                       │
                  ▼                                       ▼
┌───────────────────────────────────┐   ┌───────────────────────────────────┐
│   UNIFIED ADMIN CONTROL STUDIO    │   │   END-USER APP & WEBSITE VIEWS    │
│ ┌───────────────────────────────┐ │   │ ┌───────────────────────────────┐ │
│ │ 1. Branding, Theme & Sections │ │   │ │ Android APK / Play Safe View  │ │
│ │ 2. Registration & Privacy     │ │   │ │ • 100% Free Community Service │ │
│ │ 3. Popup Ad, Ticker & Alerts  │ │   │ │ • Zero ₹ / Plan / Payment UI  │ │
│ │ 4. Promo Codes & Plan Pricing │ │   │ └───────────────────────────────┘ │
│ │ 5. Website /pay Full CMS      │ │   │ ┌───────────────────────────────┐ │
│ │ 6. Play Console Safe Mode     │ │   │ │ Desktop & Mobile Web (/ & /pay)│ │
│ └───────────────────────────────┘ │   │ │ • Responsive Compact Biodatas │ │
└───────────────────────────────────┘   │ │ • Razorpay + Promo Checkout   │ │
                                        │ └───────────────────────────────┘ │
                                        └───────────────────────────────────┘
```

### Data Model & State
- **`SiteConfig` Extensions**:
  - सेक्शन व्हिजिबिलिटी टॉगल्स (`showHeroSection`, `showFeaturesSection`, `showSuccessStoriesSection`, `showBlessingsSection`, `showCommunityAdsSection`, `showFaqSection`, `showStatsSection`).
  - नोंदणी व बायोडाटा नियम (`requirePhotoOnRegistration`, `requireGotraOnRegistration`, `allowGuestBiodataView`, `defaultContactVisibility`).
  - नोटिफिकेशन टेम्पलेट्स (`welcomeNotificationText`, `approvalNotificationText`, `broadcastDefaultTitle`).
- **`WebsiteCmsConfig`**:
  - वेब पोर्टल (`/pay`) वरील सर्व १८ व्हिजिबिलिटी टॉगल्स आणि ६०+ मजकूर फील्ड्स (`localStorage` + `siteConfig` सिंकसह).

### Interactive Component & State Mapping
1. **React Hook Safety**: Vite config मधून React सिंगलटनची खात्री केल्यानंतर `AudioCallModal` आणि सर्व मोडल्स कोणताही हुक क्रॅश न होता उघडतील.
2. **Admin Master Tabs**: अ‍ॅडमिनने कोणताही सेक्शन टॉगल बंद केल्यास मुख्य होमपेज (`App.tsx` / `MobileHomeScreen.tsx`) वरून तो विभाग तात्काळ लपवला जाईल; मजकूर किंवा रंग बदलल्यास लगेच रिफ्लेक्ट होईल.
3. **Inline Notifications**: `AdminCmsManager` मधील जुने `alert()` काढून आधुनिक इनलाइन टोस्ट नोटिफिकेशन जोडले जातील.
