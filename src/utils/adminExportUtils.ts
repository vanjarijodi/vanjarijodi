import JSZip from 'jszip';
import jsPDF from 'jspdf';
import { UserProfile } from '../types';
import { safeHtml2Canvas } from './safeHtml2Canvas';
import { formatMemberId } from './idUtils';

/**
 * Watermarks a member photo with their Name, ID, and District in the corner,
 * returning a JPEG Blob suitable for archiving in a ZIP file.
 */
async function watermarkMemberPhoto(
  imageUrl: string,
  memberName: string,
  memberId: string,
  district: string
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let width = img.naturalWidth || img.width || 800;
        let height = img.naturalHeight || img.height || 800;

        // Scale down if image is huge to optimize zip generation speed and size
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        // Draw original photo
        ctx.drawImage(img, 0, 0, width, height);

        // Watermark Banner at the bottom
        const bannerHeight = Math.max(48, Math.round(height * 0.08));
        const fontSize = Math.max(14, Math.round(bannerHeight * 0.38));

        // Dark gradient overlay in the bottom corner
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, height - bannerHeight, width, bannerHeight);

        // Gold top line on the watermark banner
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(0, height - bannerHeight, width, Math.max(2, Math.round(bannerHeight * 0.06)));

        // Text branding
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'middle';

        const labelText = `${memberName || 'सदस्य'} | ID: ${memberId || 'VJ'} | ${district || 'महाराष्ट्र'}`;
        ctx.fillText(labelText, 16, height - bannerHeight / 2);

        // Right side tag
        ctx.font = `bold ${Math.max(11, Math.round(fontSize * 0.75))}px sans-serif`;
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'right';
        ctx.fillText('वंजारी जोडी (Vanjari Jodi)', width - 16, height - bannerHeight / 2);

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          'image/jpeg',
          0.88
        );
      } catch (err) {
        console.warn('Canvas watermarking error:', err);
        resolve(null);
      }
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = imageUrl;
  });
}

/**
 * Downloads all member photos in a single ZIP file, watermarked with member names.
 */
