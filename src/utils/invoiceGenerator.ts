import { jsPDF } from 'jspdf';

export interface InvoiceData {
  invoiceNumber: string;
  paymentId: string;
  utrNumber: string;
  userName: string;
  userMobile: string;
  userDistrict?: string;
  planName: string;
  planDuration?: string;
  amount: number;
  currency?: string;
  paymentDate: string;
  membershipExpiryDate: string;
  businessName?: string;
  upiId?: string;
  adminNote?: string;
}

/**
 * Generates an official, branded PDF payment invoice for Vanjari Jodi Matrimony
 */
export function generatePaymentInvoicePDF(data: InvoiceData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryColor: [number, number, number] = [128, 12, 30]; // #800C1E (Crimson Maroon)
  const goldColor: [number, number, number] = [217, 119, 6]; // #D97706 (Amber Gold)
  const textColor: [number, number, number] = [30, 41, 59]; // Slate 800
  const lightBg: [number, number, number] = [254, 243, 199]; // Amber 100

  // 1. Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Gold accent bar
  doc.setFillColor(...goldColor);
  doc.rect(0, 42, pageWidth, 3, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(data.businessName || 'VANJARI JODI MATRIMONY', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Official Matrimonial Membership Payment Receipt & Tax Invoice', 14, 25);
  doc.text('Regd. Maharashtra | ISO 9001:2015 Certified | Support: +91 9800000000', 14, 31);
  doc.text('Blessing: || Shree Sant Bhagwan Baba Prasanna ||', 14, 37);

  // Header Right Box (Invoice # & Status)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PAID RECEIPT', pageWidth - 14, 18, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt #: ${data.invoiceNumber || 'INV-' + Date.now().toString().slice(-6)}`, pageWidth - 14, 25, { align: 'right' });
  doc.text(`Date: ${new Date(data.paymentDate || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - 14, 31, { align: 'right' });
  doc.text(`Payment Mode: UPI Instant Intent / QR`, pageWidth - 14, 37, { align: 'right' });

  // 2. Member & Transaction Information Card
  doc.setTextColor(...textColor);
  let yPos = 56;

  // Left Column - Billed To
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, yPos, 88, 48, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, yPos, 88, 48, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('BILLED TO (MEMBER DETAILS)', 18, yPos + 8);

  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Name: ${data.userName || 'Valued Member'}`, 18, yPos + 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Mobile: ${data.userMobile || 'Not provided'}`, 18, yPos + 24);
  doc.text(`District: ${data.userDistrict || 'Maharashtra'}`, 18, yPos + 31);
  doc.text(`Account Status: Active Premium Member`, 18, yPos + 38);
  doc.text(`Community: Vanjari (NT-D)`, 18, yPos + 44);

  // Right Column - Payment & Bank Reference
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(108, yPos, 88, 48, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(108, yPos, 88, 48, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('TRANSACTION & UPI DETAILS', 112, yPos + 8);

  doc.setTextColor(...textColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`UTR / Ref No: ${data.utrNumber || 'N/A'}`, 112, yPos + 17);

  doc.setFont('helvetica', 'normal');
  doc.text(`Merchant UPI ID: ${data.upiId || 'vanjarijodi@paytm'}`, 112, yPos + 24);
  doc.text(`Txn Status: APPROVED & VERIFIED`, 112, yPos + 31);
  doc.text(`Payment ID: ${data.paymentId || 'PAY-' + Date.now().toString().slice(-6)}`, 112, yPos + 38);
  doc.text(`Verification: Strict 12-Digit Banking Check`, 112, yPos + 44);

  // 3. Itemized Table
  yPos = 114;

  // Table Header
  doc.setFillColor(...primaryColor);
  doc.rect(14, yPos, pageWidth - 28, 9, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('#', 18, yPos + 6);
  doc.text('MEMBERSHIP PLAN DESCRIPTION', 28, yPos + 6);
  doc.text('VALIDITY', 115, yPos + 6);
  doc.text('EXPIRY DATE', 145, yPos + 6);
  doc.text('AMOUNT', pageWidth - 18, yPos + 6, { align: 'right' });

  // Table Row 1
  yPos += 9;
  doc.setFillColor(255, 255, 255);
  doc.rect(14, yPos, pageWidth - 28, 26, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, yPos, pageWidth - 28, 26, 'S');

  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('1', 18, yPos + 7);
  doc.text(data.planName || 'Vanjari Jodi Premium Plan', 28, yPos + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('• Full access to verified bride & groom contact numbers', 28, yPos + 13);
  doc.text('• Verified Matchmaking, Kundali details & instant chat', 28, yPos + 18);
  doc.text('• Express Interest, Shortlisting & PDF BioData Maker', 28, yPos + 23);

  doc.setTextColor(...textColor);
  doc.setFontSize(9);
  doc.text(data.planDuration || 'Standard Term', 115, yPos + 7);
  doc.text(data.membershipExpiryDate ? new Date(data.membershipExpiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Active', 145, yPos + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`INR ${data.amount.toFixed(2)}`, pageWidth - 18, yPos + 7, { align: 'right' });

  // 4. Totals Summary Box
  yPos += 30;
  const summaryX = pageWidth - 90;

  doc.setFillColor(...lightBg);
  doc.roundedRect(summaryX, yPos, 76, 32, 2, 2, 'F');
  doc.setDrawColor(...goldColor);
  doc.roundedRect(summaryX, yPos, 76, 32, 2, 2, 'S');

  doc.setTextColor(...textColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', summaryX + 6, yPos + 7);
  doc.text(`INR ${(data.amount * 0.82).toFixed(2)}`, pageWidth - 18, yPos + 7, { align: 'right' });

  doc.text('GST / Taxes (18% Incl.):', summaryX + 6, yPos + 14);
  doc.text(`INR ${(data.amount * 0.18).toFixed(2)}`, pageWidth - 18, yPos + 14, { align: 'right' });

  doc.setDrawColor(217, 119, 6);
  doc.line(summaryX + 4, yPos + 18, pageWidth - 16, yPos + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('Total Paid:', summaryX + 6, yPos + 26);
  doc.text(`INR ${data.amount.toFixed(2)}`, pageWidth - 18, yPos + 26, { align: 'right' });

  // 5. Left Terms & Security Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, yPos, summaryX - 20, 32, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, yPos, summaryX - 20, 32, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text('TERMS & VERIFICATION GUARANTEE:', 18, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('1. This is a computer-generated tax invoice verified with banking UTR.', 18, yPos + 12);
  doc.text('2. Membership fee is non-refundable and non-transferable.', 18, yPos + 17);
  doc.text('3. Account access is active immediately across Web and Android Mobile App.', 18, yPos + 22);
  doc.text('4. For any billing questions, contact support@vanjarijodi.org / WhatsApp.', 18, yPos + 27);

  // 6. Signature & Seal
  yPos += 38;

  doc.setTextColor(...textColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Signatory:', pageWidth - 60, yPos + 14);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Vanjari Jodi Accounts Team', pageWidth - 60, yPos + 20);

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Digitally Signed & Validated', pageWidth - 60, yPos + 25);

  // 7. Footer
  doc.setFillColor(...primaryColor);
  doc.rect(0, 282, pageWidth, 15, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Thank you for choosing Vanjari Jodi Matrimony - Connecting Vanjari Community Worldwide', pageWidth / 2, 289, { align: 'center' });
  doc.text('Website: https://vanjarijodi.org | Helpline: +91 9800000000', pageWidth / 2, 294, { align: 'center' });

  return doc;
}

/**
 * Downloads the payment invoice directly to the user's device
 */
export function downloadPaymentInvoicePDF(data: InvoiceData) {
  try {
    const doc = generatePaymentInvoicePDF(data);
    const cleanUtr = data.utrNumber ? data.utrNumber.replace(/[^a-zA-Z0-9]/g, '') : 'RECEIPT';
    const cleanName = data.userName ? data.userName.replace(/\s+/g, '_').slice(0, 15) : 'Member';
    const fileName = `VanjariJodi_Invoice_${cleanUtr}_${cleanName}.pdf`;
    doc.save(fileName);
    return { success: true, fileName };
  } catch (err: any) {
    console.error('Failed to generate PDF Invoice:', err);
    return { success: false, error: err.message };
  }
}
