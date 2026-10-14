# 📱 वंजारी जोडी (Vanjari Jodi Matrimony) — Google Play Store Upload & Policy Compliance Guide

हा मार्गदर्शक Google Play Store वर ॲप १ टक्क्यात मंजूर (Instant Approval) होण्यासाठी आणि कोणत्याही पॉलिसीचे उल्लंघन (Zero Policy Violation) होऊ नये म्हणून तयार केला आहे.

---

## 🚀 १. ॲप बंडल (AAB) आणि साइनिंग की माहिती (Signing Credentials)

* **Package ID / Application ID:** `com.vanjarijodi.app`
* **App Name (नाव):** वंजारी जोडी (Vanjari Jodi Matrimony)
* **Target Android SDK:** `35` (Google Play Store २०२६ ची नवीनतम अनिवार्य आवश्यकता)
* **Minimum Android SDK:** `24` (Android 7.0 आणि त्यापुढील सर्व मोबाईल्स)
* **Release File Format:** `.aab` (Android App Bundle - Google Play Console साठी आवश्यक)

### 🔑 प्रोडक्शन साइनिंग की माहिती (Keystore Credentials):
* **Keystore File Name:** `release.keystore`
* **Key Alias:** `vanjarijodi`
* **Keystore Password:** `vanjari123`
* **Key Password:** `vanjari123`
* **SHA-1 Fingerprint:** `EB:10:60:5D:86:A9:FB:00:CD:E9:28:94:09:14:5C:EE:A6:85:A1:72`
* **SHA-256 Fingerprint:** `3B:B5:73:3A:98:8B:F1:3B:D6:9D:77:92:28:BD:D7:61:C2:D3:3E:7C:1C:79:F3:1A:14:10:4A:1B:E7:CB:8A:48`

---

## 🛡️ २. Google Play Store पॉलिसी पालन (Zero Violation Checklist)

गुगल प्ले स्टोअरचे रिव्ह्यूअर खालील गोष्टींची तपासणी करतात:

1. **गोपनीयता धोरण (Privacy Policy URL):**
   * **URL:** `https://ais-pre-gd3elul22zl4zk3i4alrw5-542294010175.asia-east1.run.app/privacy`
   * *(किंवा तुमचे अधिकृत डोमेन: `https://vanjarijodi.org/privacy`)*
   * यात डेटा गोळा करणे, DPDP Act २०२३, आणि डेटा संरक्षणाचे स्पष्ट नियम नमूद आहेत.

2. **खाते आणि डेटा डिलीट करण्याचा अधिकार (Account Deletion Policy):**
   * **URL:** `https://ais-pre-gd3elul22zl4zk3i4alrw5-542294010175.asia-east1.run.app/delete-account`
   * गुगलच्या २०२४-२०२६ च्या अनिवार्य नियमानुसार वापरकर्ता ॲपमधून थेट स्वतःचे खाते आणि सर्व फोटो/डेटा नष्ट करू शकतो.

3. **अनावश्यक परवानग्या (No Sensitive Permissions):**
   * ॲपमध्ये कोणतीही धोकादायक किंवा विनाकारण परवानगी घेतलेली नाही (SMS Reading, Call Logs, Contacts किंवा Background Location काढून टाकले आहे).
   * फक्त आवश्यक परवानग्या: `INTERNET`, `ACCESS_NETWORK_STATE`, `POST_NOTIFICATIONS`, आणि फोटो निवडीसाठी `READ_MEDIA_IMAGES`.