export async function downloadAllMemberPhotosZip(
  members: UserProfile[],
  onProgress?: (current: number, total: number, currentName: string) => void
): Promise<{ success: boolean; totalExported: number; error?: string }> {
  try {
    const zip = new JSZip();
    const photoProfiles = members.filter(
      (m) => (m.photos && m.photos.length > 0) || m.photoUrl
    );

    if (photoProfiles.length === 0) {
      return { success: false, totalExported: 0, error: 'कोणत्याही सदस्याचा फोटो उपलब्ध नाही.' };
    }

    let processedCount = 0;
    const totalPhotos = photoProfiles.length;

    for (let i = 0; i < photoProfiles.length; i++) {
      const p = photoProfiles[i];
      const photoUrl = (p.photos && p.photos[0]) || p.photoUrl || '';
      if (!photoUrl) continue;

      onProgress?.(i + 1, totalPhotos, p.fullName || p.id);

      try {
        const blob = await watermarkMemberPhoto(
          photoUrl,
          p.fullName || 'Member',
          p.id,
          p.district || p.city || 'Maharashtra'
        );

        if (blob) {
          const safeName = (p.fullName || 'Member')
            .replace(/[/\\?%*:|"<>]/g, '_')
            .trim();
          const fileName = `${p.id}_${safeName}.jpg`;
          zip.file(fileName, blob);
          processedCount++;
        }
      } catch (itemErr) {
        console.warn(`Failed to process photo for ${p.id}:`, itemErr);
      }
    }

    if (processedCount === 0) {
      return { success: false, totalExported: 0, error: 'फोटो प्रोसेस करताना त्रुटी आली.' };
    }

    const zipContent = await zip.generateAsync({ type: 'blob' });
    const dateStr = new Date().toISOString().split('T')[0];
    const downloadUrl = URL.createObjectURL(zipContent);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `Vanjari_Jodi_Member_Photos_${dateStr}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);

    return { success: true, totalExported: processedCount };
  } catch (err: any) {
    console.error('Error generating photo zip:', err);
    return { success: false, totalExported: 0, error: err.message || 'झिप फाईल बनवता आली नाही.' };
  }
}

/**
 * Helper to escape HTML characters
 */
function escapeHtml(str?: string | number | null): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates an authentic, high-resolution PDF directory for members
 * with 100% crystal-clear Marathi typography using Noto Sans Devanagari.
 * Arranges 5 profiles per A4 page cleanly with zero broken glyphs.
 */
export async function generateCompactMembersPdf(
  members: UserProfile[],
  filterTitle: string = 'सर्व सदस्य यादी'
): Promise<void> {
  if (!members || members.length === 0) {
    alert('यादीमध्ये कोणताही सदस्य उपलब्ध नाही.');
    return;
  }

  const itemsPerPage = 5;
  const totalPages = Math.ceil(members.length / itemsPerPage);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const dateFormatted = new Date().toLocaleDateString('mr-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Render page by page to guarantee zero cross-page cuts and 100% Marathi font clarity
  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const pageMembers = members.slice(pageIdx * itemsPerPage, (pageIdx + 1) * itemsPerPage);

    // Build Page Container Element
    const pageContainer = document.createElement('div');
    pageContainer.className = 'pdf-render-page';
    pageContainer.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: 794px;
      height: 1122px;
      background: #ffffff;
      padding: 24px;
      box-sizing: border-box;
      font-family: 'Noto Sans Devanagari', 'Mukta', 'Baloo 2', 'Tiro Devanagari Marathi', sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      color: #0f172a;
      z-index: -9999;
      opacity: 0.01;
      pointer-events: none;
    `;

    // Construct Page HTML
    let memberCardsHtml = '';
    for (let i = 0; i < pageMembers.length; i++) {
      const m = pageMembers[i];
      const isPaid = m.membership && m.membership !== 'free' && m.membership !== 'guest';
      const mAny = m as any;
      const photoUrl = (m.photos && m.photos[0]) || m.photoUrl;
      const cleanId = formatMemberId(m.id);

      memberCardsHtml += `
        <div style="border: 1.5px solid #e2e8f0; border-left: 6px solid ${isPaid ? '#10b981' : '#f59e0b'}; border-radius: 12px; padding: 10px 14px; background: #fafafa; display: flex; gap: 14px; align-items: flex-start; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <!-- Photo Thumbnail -->
          <div style="width: 72px; height: 86px; border-radius: 10px; overflow: hidden; border: 1.5px solid #cbd5e1; background: #f1f5f9; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900; color: #800C1E;">
            ${
              photoUrl
                ? `<img src="${escapeHtml(photoUrl)}" crossorigin="anonymous" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'" />`
                : `<span>${escapeHtml((m.fullName || 'स').charAt(0))}</span>`
            }
          </div>

          <!-- Member Details -->
          <div style="flex: 1; min-width: 0;">
            <!-- Name & Status Row -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span style="font-size: 14.5px; font-weight: 900; color: #0f172a;">
                  ${escapeHtml(m.fullName || 'नाव नोंद नाही')}
                </span>
                <span style="font-size: 11px; font-weight: 800; background: #800C1E; color: #ffffff; padding: 1px 8px; border-radius: 6px; font-family: monospace;">
                  ${escapeHtml(cleanId)}
                </span>
                <span style="font-size: 11px; font-weight: 800; color: #64748b;">
                  (${m.gender === 'bride' ? 'वधू' : 'वर'})
                </span>
              </div>

              <div style="font-size: 11px; font-weight: 800; padding: 2px 10px; border-radius: 8px; ${
                isPaid
                  ? 'background: #dcfce7; color: #15803d; border: 1px solid #86efac;'
                  : 'background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5;'
              }">
                ${isPaid ? `✅ शुल्क भरलेले (${escapeHtml((m.membership || 'वार्षिक').toUpperCase())})` : '⏳ शुल्क बाकी (Free)'}
              </div>
            </div>

            <!-- Two-Column Information Table -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; font-size: 11px; color: #334155; line-height: 1.45;">
              <div><strong>🎂 जन्मदिनांक:</strong> ${escapeHtml(m.dob || mAny.birthDate || '-')} ${m.age ? `(${m.age} वर्षे)` : ''}</div>
              <div><strong>📏 उंची:</strong> ${escapeHtml(m.height || '-')} | <strong>पोटजात:</strong> ${escapeHtml(m.subCaste || 'वंजारी')}</div>
              <div><strong>🎓 शिक्षण:</strong> ${escapeHtml(m.education || '-')}</div>
              <div><strong>💼 नोकरी/व्यवसाय:</strong> ${escapeHtml(m.occupation || mAny.job || '-')}</div>
              <div><strong>📍 जिल्हा:</strong> ${escapeHtml(m.district || '-')} ${m.city ? `(${escapeHtml(m.city)})` : ''}</div>
              <div><strong>🏡 मूळ गाव/तालुका:</strong> ${escapeHtml(mAny.nativePlace || m.taluka || '-')}</div>
              <div><strong>🌟 गोत्र/राशी:</strong> ${escapeHtml(m.gotra || '-')} / ${escapeHtml(m.rashi || '-')} ${mAny.mangal ? `(मंगळ: ${escapeHtml(mAny.mangal)})` : ''}</div>
              <div><strong>📞 मोबाईल:</strong> <span style="font-weight: 800; color: #0f172a; font-family: monospace;">${escapeHtml(m.mobile || mAny.mobileNumber || '-')}</span></div>
              <div style="grid-column: span 2; color: #475569; font-size: 10.5px; border-top: 1px dashed #e2e8f0; margin-top: 3px; padding-top: 3px;">
                <strong>वडिलांचे नाव:</strong> ${escapeHtml(m.fatherName || mAny.fatherOcc || '-')} | <strong>मामा:</strong> ${escapeHtml(m.mamaName || mAny.mamaSurname || '-')}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    pageContainer.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&display=swap');
      </style>

      <!-- Page Top Header -->
      <div style="background: linear-gradient(135deg, #800C1E 0%, #A71930 100%); border-radius: 12px; padding: 10px 18px; color: white; display: flex; justify-content: space-between; align-items: center; border-bottom: 3.5px solid #f59e0b; margin-bottom: 12px;">
        <div>
          <div style="font-size: 16px; font-weight: 900; color: #fef08a; letter-spacing: 0.5px;">
            वंजारी जोडी वधू-वर सूचक केंद्र (Vanjari Jodi Matrimony)
          </div>
          <div style="font-size: 11.5px; font-weight: 700; color: #ffffff; margin-top: 2px;">
            📋 ${escapeHtml(filterTitle)} • एकूण सदस्य संख्या: ${members.length} • दिनांक: ${dateFormatted}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="background: rgba(0,0,0,0.35); padding: 5px 12px; border-radius: 8px; border: 1px solid rgba(254, 240, 138, 0.4); font-size: 11px; font-weight: 800; color: #fef08a;">
            पान ${pageIdx + 1} / ${totalPages}
          </div>
        </div>
      </div>

      <!-- Member Cards Container -->
      <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
        ${memberCardsHtml}
      </div>

      <!-- Page Bottom Footer -->
      <div style="border-top: 1.5px solid #cbd5e1; padding-top: 7px; display: flex; justify-content: space-between; font-size: 10.5px; color: #64748b; font-weight: 700;">
        <div>॥ श्री संत भगवान बाबा प्रसन्न ॥ • वंजारी जोडी अधिकृत मोबाईल ॲप अहवाल</div>
        <div>📲 गूगल प्ले स्टोअरवर 'वंजारी जोडी' (Vanjari Jodi) ॲप शोधून डाऊनलोड करा</div>
      </div>
    `;

    document.body.appendChild(pageContainer);

    // Wait for fonts and layout to settle completely
    if (document.fonts) {
      await document.fonts.ready;
    }
    await new Promise((r) => setTimeout(r, 120));

    try {
      const canvas = await safeHtml2Canvas(pageContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      if (pageIdx > 0) {
        pdf.addPage();
      }
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    } finally {
      document.body.removeChild(pageContainer);
    }
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const cleanTitle = filterTitle.replace(/[/\\?%*:|"<>]/g, '_').trim();
  pdf.save(`Vanjari_Jodi_${cleanTitle}_${dateStr}.pdf`);
}
