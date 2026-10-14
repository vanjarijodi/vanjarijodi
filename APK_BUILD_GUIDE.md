# 📱 Vanjari Jodi — Google Play Store (.AAB) आणि Direct Mobile (.APK) संपूर्ण मार्गदर्शक

या प्रोजेक्टमध्ये **Google Play Store Update** साठी आवश्यक असलेली `.aab` फाईल, **सायंनिंग की (Release Keystore)**, आणि **Java 17 LTS** कॉन्फिगरेशन १००% योग्यरित्या सेट केले आहे.

---

## 🎯 १. गुगल प्ले स्टोअर आणि डायरेक्ट इन्स्टॉलसाठी काय मिळते?

GitHub Actions द्वारे बिल्ड पूर्ण झाल्यावर तुम्हाला **३ महत्त्वाच्या गोष्टी** मिळतात:

| फाईल | नाव | कशासाठी वापरावी? |
| :--- | :--- | :--- |
| **१. Play Store AAB Bundle** | `VanjariJodi-release.aab` | **Google Play Console** वर नवीन अपडेट किंवा रिलीज सबमिट करण्यासाठी. (गुगल प्ले स्टोअर फक्त `.aab` स्वीकारते). |
| **२. Direct Universal APK** | `VanjariJodi.apk` | कोणत्याही ॲन्ड्रॉइड मोबाईलमध्ये थेट इन्स्टॉल करून टेस्ट करण्यासाठी. |
| **३. Play Store Signing Keystore** | `release.keystore` + `KEYSTORE_INFO.txt` | ॲप सायंनिंग की ची बॅकअप फाईल. भविष्यात प्रत्येक प्ले स्टोअर अपडेटसाठी हीच की लागते. |

---

## 🔑 २. प्ले स्टोअर सायंनिंग की (Keystore) माहिती:

गुगल प्ले स्टोअरवर जुने ॲप **अपडेट** करताना डिजिटल सही (Signing Key) मॅच होणे बंधनकारक असते.

- **Keystore File:** `release.keystore`
- **Key Alias:** `vanjarijodi`
- **Store Password:** `vanjari123`
- **Key Password:** `vanjari123`
- **Validity:** 10,000 दिवस (२५+ वर्षे)
- **Algorithm:** RSA 2048-bit (Google Play मानकांनुसार)

> 💡 **जर तुमच्याकडे आधीच्या प्ले स्टोअर रिलीजची जुनी Keystore असेल तर:**
> 1. तुमच्या कॉम्प्युटरवर टर्मिनल उघडून की चे Base64 रूपांतर करा:
>    ```bash
>    base64 -w 0 your-old-key.keystore
>    ```
> 2. GitHub Repo च्या **Settings ➔ Secrets and variables ➔ Actions ➔ New repository secret** मध्ये जा.
> 3. Secret चे नाव `KEYSTORE_BASE64` द्या आणि वरील कॉपी केलेली व्हॅल्यू पेस्ट करा.
> 4. `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD` चे सिक्रेट्स जोडा. GitHub Actions आपोआप तुमच्या जुन्याच की ने ॲप साईन करेल!

---

## ☕ ३. Java Version आणि SDK सुसंगतता (Java 17 LTS):

- **Java Version:** **Java 17 LTS (Eclipse Temurin)**
- **Android Gradle Plugin (AGP):** `8.7.2`
- **Gradle Version:** `8.9`
- **Compile SDK / Target SDK:** `Android 35 (Android 15)`
- **Min SDK:** `24 (Android 7.0+)`

हे कॉन्फिगरेशन गुगल प्ले स्टोअरच्या २०२६ मधील सर्व आधुनिक नियमांशी (Android 15 / API 35) १००% सुसंगत आहे.

---

## 📦 ४. गिटहबवरून AAB आणि APK कसे डाउनलोड करावे?

1. तुमच्या GitHub रिपॉझिटरीमध्ये जा (उदा. `https://github.com/username/repo`).
2. वरील मेनूमध्ये **"Actions"** या टॅबवर क्लिक करा.
3. तिथे सर्वात वर दिसणाऱ्या **"Build Android App (Play Store AAB & APK)"** रनवर क्लिक करा.
4. खाली स्क्रोल करा:
   - **Play Store साठी:** `VanjariJodi-PlayStore-AAB` वर क्लिक करून `VanjariJodi-release.aab` फाईल मिळवा.
   - **मोबाईल टेस्टसाठी:** `VanjariJodi-Android-APK` वर क्लिक करून `VanjariJodi.apk` मिळवा.
   - **की सुरक्षित ठेवण्यासाठी:** `VanjariJodi-Signing-Keystore` वर क्लिक करून बॅकअप डाउनलोड करा.

---

## 🚀 ५. गुगल प्ले कन्सोलवर नवीन व्हर्जन कसे अपडेट करावे?

1. **Google Play Console** (`play.google.com/console`) उघडा.
2. तुमच्या **Vanjari Jodi** ॲपवर क्लिक करा.
3. डाव्या मेनूमधून **Production** (किंवा **Testing**) ➔ **Create new release** वर क्लिक करा.
4. **App bundles** सेक्शनमध्ये डाउनलोड केलेली **`VanjariJodi-release.aab`** फाईल ड्रॅग & ड्रॉप करा.
5. Release Name (उदा. `1.1`) आणि Release notes लिहा.
6. **Save** करा आणि **Review and rollout release** वर क्लिक करा. नवीन अपडेट प्ले स्टोअरवर रिव्ह्यूसाठी जाईल!

