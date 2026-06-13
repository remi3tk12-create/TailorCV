import { PDFDocument, rgb } from 'pdf-lib';
import PDFDocumentKit from 'pdfkit';
import fs from 'fs';

/**
 * Service handling PDF generation, modifications, and layout standards.
 */
export class PdfService {
  /**
   * Create a basic PDF using PDFKit
   * @param {Object} cvData - The structured CV data
   * @param {string} outputPath - Path to write the PDF
   * @returns {Promise<string>} - Resolved output path
   */
  static async generatePdf(cvData, outputPath) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocumentKit({ margin: 50 });
      const writeStream = fs.createWriteStream(outputPath);

      doc.pipe(writeStream);

      // Header
      doc.fontSize(24).text(cvData.name || 'John Doe', { align: 'center' });
      doc.fontSize(12).text(cvData.email || 'placeholder@example.com', { align: 'center' });
      doc.moveDown();

      // Professional Summary / Why this role?
      if (cvData.whyThisRole) {
        doc.fontSize(16).text('Why This Role?', { underline: true });
        doc.fontSize(10).text(cvData.whyThisRole);
        doc.moveDown();
      }

      // Experience Section
      if (cvData.experience && cvData.experience.length > 0) {
        doc.fontSize(16).text('Professional Experience', { underline: true });
        cvData.experience.forEach(exp => {
          doc.fontSize(12).text(`${exp.role} - ${exp.company}`, { bold: true });
          doc.fontSize(10).text(`${exp.startDate || ''} - ${exp.endDate || 'Present'}`);
          doc.fontSize(10).text(exp.description);
          doc.moveDown(0.5);
        });
        doc.moveDown();
      }

      // Education Section
      if (cvData.education && cvData.education.length > 0) {
        doc.fontSize(16).text('Education', { underline: true });
        cvData.education.forEach(edu => {
          doc.fontSize(12).text(`${edu.degree} - ${edu.school}`);
          doc.fontSize(10).text(`${edu.year || ''}`);
          doc.moveDown(0.5);
        });
      }

      doc.end();

      writeStream.on('finish', () => resolve(outputPath));
      writeStream.on('error', (err) => reject(err));
    });
  }

  /**
   * Load and modify an existing PDF using pdf-lib (preserving styling)
   * @param {string} inputPath - Original PDF path
   * @param {Object} modifications - Fields to find and replace / insert
   * @param {string} outputPath - Output file path
   */
  static async editPdf(inputPath, modifications, outputPath) {
    const existingPdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    // Perform modifications (e.g. form fields, text overlays, placeholders)
    // Note: PDF modifications can be complex depending on PDF structure,
    // we set up the skeleton ready for detailed implementation.
    
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);
    return outputPath;
  }
}
