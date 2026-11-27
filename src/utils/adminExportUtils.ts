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
 * Unified helper to determine whether a member profile is Paid, Free-Granted by Admin, or Unpaid.
 */
export function getMemberPaymentStatusInfo(m: UserProfile): {
  category: 'paid' | 'free_granted' | 'unpaid';
  isPaidOrActive: boolean;
  isPaid: boolean;
  isFreeGranted: boolean;
  isUnpaid: boolean;
  planLabel: string;
  badgeTextMr: string;
} {
  const mAny = m as any;
  const isFreeGranted = Boolean(m.isFreeAdminPlan || mAny.isFreeGranted);
  const rawTier = String(m.membership || m.membershipTier || '').toLowerCase().trim();
  const hasTier = Boolean(rawTier && rawTier !== 'free' && rawTier !== 'guest' && rawTier !== 'none');
  const isPaid =
    !isFreeGranted &&
    Boolean(
      m.hasPaidMembership ||
        m.isPremium ||
        hasTier ||
        m.paidAt ||
        m.paymentApprovedAt ||
        (m.paymentAmount && Number(m.paymentAmount) > 0)
    );

  const planLabel =
    m.paymentPlanName ||
    m.membershipPlanName ||
    m.membershipPlan ||
    (hasTier ? rawTier.toUpperCase() : isPaid ? 'PAID VIP' : 'FREE');

  if (isFreeGranted) {
    return {
      category: 'free_granted',
      isPaidOrActive: true,
      isPaid: false,
      isFreeGranted: true,
      isUnpaid: false,
      planLabel,
      badgeTextMr: `🎁 मोफत VIP (${planLabel})`,
    };
  }

  if (isPaid) {
    return {
      category: 'paid',
      isPaidOrActive: true,
      isPaid: true,
      isFreeGranted: false,
      isUnpaid: false,
      planLabel,
      badgeTextMr: `💎 पेड मेंबर (${planLabel})`,
    };
  }

  return {
    category: 'unpaid',
    isPaidOrActive: false,
    isPaid: false,
    isFreeGranted: false,
    isUnpaid: true,
    planLabel: 'मोफत (Unpaid)',
    badgeTextMr: '⏳ अनपेड (शुल्क बाकी)',
  };
}

/**
 * Converts an image URL to a safe Base64 Data URL with a timeout so html2canvas never hangs or taints.
 */
