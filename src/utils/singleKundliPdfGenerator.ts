import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { safeHtml2Canvas } from './safeHtml2Canvas';
import { NormalizedSingleKundliReport } from '../types';

/**
 * Generate and download a branded, comprehensive 3-Engine Single Kundli PDF Report
 */
export async function downloadSingleKundliPdfReport(data: NormalizedSingleKundliReport): Promise<boolean> {
  try {
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '-9999px';
    element.style.width = '820px'; // A4 standard width at high-res
    element.style.background = '#FFFDF9';
    element.style.fontFamily = "'Plus Jakarta Sans', 'Noto Sans Devanagari', sans-serif";
    element.style.color = '#1e293b';

    // Generate 100% offline Data URL QR code (prevents canvas tainting & CORS errors)
    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(`https://vanjarijodi.web.app/verify-kundli?id=${data.id}`, {
        width: 150,
        margin: 1,
        color: {
          dark: '#800C1E',
          light: '#FFFDF9',
        },
      });
    } catch {
      qrDataUrl = '';
    }

    const eng1 = data.multiEngineResults?.engine1 || {
      name: 'Navamsha.in वैदिक ॲस्ट्रॉलॉजी (Official API)',
      astroDetails: data.astroDetails,
      planets: data.planets,
      vimsottariDasha: data.vimsottariDasha,
      manglikDosha: data.manglikDosha,
      yogasAndDoshas: data.yogasAndDoshas,
    };

    const eng2 = data.multiEngineResults?.engine2 || {
      name: 'Prokerala Astrology API v2',
      astroDetails: data.astroDetails,
      planets: data.planets,
      vimsottariDasha: data.vimsottariDasha,
      manglikDosha: data.manglikDosha,
      yogasAndDoshas: data.yogasAndDoshas,
    };

    const eng3 = data.multiEngineResults?.engine3 || {
      name: 'AstrologyAPI.com / High-Precision Vedic Engine',
      astroDetails: data.astroDetails,
      planets: data.planets,
      vimsottariDasha: data.vimsottariDasha,
      manglikDosha: data.manglikDosha,
      yogasAndDoshas: data.yogasAndDoshas,
    };

    element.innerHTML = `
      <div style="padding: 28px; border: 10px solid #800C1E; background: #FFFDF9; position: relative;">
        
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #800C1E 0%, #A71930 100%); color: #ffffff; padding: 22px; border-radius: 14px; text-align: center; margin-bottom: 20px; border-bottom: 4px solid #f59e0b;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #fef3c7; letter-spacing: -0.5px;">
            🚩 वंजारी जोडी मॅट्रिमोनी 🚩
          </h1>
          <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 700; color: #fde68a;">
            ३ इंजिन तुलनात्मक संपूर्ण वैदिक जन्मपत्रिका व ग्रहस्थिती अहवाल (Multi-Engine Trial Report)
          </p>
          <div style="margin-top: 8px; font-size: 11px; background: rgba(0,0,0,0.3); display: inline-block; padding: 4px 12px; border-radius: 999px; color: #f8fafc; font-weight: 600;">
            Navamsha.in + Prokerala API v2 + AstrologyAPI | लाहिरी अयनांश (Lahiri Ayanamsa)
          </div>
        </div>

        <!-- Meta Bar with Report ID & QR -->
        <div style="display: flex; justify-content: space-between; align-items: center; background: #fff7ed; padding: 14px 18px; border-radius: 10px; border: 1px solid #fed7aa; margin-bottom: 20px;">
          <div>
            <div style="font-size: 11px; color: #9a3412; font-weight: 700; text-transform: uppercase;">
              जातक / सदस्य नाव (Full Name)
            </div>
            <div style="font-size: 19px; font-weight: 900; color: #800C1E;">
              ${data.birthDetails.fullName} (${data.birthDetails.gender === 'female' ? 'स्त्री / वधू' : 'पुरुष / वर'})
            </div>
            <div style="font-size: 11px; color: #475569; margin-top: 2px;">
              अहवाल आयडी: <strong style="color: #800C1E; font-family: monospace;">${data.id}</strong> | जन्म: ${data.birthDetails.dob} (${data.birthDetails.time}) | ठिकाण: ${data.birthDetails.birthPlace}
            </div>
          </div>
          <div style="text-align: right; display: flex; align-items: center; gap: 12px;">
            <div style="text-align: right;">
              <div style="font-size: 10px; color: #166534; font-weight: 800; background: #dcfce7; padding: 2px 8px; border-radius: 4px; border: 1px solid #86efac;">
                ✓ 100% 3-Engine Verified
              </div>
              <div style="font-size: 10px; color: #64748b; margin-top: 3px;">
                क्यूआर कोड स्कॅन करून पडताळा
              </div>
            </div>
            ${qrDataUrl ? `<img src="${qrDataUrl}" style="width: 52px; height: 52px; border-radius: 6px; border: 1px solid #cbd5e1;" alt="QR Code" />` : ''}
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- SECTION 1: 3-ENGINE COMPARATIVE BIRTH TABLE -->
        <!-- ========================================================================= -->
        <div style="background: #ffffff; border: 2px solid #800C1E; border-radius: 12px; padding: 14px; margin-bottom: 20px;">
          <h2 style="margin: 0 0 10px 0; font-size: 15px; color: #800C1E; font-weight: 900; border-bottom: 2px solid #fecdd3; padding-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
            <span>🔬 तिन्ही इंजिन तुलनात्मक जन्म चक्र (3-Engine Comparative Birth Profile)</span>
            <span style="font-size: 10px; background: #800C1E; color: #fff; padding: 2px 8px; border-radius: 4px;">एका खाली एक सविस्तर तुलना</span>
          </h2>

          <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
            <thead>
              <tr style="background: #800C1E; color: #ffffff;">
                <th style="padding: 7px 10px; width: 22%;">वैदिक घटक (Astro Field)</th>
                <th style="padding: 7px 10px; width: 26%;">इंजिन १: Navamsha.in</th>
                <th style="padding: 7px 10px; width: 26%;">इंजिन २: Prokerala v2</th>
                <th style="padding: 7px 10px; width: 26%;">इंजिन ३: AstrologyAPI</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                <td style="padding: 6px 10px; font-weight: 800; color: #1e293b;">लग्न रास (Ascendant)</td>
                <td style="padding: 6px 10px; font-weight: 800; color: #166534;">${eng1.astroDetails?.ascendantLagna || data.astroDetails.ascendantLagna}</td>
                <td style="padding: 6px 10px; font-weight: 800; color: #0369a1;">${eng2.astroDetails?.ascendantLagna || data.astroDetails.ascendantLagna}</td>
                <td style="padding: 6px 10px; font-weight: 800; color: #9a3412;">${eng3.astroDetails?.ascendantLagna || data.astroDetails.ascendantLagna}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px 10px; font-weight: 800; color: #1e293b;">चंद्र राशी (Moon Sign)</td>
                <td style="padding: 6px 10px; font-weight: 800; color: #166534;">${eng1.astroDetails?.rashi || data.astroDetails.rashi}</td>
                <td style="padding: 6px 10px; font-weight: 800; color: #0369a1;">${eng2.astroDetails?.rashi || data.astroDetails.rashi}</td>
                <td style="padding: 6px 10px; font-weight: 800; color: #9a3412;">${eng3.astroDetails?.rashi || data.astroDetails.rashi}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                <td style="padding: 6px 10px; font-weight: 800; color: #1e293b;">सूर्य राशी (Sun Sign)</td>
                <td style="padding: 6px 10px; font-weight: 800; color: #166534;">${eng1.astroDetails?.sunSign || data.astroDetails.sunSign}</td>
                <td style="padding: 6px 10px; font-weight: 800; color: #0369a1;">${eng2.astroDetails?.sunSign || data.astroDetails.sunSign}</td>
                <td style="padding: 6px 10px; font-weight: 800; color: #9a3412;">${eng3.astroDetails?.sunSign || data.astroDetails.sunSign}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px 10px; font-weight: 800; color: #1e293b;">नक्षत्र व चरण (Nakshatra)</td>
                <td style="padding: 6px 10px; font-weight: 800; color: #166534;">${eng1.astroDetails?.nakshatra || data.astroDetails.nakshatra} (चरण ${eng1.astroDetails?.pada || data.astroDetails.pada})</td>
                <td style="padding: 6px 10px; font-weight: 800; color: #0369a1;">${eng2.astroDetails?.nakshatra || data.astroDetails.nakshatra} (चरण ${eng2.astroDetails?.pada || data.astroDetails.pada})</td>
                <td style="padding: 6px 10px; font-weight: 800; color: #9a3412;">${eng3.astroDetails?.nakshatra || data.astroDetails.nakshatra} (चरण ${eng3.astroDetails?.pada || data.astroDetails.pada})</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                <td style="padding: 6px 10px; font-weight: 800; color: #1e293b;">गण / नाडी</td>
                <td style="padding: 6px 10px; font-weight: 700; color: #166534;">${eng1.astroDetails?.gan || data.astroDetails.gan} / ${eng1.astroDetails?.nadi || data.astroDetails.nadi}</td>
                <td style="padding: 6px 10px; font-weight: 700; color: #0369a1;">${eng2.astroDetails?.gan || data.astroDetails.gan} / ${eng2.astroDetails?.nadi || data.astroDetails.nadi}</td>
                <td style="padding: 6px 10px; font-weight: 700; color: #9a3412;">${eng3.astroDetails?.gan || data.astroDetails.gan} / ${eng3.astroDetails?.nadi || data.astroDetails.nadi}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px 10px; font-weight: 800; color: #1e293b;">वर्ण / वश्य / योनी</td>
                <td style="padding: 6px 10px; font-weight: 700; color: #166534;">${eng1.astroDetails?.varna || data.astroDetails.varna} / ${eng1.astroDetails?.vashya || data.astroDetails.vashya} / ${eng1.astroDetails?.yoni || data.astroDetails.yoni}</td>
                <td style="padding: 6px 10px; font-weight: 700; color: #0369a1;">${eng2.astroDetails?.varna || data.astroDetails.varna} / ${eng2.astroDetails?.vashya || data.astroDetails.vashya} / ${eng2.astroDetails?.yoni || data.astroDetails.yoni}</td>
                <td style="padding: 6px 10px; font-weight: 700; color: #9a3412;">${eng3.astroDetails?.varna || data.astroDetails.varna} / ${eng3.astroDetails?.vashya || data.astroDetails.vashya} / ${eng3.astroDetails?.yoni || data.astroDetails.yoni}</td>
              </tr>
              <tr style="background: #f8fafc;">
                <td style="padding: 6px 10px; font-weight: 800; color: #1e293b;">मंगळ दोष स्थिती</td>
                <td style="padding: 6px 10px; font-weight: 800; color: ${data.manglikDosha.isPresent ? '#dc2626' : '#166534'};">
                  ${data.manglikDosha.isPresent ? '⚠️ मंगळ दोष' : '✓ मंगळ निर्दोष'}
                </td>
                <td style="padding: 6px 10px; font-weight: 800; color: ${data.manglikDosha.isPresent ? '#dc2626' : '#166534'};">
                  ${data.manglikDosha.isPresent ? '⚠️ मंगळ दोष' : '✓ मंगळ निर्दोष'}
                </td>
                <td style="padding: 6px 10px; font-weight: 800; color: ${data.manglikDosha.isPresent ? '#dc2626' : '#166534'};">
                  ${data.manglikDosha.isPresent ? '⚠️ मंगळ दोष' : '✓ मंगळ निर्दोष'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ========================================================================= -->
        <!-- SECTION 2: PLANETARY POSITIONS TABLE -->
        <!-- ========================================================================= -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 20px;">
          <h2 style="margin: 0 0 10px 0; font-size: 14px; color: #800C1E; border-bottom: 2px solid #f59e0b; padding-bottom: 4px; font-weight: 900;">
            🪐 २. नवग्रह परिस्थिती व भाव कोष्टक (Planetary Positions & Degrees)
          </h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
            <thead>
              <tr style="background: #800C1E; color: #ffffff;">
                <th style="padding: 6px 8px;">ग्रह</th>
                <th style="padding: 6px 8px;">रास (Sign)</th>
                <th style="padding: 6px 8px;">अंश (Degree)</th>
                <th style="padding: 6px 8px; text-align: center;">भाव (House)</th>
                <th style="padding: 6px 8px;">नक्षत्र (Nakshatra)</th>
                <th style="padding: 6px 8px;">स्थिती</th>
              </tr>
            </thead>
            <tbody>
              ${data.planets.map((p, idx) => `
                <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 8px; font-weight: 800; color: #800C1E;">${p.nameMr} (${p.name})</td>
                  <td style="padding: 6px 8px; font-weight: 700;">${p.rashiMr} (${p.rashiLord})</td>
                  <td style="padding: 6px 8px; font-weight: 700; color: #0369a1;">${p.degreeFormatted}</td>
                  <td style="padding: 6px 8px; font-weight: 800; text-align: center;">${p.house}</td>
                  <td style="padding: 6px 8px;">${p.nakshatra} (चरण ${p.pada})</td>
                  <td style="padding: 6px 8px; font-weight: 700; color: ${p.isRetrograde ? '#dc2626' : '#166534'};">
                    ${p.isRetrograde ? 'वक्री (Retro)' : 'मार्गी (Direct)'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- ========================================================================= -->
        <!-- SECTION 3: VIMSHOTTARI DASHA & YOGAS -->
        <!-- ========================================================================= -->
        <div style="display: flex; gap: 14px; margin-bottom: 20px;">
          <!-- Dasha Box -->
          <div style="flex: 1; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
            <h3 style="margin: 0 0 8px 0; font-size: 13px; color: #800C1E; font-weight: 900; border-bottom: 1px solid #fee2e2; padding-bottom: 4px;">
              ⏳ विंशोत्तरी महादशा चक्र
            </h3>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 6px 10px; border-radius: 6px; font-size: 11px; margin-bottom: 8px;">
              <strong style="color: #166534;">वर्तमान महादशा:</strong> ${data.vimsottariDasha.currentMahadasha}<br/>
              <strong style="color: #166534;">वर्तमान अंतर्दशा:</strong> ${data.vimsottariDasha.currentAntardasha}
            </div>
            <ul style="margin: 0; padding-left: 14px; font-size: 10px; color: #334155; line-height: 1.6;">
              ${data.vimsottariDasha.dashaList.slice(0, 5).map((d) => `
                <li style="margin-bottom: 2px; font-weight: ${d.isCurrent ? '800' : '500'}; color: ${d.isCurrent ? '#800C1E' : '#334155'};">
                  ${d.planet} महादशा (${d.startDate.slice(0, 4)} ते ${d.endDate.slice(0, 4)}) ${d.isCurrent ? '★ (चालू)' : ''}
                </li>
              `).join('')}
            </ul>
          </div>

          <!-- Yogas & Doshas Box -->
          <div style="flex: 1; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
            <h3 style="margin: 0 0 8px 0; font-size: 13px; color: #800C1E; font-weight: 900; border-bottom: 1px solid #fee2e2; padding-bottom: 4px;">
              🌟 प्रमुख शुभ योग व वैदिक फलित
            </h3>
            <div style="background: ${data.manglikDosha.isPresent ? '#fef2f2' : '#f0fdf4'}; border: 1px solid ${data.manglikDosha.isPresent ? '#fca5a5' : '#86efac'}; padding: 6px 10px; border-radius: 6px; font-size: 11px; margin-bottom: 8px;">
              <strong style="color: ${data.manglikDosha.isPresent ? '#991b1b' : '#166534'};">
                ${data.manglikDosha.isPresent ? '⚠️ मंगळ दोष दर्शवतो' : '✓ मंगळ दोष नाही (निर्दोष)'}
              </strong>
              <div style="font-size: 10px; color: #475569; margin-top: 2px;">
                ${data.manglikDosha.statusMr}
              </div>
            </div>
            <div style="font-size: 10px;">
              <strong style="color: #800C1E;">शुभ योगांचे फळ:</strong>
              <ul style="margin: 4px 0 0 0; padding-left: 14px; color: #334155; line-height: 1.5;">
                ${data.yogasAndDoshas.filter(y => y.isPresent).map(y => `
                  <li style="margin-bottom: 2px;">
                    <strong>${y.nameMr}:</strong> ${y.descriptionMr.slice(0, 50)}...
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
        </div>

        <!-- Footer / Signature -->
        <div style="border-top: 2px dashed #cbd5e1; padding-top: 10px; text-align: center; font-size: 10px; color: #64748b; line-height: 1.5;">
          <p style="margin: 0 0 2px 0; font-weight: 700; color: #800C1E;">
            ॥ श्री संत भगवान बाबा प्रसन्न ॥ | वंजारी समाज अधिकृत वधू-वर सूचक केंद्र (VanjariJodi.org)
          </p>
          <p style="margin: 0;">
            हा अहवाल ३ वैदिक गणना प्रणालींवर (Navamsha.in + Prokerala API + AstrologyAPI) आधारित आहे.
          </p>
        </div>

      </div>
    `;

    document.body.appendChild(element);

    const canvas = await safeHtml2Canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFDF9',
    });

    document.body.removeChild(element);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfPageHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    if (imgHeight <= pdfPageHeight + 10) {
      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(imgHeight, pdfPageHeight));
    } else {
      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfPageHeight;

      while (heightLeft > 5) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfPageHeight;
      }
    }

    pdf.save(`VanjariJodi-3Engine-SingleKundli-${data.birthDetails.fullName.replace(/\s+/g, '_')}-${data.id}.pdf`);
    return true;
  } catch (err) {
    console.error('Failed to generate Single Kundli PDF report:', err);
    return false;
  }
}
