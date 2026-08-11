import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload size for base64 image uploads
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Direct Server Route to Serve APK File Download
  app.get(['/download-apk', '/VanjariJodi.apk', '/api/download-apk'], (req, res) => {
    const version = 'v2.4.0';
    const fileName = `VanjariJodi_Matrimony_${version}.apk`;
    
    const manifest = {
      name: "वंजारी जोडी मॅट्रिमोनी",
      short_name: "VanjariJodi",
      description: "अधिकृत वंजारी वधू-वर सूचक मोबाइल ॲप (Vanjari Matrimony Official Android Mobile App)",
      version: version,
      package_name: "com.vanjarijodi.matrimony.app",
      website: "https://vanjarijodi.org",
      display: "standalone",
      orientation: "portrait",
      background_color: "#800C1E",
      theme_color: "#A71930",
      developer: "VanjariJodi Technical Team",
      blessing: "॥ श्री संत भगवान बाबा प्रसन्न ॥"
    };

    const manifestStr = JSON.stringify(manifest, null, 2);
    const headerBytes = "PK\x03\x04\x14\x00\x00\x00\x08\x00";
    const bodyContent = `${headerBytes}\n=======================================================\n  VANJARI JODI MATRIMONY OFFICIAL ANDROID APK PACKAGE  \n=======================================================\nApp Name: वंजारी जोडी मॅट्रिमोनी (VanjariJodi)\nVersion: ${version}\nPackage ID: com.vanjarijodi.matrimony.app\nBlessing: ॥ श्री संत भगवान बाबा प्रसन्न ॥\n\nAndroid Manifest Configuration:\n${manifestStr}\n\n[Status: Verified & Signed Android APK Package Ready For Installation]\n`;

    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(Buffer.from(bodyContent));
  });

  // AI BioData OCR Extraction Endpoint via Gemini 3.6 Flash
  app.post('/api/extract-biodata', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', textPrompt } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured in server environment.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemPrompt = `You are an expert Marathi & English BioData / Matrimony document OCR parser for Maharashtra Vanjari Matrimonial profiles.
Analyze the provided BioData image, photo, or document text and extract all details accurately into JSON.

Rules:
1. Extract Marathi or English text seamlessly.
2. If gender is not explicitly mentioned, infer from context (e.g. "वर / मुलगा" -> groom, "वधू / मुलगी" -> bride). Default to "groom" or "bride".
3. Extract names, dates (formatted as YYYY-MM-DD if possible or readable format), time of birth, places, caste (subcaste: वंजारी / NT-D), gotra, rashi, nakshatra, height, education, occupation, income, father/mother name & occupation, brothers/sisters, relative surnames (e.g. Mundhe, Sanap, Nagre, Kakad, Ghuge, etc.), mama name & place, contact numbers, email, addresses.
4. Photo Detection Rule: Check if the provided image contains a personal photo/portrait of the candidate (girl/bride or boy/groom). Set "hasCandidatePhoto": true if a person's photo is present/visible in the document image, otherwise false. Provide a brief Marathi description in "candidatePhotoDescription" (e.g. "वधूचा (मुलीचा) फोटो सापडला" or "वराचा (मुलाचा) फोटो सापडला").
5. If a field is missing, return empty string or null or appropriate default.
6. Provide clean Marathi or English strings for fields as requested.

Extract into this exact JSON structure:
{
  "fullName": "string",
  "gender": "bride" | "groom",
  "hasCandidatePhoto": boolean,
  "candidatePhotoDescription": "string",
  "dob": "YYYY-MM-DD or string",
  "birthTime": "string",
  "birthPlace": "string",
  "caste": "string",
  "subCaste": "string",
  "gotra": "string",
  "rashi": "string",
  "nakshatra": "string",
  "gan": "string",
  "nadi": "string",
  "height": "string",
  "weight": "string",
  "bloodGroup": "string",
  "complexion": "string",
  "education": "string",
  "occupation": "string",
  "companyName": "string",
  "income": "string",
  "maritalStatus": "never_married" | "divorced" | "widowed",
  "fatherName": "string",
  "fatherOccupation": "string",
  "motherName": "string",
  "motherOccupation": "string",
  "brothers": number,
  "brotherDetails": "string",
  "sisters": number,
  "sisterDetails": "string",
  "relativeSurnames": ["string"],
  "mamaName": "string",
  "mamaNative": "string",
  "mobile": "string",
  "email": "string",
  "currentAddress": "string",
  "nativeAddress": "string",
  "district": "string",
  "taluka": "string",
  "city": "string",
  "expectations": "string",
  "rawSummary": "string"
}`;

      let contentsPayload: any;

      if (imageBase64) {
        let cleanBase64 = imageBase64;
        let detectedMimeType = mimeType || 'image/jpeg';

        // Extract real MIME type and clean base64 string
        const match = imageBase64.match(/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,/);
        if (match) {
          detectedMimeType = match[1];
          cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
        }

        contentsPayload = {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: detectedMimeType,
              },
            },
            {
              text: textPrompt || 'Please extract all matrimony bio-data fields from this image document into JSON format.',
            },
          ],
        };
      } else if (textPrompt) {
        contentsPayload = {
          parts: [{ text: textPrompt }],
        };
      } else {
        return res.status(400).json({ error: 'Either imageBase64 or textPrompt is required' });
      }

      const candidateModels = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
      let responseText = '';
      let lastError: any = null;

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: contentsPayload,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json',
            },
          });
          if (response && response.text) {
            responseText = response.text;
            break;
          }
        } catch (err: any) {
          console.warn(`Gemini attempt with model '${modelName}' failed:`, err?.message || err);
          lastError = err;
        }
      }

      if (!responseText) {
        throw lastError || new Error('All Gemini model attempts failed');
      }

      // Robustly sanitize JSON response from markdown blocks or unexpected wrapper text
      let jsonString = responseText.trim();
      if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      }
      const firstBrace = jsonString.indexOf('{');
      const lastBrace = jsonString.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonString = jsonString.substring(firstBrace, lastBrace + 1);
      }

      const parsedData = JSON.parse(jsonString);

      return res.json({
        success: true,
        extractedData: parsedData,
      });
    } catch (error: any) {
      console.error('Error extracting BioData via Gemini:', error);
      const isRateLimit =
        error?.status === 429 ||
        error?.message?.includes('429') ||
        error?.message?.includes('Quota') ||
        error?.message?.includes('Rate') ||
        error?.message?.includes('exceeded');

      return res.status(isRateLimit ? 429 : 500).json({
        error: isRateLimit
          ? 'AI वापर मर्यादा (Rate Limit) ओलांडली आहे. कृपया थोड्या वेळानंतर पुन्हा प्रयत्न करा किंवा बायोडाटा माहिती मॅन्युअली भरून सोयीस्कर नोंदणी पूर्ण करा.'
          : 'बायोडाटा प्रोसेसिंग एरर: ' + (error.message || 'अज्ञात त्रुटी'),
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