4. **ॲप ऍक्सेस क्रेडेंशियल्स (App Access for Google Reviewers):**
   * प्ले कन्सोलवर रिव्ह्यूअरला लॉगिन करून तपासण्यासाठी खालीलप्रमाणे माहिती प्रविष्ट करा:
     * **पर्याय (Option):** "All or some functionality is restricted" निवडा > "Add instructions" वर क्लिक करा.
     * **Instruction Name:** `Vanjari Jodi Demo & Google Review Credentials`
     * **Username / Mobile:** `9822100102` (किंवा `9822334455`)
     * **Password / OTP:** `123456`
     * **Any other instructions:** `Please use the test credentials provided above. OTP verification will accept '123456' or test PIN. Face verification uses runtime camera permission only when user clicks 'Verify Face'. Online membership testing uses Razorpay standard test cards (4111 1111 1111 1111, CVV: 123).`

5. **कॅमेरा परवानगी धोरण (Camera Permission Policy):**
   * ॲपच्या `AndroidManifest.xml` मध्ये कोणतीही सततची (Persistent) कॅमेरा परवानगी मागितलेली नाही.
   * कॅमेरा केवळ आणि केवळ वापरकर्त्याने स्वतः 'चेहरा पडताळणी' (Face Verification / Liveness Check) वर क्लिक केल्यासच इन-ॲप डायलॉगद्वारे विचारला जातो आणि तपासणी संपताच कॅमेरा स्ट्रीम बंद होते.

---

## 💳 ३. Razorpay गेटवे टेस्टिंग मार्गदर्शक (ATM Card & CVV Testing Guide)

तुम्हाला Razorpay पेमेंट गेटवे थेट चाचणी (Test) करण्यासाठी खालील चाचणी माहिती उपलब्ध आहे:

1. **ॲपमध्ये चाचणी कशी करावी:**
   * ॲपमध्ये कोणत्याही **सदस्यत्व प्लॅन (Membership Plan)** वर क्लिक करा (उदा. ₹३९८ वेलकम ऑफर किंवा ₹४९ कुंडली पास).
   * पेमेंट पद्धतींमध्ये **"अधिकृत Razorpay पेमेंट गेटवे (1-Click Pay)"** टॅब निवडा.
   * **"Razorpay द्वारे त्वरित भरा"** बटणावर क्लिक करा.
   * स्क्रीनवर सुरक्षित Razorpay पेमेंट पॉपअप उघडेल.
2. **कार्ड (Cards / ATM) पर्याय निवडा:**
   * **कार्ड नंबर (Card Number):** `4111 1111 1111 1111`
   * **एक्सपायरी (Expiry Date):** `12/28` (किंवा कोणतीही पुढील तारीख)
   * **CVV:** `123`
   * **कार्डवरील नाव:** `Vanjari Jodi Tester`
3. **पेमेंट पूर्ण करणे:**
   * 'Pay' वर क्लिक करा.
   * बँकिंग सिम्युलेशन स्क्रीनवर **"Success"** बटणावर क्लिक करा (किंवा OTP आल्यास `123456` टाका).
   * **निकाल:** पेमेंट तात्काळ मंजूर (Approved) होईल, तुमची मेंबरशिप आपोआप सक्रिय होईल आणि ॲडमिन डॅशबोर्डमध्ये पावती जमा होईल!
   * *टीप: टेस्ट मोडमध्ये असल्यामुळे तुमच्या कोणत्याही खऱ्या बँक खात्यातून पैसे कापले जाणार नाहीत.*

---

## ⚡ ४. GitHub वरून स्वयंचलित AAB आणि Key मिळवणे (GitHub Workflow)

प्रकल्पामध्ये `.github/workflows/android.yml` आधीच सेट केला आहे:
1. ॲप किंवा वेबसाईटच्या खाली (Footer) दिलेल्या **"🚀 GitHub Deploy (Sync)"** बटणावर क्लिक करा.
2. तुमचा GitHub Personal Access Token टाका व **"Deploy / Push Code"** वर क्लिक करा.
3. कोड GitHub वर जाताच **GitHub Actions** आपोआप:
   * संपूर्ण Android प्रोजेक्ट बिल्ड करतो.
   * `release.keystore` सह AAB बंडल सुरक्षितपणे साइन (Sign) करतो.
   * **GitHub Releases** आणि **Artifacts** मध्ये `VanjariJodi-release.aab`, `release.keystore` आणि `KEYSTORE_INFO.txt` उपलब्ध करून देतो.

