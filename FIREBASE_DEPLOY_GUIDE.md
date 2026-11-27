# 🚀 Firebase Deployment Guide (GitHub Actions व थेट डिप्लॉयमेंट मार्गदर्शक)

हा मार्गदर्शक **Vanjari Jodi** ॲप्लिकेशन GitHub वरून **Firebase Hosting** आणि **Firestore Rules** वर यशस्वीरीत्या डिप्लॉय करण्यासाठी तयार केला आहे.

---

## 🔍 १. GitHub वरून Firebase वर डिप्लॉय का होत नाही? (Root Cause)

जेव्हा तुम्ही GitHub वर कोड पुश करता, तेव्हा GitHub Actions आपोआप `.github/workflows/firebase-hosting-deploy.yml` चालवते.
परंतु GitHub ला तुमच्या Firebase प्रोजेक्टमध्ये (`vanjarijodi`) डिप्लॉय करण्याची **परवानगी (Secret Key)** नसते.
त्यामुळे GitHub Actions मध्ये खालील एरर येते:
> `Error: Secret FIREBASE_SERVICE_ACCOUNT_VANJARIJODI was not found in repository secrets.`

---

## 🛠️ २. GitHub वरून स्वयंचलित (Automatic) डिप्लॉयमेंट कसे सुरू करावे? (२ मिनिटांत)

### पायरी १: Firebase मधून Service Account Key डाऊनलोड करा
1. तुमच्या ब्राउझरमध्ये **Firebase Console** उघडा:
   👉 **[Firebase Console Service Accounts](https://console.firebase.google.com/project/vanjarijodi/settings/serviceaccounts/adminsdk)**
2. **"Firebase Admin SDK"** टॅब खाली **"Generate new private key"** (नवीन प्रायव्हेट की तयार करा) या निळ्या बटनावर क्लिक करा.
3. एक `.json` फाईल तुमच्या कॉम्प्युटरवर डाऊनलोड होईल.

---

### पायरी २: ही Key तुमच्या GitHub Repository मध्ये जोडा
1. तुमच्या GitHub Repository वर जा (उदा. `https://github.com/तुमचे-युझरनेम/तुमचा-रेपो`).
2. वरच्या मेनूमधून **Settings** (⚙️ सेटिंग्ज) वर क्लिक करा.
3. डाव्या बाजूला **Secrets and variables** ➡️ **Actions** वर क्लिक करा.
4. हिरव्या रंगाच्या **"New repository secret"** बटनावर क्लिक करा.
5. खालीलप्रमाणे माहिती भरा:
   - **Name:** `FIREBASE_SERVICE_ACCOUNT_VANJARIJODI`
   - **Secret:** डाऊनलोड झालेल्या `.json` फाईलमधील **सर्व मजकूर (Copy All)** येथे पेस्ट करा.
6. **"Add secret"** वर क्लिक करा.

---

### पायरी ३: डिप्लॉयमेंट सुरू करा (Run Deployment)
- आता तुम्ही GitHub वर कोणताही नवीन बदल पुश केल्यास किंवा **Actions** टॅबमध्ये जाऊन **"Run workflow"** वर क्लिक केल्यास तुमचे ॲप आपोआप Firebase Hosting वर लाइव्ह होईल! 🎉

---

## 💻 ३. पर्याय २: तुमच्या कॉम्प्युटरवरून थेट कमांडद्वारे डिप्लॉय करा (Manual CLI)

जर तुम्हाला GitHub Actions न वापरता थेट तुमच्या टर्मिनलवरून लगेच डिप्लॉय करायचे असेल, तर खालील सोप्या कमांड्स चालवा:

```bash
# १. Firebase मध्ये लॉगिन करा
npx firebase login

# २. प्रोजेक्ट बिल्ड करा
npm run build

# ३. थेट Firebase वर डिप्लॉय करा
npm run deploy
```

फक्त होस्टिंग किंवा फक्त रूल्स डिप्लॉय करण्यासाठी:
```bash
# फक्त वेबसाइट डिप्लॉय करण्यासाठी
npm run deploy:hosting

# फक्त Firestore Rules डिप्लॉय करण्यासाठी
npm run deploy:firestore
```

---

## 🌐 थेट लाइव्ह लिंक (Live URLs)
- **Firebase Hosting URL:** `https://vanjarijodi.web.app` किंवा `https://vanjarijodi.firebaseapp.com`
- **AI Studio Dev Preview:** https://ais-dev-gd3elul22zl4zk3i4alrw5-542294010175.asia-east1.run.app