async function resolveSafePhotoDataUrl(url?: string): Promise<string | null> {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('data:image/')) return url;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (val: string | null) => {
      if (!settled) {
        settled = true;
        resolve(val);
      }
    };

    const timer = setTimeout(() => finish(null), 1800);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 190;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          finish(null);
          return;
        }
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        finish(canvas.toDataURL('image/jpeg', 0.85));
      } catch {
        finish(null);
      }
    };
    img.onerror = () => {
      clearTimeout(timer);
      finish(null);
    };
    img.src = url;
  });
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

  const paidCount = members.filter((m) => getMemberPaymentStatusInfo(m).isPaid).length;
  const freeGrantedCount = members.filter((m) => getMemberPaymentStatusInfo(m).isFreeGranted).length;
  const unpaidCount = members.filter((m) => getMemberPaymentStatusInfo(m).isUnpaid).length;

  // Render page by page to guarantee zero cross-page cuts and 100% Marathi font clarity
  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const pageMembers = members.slice(pageIdx * itemsPerPage, (pageIdx + 1) * itemsPerPage);

    // Preload safe Base64 thumbnails for the 5 members on this page
    const safePhotos = await Promise.all(
      pageMembers.map((m) => resolveSafePhotoDataUrl((m.photos && m.photos[0]) || m.photoUrl))
    );

    // Build Page Container Element (MUST have opacity: 1 for html2canvas!)
    const pageContainer = document.createElement('div');
    pageContainer.className = 'pdf-render-page';
    pageContainer.style.cssText = `
      position: fixed;
      left: -10000px;
      top: 0;
      width: 794px;
      height: 1122px;
      background: #ffffff;
      padding: 22px 24px;
      box-sizing: border-box;
      font-family: 'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      color: #0f172a;
      z-index: 9999;
      opacity: 1;
      visibility: visible;
      pointer-events: none;
    `;

    // Construct Page HTML
    let memberCardsHtml = '';
    for (let i = 0; i < pageMembers.length; i++) {
      const m = pageMembers[i];
      const statusInfo = getMemberPaymentStatusInfo(m);
      const mAny = m as any;
      const safePhoto = safePhotos[i];
      const cleanId = formatMemberId(m.id);
      const globalIndex = pageIdx * itemsPerPage + i + 1;
      const borderColor = statusInfo.isPaid
        ? '#10b981'
        : statusInfo.isFreeGranted
        ? '#f59e0b'
        : '#ef4444';

      memberCardsHtml += `
        <div style="border: 1.5px solid #cbd5e1; border-left: 6px solid ${borderColor}; border-radius: 12px; padding: 10px 14px; background: #ffffff; display: flex; gap: 14px; align-items: flex-start;">
          <!-- Photo Thumbnail -->
          <div style="width: 72px; height: 86px; border-radius: 10px; overflow: hidden; border: 1.5px solid #cbd5e1; background: #fff1f2; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 22px; font-weight: 900; color: #800C1E;">
            ${
              safePhoto
                ? `<img src="${safePhoto}" style="width: 100%; height: 100%; object-fit: cover;" />`
                : `<span>${escapeHtml((m.fullName || 'स').charAt(0))}</span><span style="font-size: 9px; color: #64748b; margin-top: 2px;">${m.gender === 'bride' ? 'वधू' : 'वर'}</span>`
            }
          </div>

          <!-- Member Details -->
          <div style="flex: 1; min-width: 0;">
            <!-- Name & Status Row -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span style="font-size: 11px; font-weight: 900; background: #f1f5f9; color: #334155; padding: 1px 6px; border-radius: 5px; border: 1px solid #cbd5e1;">
                  #${globalIndex}
                </span>
                <span style="font-size: 14.5px; font-weight: 900; color: #0f172a;">
                  ${escapeHtml(m.fullName || 'नाव नोंद नाही')}
                </span>
                <span style="font-size: 11px; font-weight: 800; background: #800C1E; color: #ffffff; padding: 1px 8px; border-radius: 6px; font-family: monospace;">
                  ${escapeHtml(cleanId)}
                </span>
                <span style="font-size: 11px; font-weight: 800; color: ${m.gender === 'bride' ? '#be123c' : '#1d4ed8'};">
                  (${m.gender === 'bride' ? '👰 वधू' : '🤵 वर'})
                </span>
              </div>

              <div style="font-size: 10.5px; font-weight: 800; padding: 2px 9px; border-radius: 8px; white-space: nowrap; ${
                statusInfo.isPaid
                  ? 'background: #dcfce7; color: #15803d; border: 1px solid #86efac;'
                  : statusInfo.isFreeGranted
                  ? 'background: #fef3c7; color: #92400e; border: 1px solid #fcd34d;'
                  : 'background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5;'
              }">
                ${escapeHtml(statusInfo.badgeTextMr)}
              </div>
            </div>

            <!-- Two-Column Information Table -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; font-size: 11px; color: #1e293b; line-height: 1.42;">
              <div><strong>🎂 जन्मदिनांक / वय:</strong> ${escapeHtml(m.dob || mAny.birthDate || '-')} ${m.age ? `(${m.age} वर्षे)` : ''}</div>
              <div><strong>📏 उंची:</strong> ${escapeHtml(m.height || '-')} | <strong>पोटजात:</strong> ${escapeHtml(m.subCaste || 'वंजारी')}</div>
              <div><strong>🎓 शिक्षण:</strong> ${escapeHtml(m.education || '-')}</div>
              <div><strong>💼 नोकरी/व्यवसाय:</strong> ${escapeHtml(m.occupation || mAny.job || '-')} ${m.income ? `(${escapeHtml(m.income)})` : ''}</div>
              <div><strong>📍 जिल्हा / शहर:</strong> ${escapeHtml(m.district || '-')} ${m.city ? `(${escapeHtml(m.city)})` : ''}</div>
              <div><strong>🏡 मूळ गाव/तालुका:</strong> ${escapeHtml(mAny.nativePlace || m.taluka || '-')}</div>
              <div><strong>🌟 गोत्र/राशी:</strong> ${escapeHtml(m.gotra || '-')} / ${escapeHtml(m.rashi || '-')}</div>
              <div><strong>📞 मोबाईल:</strong> <span style="font-weight: 900; color: #065f46; font-family: monospace; font-size: 11.5px;">${escapeHtml(m.mobile || mAny.mobileNumber || '-')}</span></div>
              <div style="grid-column: span 2; color: #475569; font-size: 10.5px; border-top: 1px dashed #cbd5e1; margin-top: 3px; padding-top: 3px;">
                <strong>वडिलांचे नाव/व्यवसाय:</strong> ${escapeHtml(m.fatherName || m.fatherOccupation || '-')} | <strong>मामा:</strong> ${escapeHtml(m.mamaName || mAny.mamaSurname || '-')}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    pageContainer.innerHTML = `
      <!-- Page Top Header -->
      <div style="background: #800C1E; border-radius: 12px; padding: 10px 18px; color: #ffffff; display: flex; justify-content: space-between; align-items: center; border-bottom: 3.5px solid #f59e0b; margin-bottom: 10px;">
        <div>
          <div style="font-size: 15.5px; font-weight: 900; color: #fef08a;">
            🚩 वंजारी जोडी वधू-वर सूचक केंद्र (vanjarijodi.web.app)
          </div>
          <div style="font-size: 11px; font-weight: 700; color: #ffffff; margin-top: 2px;">
            📋 ${escapeHtml(filterTitle)} • एकूण: ${members.length} (💎 पेड: ${paidCount} | 🎁 फ्री: ${freeGrantedCount} | ⏳ अनपेड: ${unpaidCount}) • दिनांक: ${dateFormatted}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="background: #5e0715; padding: 5px 12px; border-radius: 8px; border: 1px solid #f59e0b; font-size: 11px; font-weight: 800; color: #fef08a;">
            पान ${pageIdx + 1} / ${totalPages}
          </div>
        </div>
      </div>

      <!-- Member Cards Container -->
      <div style="flex: 1; display: flex; flex-direction: column; gap: 8px; justify-content: flex-start;">
        ${memberCardsHtml}
      </div>

      <!-- Page Bottom Footer -->
      <div style="border-top: 1.5px solid #cbd5e1; padding-top: 7px; display: flex; justify-content: space-between; font-size: 10px; color: #475569; font-weight: 700;">
        <div>॥ श्री संत भगवान बाबा प्रसन्न ॥ • वंजारी जोडी अधिकृत सदस्य अहवाल</div>
        <div>🌐 वेबसाईट: vanjarijodi.web.app | 📲 अँड्रॉइड ॲप: Vanjari Jodi</div>
      </div>
    `;

    document.body.appendChild(pageContainer);

    // Wait for fonts and layout to settle completely
    if (document.fonts) {
      try {
        await document.fonts.ready;
      } catch {}
    }
    await new Promise((r) => setTimeout(r, 80));

    try {
      const canvas = await safeHtml2Canvas(pageContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.94);
      if (pageIdx > 0) {
        pdf.addPage();
      }
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    } finally {
      if (pageContainer.parentNode) {
        pageContainer.parentNode.removeChild(pageContainer);
      }
    }
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const cleanTitle = filterTitle.replace(/[/\\?%*:|"<>]/g, '_').trim();
  pdf.save(`Vanjari_Jodi_${cleanTitle}_${dateStr}.pdf`);
}