---

## 📲 ५. Google Play Console वर अपलोड करण्याची सोपी पद्धत:

1. **Google Play Console** (https://play.google.com/console) वर जा.
2. **Create App** वर क्लिक करा > App Name: **वंजारी जोडी (Vanjari Jodi Matrimony)** > Free / Paid: **Free** निवडा.
3. **App Content** विभागात जाऊन:
   * **Privacy Policy URL** मध्ये: `https://vanjarijodi.org/privacy` टाका.
   * **App Access** मध्ये: Any user can register / Guest access is available.
   * **Ads:** "No, my app does not contain ads".
   * **Target Audience:** 18 and over (फक्त सज्ञान लोकांसाठी).
   * **Data Safety:** Photos/Videos गोळा होतात (मॅट्रिमोनी प्रोफाईलसाठी), डेटा ट्रान्सफर एनक्रिप्टेड आहे आणि वापरकर्ता खाते डिलीट करू शकतो.
4. **Production / Testing > Create New Release** वर क्लिक करा.
5. GitHub वरून मिळालेली **`VanjariJodi-release.aab`** फाईल ड्रॅग & ड्रॉप करून अपलोड करा.
6. **Save > Review Release > Start rollout to Production** वर क्लिक करा!

---

## 🎨 ६. तयार केलेले सर्व अधिकृत ग्राफिक्स आणि आयकॉन्स (Brand & Store Assets)

वापरकर्त्याने दिलेल्या मूळ अधिकृत लोगोनुसार खालील सर्व १३ ॲसेट्स अचूक रिझोल्युशनसह तयार करण्यात आले आहेत:

1. **Official original logo:** `/vanjari-jodi-official-logo.png` (800×800 मास्टर एम्बलेम)
2. **Transparent square logo:** `/logo-transparent.png` (1024×1024 ट्रान्सपरंट पीएनजी)
3. **Horizontal logo:** `/logo-horizontal.png` & `/logo-horizontal-transparent.png` (840×240 हेडर व बॅनरसाठी)
4. **Play Store 512×512 icon:** `/playstore-icon-512.png` (Google Play Console अनिवार्य ३२-बिट)
5. **Android launcher 512×512:** `/icon-512.png` व `/logo.png`
6. **Android launcher 192×192:** `/icon-192.png` व Android Mipmap (`ic_launcher.png`)
7. **Adaptive icon foreground/background:** 
   * Foreground: `/adaptive-icon-foreground.png` & `mipmap/ic_launcher_foreground.png` (432×432)
   * Background: `/adaptive-icon-background.png` & `@color/ic_launcher_background` (`#800C1E`)
8. **Notification icon:** `/notification-icon.png` व `drawable/ic_stat_notification.png` (स्टेटस बार व्हाइट सिल्हूट)
9. **Favicon:** `/favicon.png`, `/favicon-32x32.png`, `/favicon-16x16.png`
10. **Apple Touch Icon:** `/apple-touch-icon.png` (180×180 iOS होम स्क्रीन)
11. **PWA icons:** `/icon-maskable-512.png`, `/icon-192.png`, `/icon-512.png`
12. **Play Store Feature Graphic 1024×500:** `/playstore-feature-graphic-1024x500.png` (Play Store हेडर ग्राफिक्स)
13. **Splash Screen 2732×2732:** `/splash-2732x2732.png` आणि सर्व Android पोर्ट्रेट/लँडस्केप ड्रॉएबल्स.

सर्व ग्राफिक्स ॲडमिन पॅनलमधील **"🎨 लोगो, आयकॉन्स व ग्राफिक्स"** टॅबमधून थेट एका क्लिकवर डाऊनलोड करता येतात.

