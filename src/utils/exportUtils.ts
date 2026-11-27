import { jsPDF } from 'jspdf';

/**
 * Universal CSV Export with UTF-8 BOM so Marathi and Unicode text displays perfectly in Excel.
 */
export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escapeCell = (val: string | number) => {
    const stringVal = String(val ?? '').replace(/"/g, '""');
    return `"${stringVal}"`;
  };

  const csvContent =
    '\uFEFF' + // UTF-8 Byte Order Mark for Excel compatibility
    headers.map(escapeCell).join(',') +
    '\n' +
    rows.map((row) => row.map(escapeCell).join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export table data to downloadable PDF document using jsPDF
 */
export function exportToPdf(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  filename: string
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Header Title
  doc.setFontSize(16);
  doc.setTextColor(128, 12, 30); // #800C1E
  doc.text(title, 14, 15);

  // Subtitle & Timestamp
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  const now = new Date().toLocaleString('en-IN');
  doc.text(`Generated on: ${now} | Vanjari Jodi Matrimony Portal`, 14, 22);

  let startY = 30;
  const colWidth = Math.floor(270 / headers.length);

  // Table Headers
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(128, 12, 30);
  doc.rect(14, startY, 268, 8, 'F');

  headers.forEach((header, index) => {
    doc.text(header.slice(0, 18), 16 + index * colWidth, startY + 5.5);
  });

  startY += 9;

  // Table Rows
  doc.setTextColor(30, 41, 59);
  rows.slice(0, 40).forEach((row, rowIndex) => {
    if (startY > 190) {
      doc.addPage();
      startY = 20;
    }

    // Row alternating background
    if (rowIndex % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, startY - 4, 268, 7, 'F');
    }

    row.forEach((cell, cellIndex) => {
      const cellStr = String(cell ?? '').slice(0, 22);
      doc.text(cellStr, 16 + cellIndex * colWidth, startY + 1);
    });

    startY += 7;
  });

  if (rows.length > 40) {
    startY += 4;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`* Showing first 40 of ${rows.length} records in PDF. Export to CSV for full database.`, 14, startY);
  }

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
