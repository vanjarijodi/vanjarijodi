import jsPDF from 'jspdf';
import { BusinessVendor } from '../types';

export function generateVendorDetailsPDF(vendor: BusinessVendor) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Color Palette
  const maroon = '#6B0818';
  const gold = '#D97706';
  const darkSlate = '#0F172A';
  const lightAmber = '#FFFBEB';

  // Outer Decorative Border
  doc.setDrawColor(217, 119, 6); // Gold border
  doc.setLineWidth(1.5);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  doc.setDrawColor(107, 8, 24); // Inner Maroon line
  doc.setLineWidth(0.5);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Top Devotional & Header Bar
  doc.setFillColor(107, 8, 24);
  doc.rect(10, 10, pageWidth - 20, 24, 'F');

  doc.setTextColor(254, 240, 138); // Amber yellow
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('|| SHRI SANT BHAGWAN BABA PRASANNA ||', pageWidth / 2, 17, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('VANJARI JODI - WEDDING VENDOR DIRECTORY CERTIFICATE', pageWidth / 2, 26, { align: 'center' });

  // Sub Header Strip
  doc.setFillColor(254, 243, 199); // Light Amber
  doc.rect(10, 34, pageWidth - 20, 10, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.line(10, 44, pageWidth - 10, 44);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`REGISTRATION ID: ${vendor.id || 'VND-' + Date.now()}`, 14, 40);
  doc.text(`DATE: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 14, 40, { align: 'right' });

  let y = 52;

  // Title Box
  doc.setFontSize(16);
  doc.setTextColor(107, 8, 24);
  doc.setFont('helvetica', 'bold');
  doc.text(String(vendor.businessName || 'Business Name').toUpperCase(), 14, y);
  y += 6;

  doc.setFontSize(11);
  doc.setTextColor(217, 119, 6);
  doc.text(`CATEGORY: ${vendor.category || 'Wedding Vendor'}`, 14, y);
  y += 8;

  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  // Section Table Helper
  const drawRow = (label: string, value: string) => {
    if (y > pageHeight - 30) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 8, 24);
    doc.text(label, 14, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    const splitVal = doc.splitTextToSize(String(value || 'N/A'), pageWidth - 70);
    doc.text(splitVal, 68, y);
    y += Math.max(6, splitVal.length * 5);
  };

  // Vendor Information Rows
  drawRow('Owner / Contact Person:', vendor.ownerName || '-');
  drawRow('Contact Mobile:', vendor.mobile || '-');
  if (vendor.whatsapp) drawRow('WhatsApp Number:', vendor.whatsapp);
  if (vendor.email) drawRow('Email Address:', vendor.email);
  drawRow('District / Taluka:', `${vendor.district || '-'}${vendor.taluka ? ', ' + vendor.taluka : ''}`);
  drawRow('Full Business Address:', vendor.address || `${vendor.district} Maharashtra`);

  if (vendor.ratesAndPackages) drawRow('Rates & Packages:', vendor.ratesAndPackages);
  if (vendor.hallRentDay) drawRow('Hall Rent per Day/Shift:', vendor.hallRentDay);
  if (vendor.perPlateRate) drawRow('Per Plate Meal Rate:', vendor.perPlateRate);
  if (vendor.cookingLaborRate) drawRow('Cooking Labor Rate:', vendor.cookingLaborRate);
  if (vendor.cateringServiceType) drawRow('Catering Service Type:', vendor.cateringServiceType);
  if (vendor.hallCapacity) drawRow('Hall Seating Capacity:', vendor.hallCapacity);
  if (vendor.roomsCount) drawRow('Rooms Count:', vendor.roomsCount);
  if (vendor.parkingCapacity) drawRow('Parking Capacity:', vendor.parkingCapacity);
  if (vendor.specialDishes) drawRow('Special Dishes / Specialty:', vendor.specialDishes);
  if (vendor.memberDiscount) drawRow('Vanjari Jodi Member Discount:', vendor.memberDiscount);
  if (vendor.description) drawRow('Business Description:', vendor.description);

  y += 4;
  doc.setDrawColor(217, 119, 6);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  // Verification & Status Seal Box
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, pageWidth - 28, 24, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, y, pageWidth - 28, 24, 'S');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(107, 8, 24);
  doc.text('VERIFICATION & APPROVAL STATUS:', 18, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`Status: ${String(vendor.status || 'APPROVED').toUpperCase()}`, 18, y + 14);
  doc.text(`Approved By: Master Admin (Vanjari Jodi Portal)`, 18, y + 20);

  // Footer
  doc.setFillColor(107, 8, 24);
  doc.rect(10, pageHeight - 20, pageWidth - 20, 10, 'F');

  doc.setTextColor(254, 240, 138);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('VANJARI JODI MATRIMONIAL SERVICES & WEDDING DIRECTORY', pageWidth / 2, pageHeight - 14, { align: 'center' });

  // Save PDF
  const safeName = (vendor.businessName || 'vendor').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`VanjariJodi_Vendor_${safeName}.pdf`);
}

export function generateAllVendorsListPDF(vendors: BusinessVendor[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let currentPage = 1;

  const drawHeader = () => {
    // Top maroon bar
    doc.setFillColor(107, 8, 24);
    doc.rect(8, 8, pageWidth - 16, 18, 'F');

    doc.setTextColor(254, 240, 138); // Yellow gold
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('|| SHRI SANT BHAGWAN BABA PRASANNA ||', pageWidth / 2, 13, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('VANJARI JODI - OFFICIAL WEDDING VENDORS DIRECTORY REPORT', pageWidth / 2, 21, { align: 'center' });

    // Subheader
    doc.setFillColor(254, 243, 199);
    doc.rect(8, 26, pageWidth - 16, 7, 'F');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL REGISTERED VENDORS: ${vendors.length}`, 12, 31);
    doc.text(`DATE: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 12, 31, { align: 'right' });
  };

  const drawFooter = (pageNum: number) => {
    doc.setFillColor(107, 8, 24);
    doc.rect(8, pageHeight - 12, pageWidth - 16, 8, 'F');

    doc.setTextColor(254, 240, 138);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`VANJARI JODI OFFICIAL PORTAL • PAGE ${pageNum}`, pageWidth / 2, pageHeight - 7, { align: 'center' });
  };

  drawHeader();

  let y = 37;

  vendors.forEach((vendor, index) => {
    const cardHeight = 32; // compact height

    // Check if card fits on page
    if (y + cardHeight > pageHeight - 16) {
      drawFooter(currentPage);
      doc.addPage();
      currentPage++;
      drawHeader();
      y = 37;
    }

    // Border box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(217, 119, 6); // Gold border
    doc.setLineWidth(0.4);
    doc.rect(8, y, pageWidth - 16, cardHeight, 'FD');

    // Header bar inside card
    doc.setFillColor(107, 8, 24);
    doc.rect(8, y, pageWidth - 16, 6, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const titleText = `${index + 1}. ${vendor.businessName || 'Unnamed Business'} [${vendor.category || 'Vendor'}]`;
    doc.text(titleText.substring(0, 65), 11, y + 4.5);

    const statusText = `STATUS: ${(vendor.status || 'APPROVED').toUpperCase()}`;
    doc.text(statusText, pageWidth - 11, y + 4.5, { align: 'right' });

    // Details text
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8);

    // Row 1: Owner & Contact
    doc.setFont('helvetica', 'bold');
    doc.text('Owner/Contact:', 11, y + 10.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${vendor.ownerName || '-'} | Mob: ${vendor.mobile || '-'}${vendor.whatsapp ? ' | WA: ' + vendor.whatsapp : ''}`, 34, y + 10.5);

    // Row 2: Location & Address
    doc.setFont('helvetica', 'bold');
    doc.text('Location/Addr:', 11, y + 15.5);
    doc.setFont('helvetica', 'normal');
    const addr = `${vendor.district || '-'}${vendor.taluka ? ', ' + vendor.taluka : ''} - ${vendor.address || 'Address N/A'}`;
    doc.text(addr.substring(0, 85), 34, y + 15.5);

    // Row 3: Rates & Tariff / Facilities
    doc.setFont('helvetica', 'bold');
    doc.text('Rates/Facilities:', 11, y + 20.5);
    doc.setFont('helvetica', 'normal');
    const rates = vendor.ratesAndPackages || vendor.perPlateRate || vendor.hallRentDay || vendor.cookingLaborRate || 'Standard Market Tariff';
    doc.text(rates.substring(0, 85), 34, y + 20.5);

    // Row 4: Member Discount & Extra Info
    doc.setFont('helvetica', 'bold');
    doc.text('Special Offer:', 11, y + 25.5);
    doc.setFont('helvetica', 'normal');
    const offer = vendor.memberDiscount || 'Special discount available for Vanjari Jodi members.';
    doc.text(offer.substring(0, 85), 34, y + 25.5);

    y += cardHeight + 3; // Gap between cards
  });

  drawFooter(currentPage);

  doc.save(`VanjariJodi_All_Vendors_List_${new Date().toISOString().slice(0, 10)}.pdf`);
}
