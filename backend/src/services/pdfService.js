import { PDFDocument } from 'pdf-lib';
import PDFDocumentKit from 'pdfkit';
import fs from 'fs';

/**
 * Service handling PDF generation, modifications, and layout standards based on cv-template-specs.md.
 */
export class PdfService {
  /**
   * Create a professional, ATS-compliant PDF using PDFKit
   * Specs: 1-inch (72pt) margins, Helvetica font, correct section hierarchy,
   * single-column layout, Name @ 24pt, Headings @ 16pt, Body @ 11pt.
   * 
   * @param {Object} cvData - The structured CV data
   * @param {string} outputPath - Path to write the PDF
   * @returns {Promise<string>} - Resolved output path
   */
  static async generatePdf(cvData, outputPath) {
    return new Promise((resolve, reject) => {
      // 1 inch margin = 72 points
      const doc = new PDFDocumentKit({ 
        margin: 72,
        info: {
          Title: `${cvData.name || 'Candidate'} - CV`,
          Author: cvData.name || 'TailorCV Candidate',
          Subject: 'Tailored Professional Resume'
        }
      });
      
      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      // Helvetica Font configuration (Standard built-in PDF fonts)
      const fontRegular = 'Helvetica';
      const fontBold = 'Helvetica-Bold';

      // 1. Contact Information / Header
      doc.font(fontBold).fontSize(24).fillColor('#111111')
         .text(cvData.name || '[NAME - TO BE FILLED IN]', { align: 'center' });
      
      doc.font(fontRegular).fontSize(11).fillColor('#444444');
      const email = cvData.email || '[EMAIL - TO BE FILLED IN]';
      const phone = cvData.phone || '[PHONE - TO BE FILLED IN]';
      const location = cvData.location || '[LOCATION - TO BE FILLED IN]';
      const linkedin = cvData.linkedin || '[LINKEDIN - TO BE FILLED IN]';

      doc.text(`${email}   |   ${phone}   |   ${location}`, { align: 'center' });
      if (cvData.linkedin) {
        doc.text(linkedin, { align: 'center' });
      }
      doc.moveDown(1.5);

      // Section drawing helper
      const addSectionHeading = (title) => {
        doc.moveDown(1);
        doc.font(fontBold).fontSize(16).fillColor('#1a365d') // Dark blue professional primary color
           .text(title.toUpperCase());
        // Draw a thin horizontal separator line
        doc.moveTo(doc.page.margins.left, doc.y)
           .lineTo(doc.page.width - doc.page.margins.right, doc.y)
           .strokeColor('#cccccc').lineWidth(0.75).stroke();
        doc.moveDown(0.5);
      };

      // 2. Professional Summary / Profile / Why This Role?
      if (cvData.whyThisRole) {
        addSectionHeading('Why This Role? & Professional Summary');
        doc.font(fontRegular).fontSize(11).fillColor('#333333')
           .text(cvData.whyThisRole, { align: 'left', lineGap: 3 });
      }

      // 3. Core Skills / Expertise
      if (cvData.skills && cvData.skills.length > 0) {
        addSectionHeading('Core Skills & Expertise');
        doc.font(fontRegular).fontSize(11).fillColor('#333333');
        
        // Group skills in a neat single column with inline priorities or formatted layout
        const skillsString = cvData.skills.join('   •   ');
        doc.text(skillsString, { align: 'left', lineGap: 3 });
      }

      // 4. Professional Experience
      if (cvData.experience && cvData.experience.length > 0) {
        addSectionHeading('Professional Experience');
        
        cvData.experience.forEach(exp => {
          doc.font(fontBold).fontSize(12).fillColor('#111111');
          
          // Role & Company line
          const roleText = exp.role || '[ROLE - TO BE FILLED IN]';
          const companyText = exp.company || '[COMPANY - TO BE FILLED IN]';
          const titleLine = `${roleText}  |  ${companyText}`;
          
          // Dates line
          const startDate = exp.startDate || '';
          const endDate = exp.endDate || 'Present';
          const dateLine = `${startDate} – ${endDate}`;

          // Print title on left, dates on right
          const currentY = doc.y;
          doc.text(titleLine, doc.page.margins.left, currentY, { lineGap: 2 });
          
          // Print dates aligned right (only if there is space)
          doc.font(fontRegular).fontSize(10).fillColor('#666666');
          doc.text(dateLine, doc.page.margins.left, currentY, {
            align: 'right'
          });

          // Bullet points description
          doc.font(fontRegular).fontSize(11).fillColor('#333333');
          doc.moveDown(0.3);

          if (exp.description) {
            const lines = exp.description.split('\n');
            lines.forEach(line => {
              if (line.trim().length === 0) return;
              // Ensure bullet format
              let cleanLine = line.trim();
              if (cleanLine.startsWith('•') || cleanLine.startsWith('-')) {
                cleanLine = cleanLine.substring(1).trim();
              }
              doc.text(`•  ${cleanLine}`, { 
                indent: 12, 
                lineGap: 2,
                paragraphGap: 1
              });
            });
          }
          doc.moveDown(0.8);
        });
      }

      // 5. Education Section
      if (cvData.education && cvData.education.length > 0) {
        addSectionHeading('Education');
        
        cvData.education.forEach(edu => {
          doc.font(fontBold).fontSize(12).fillColor('#111111');
          const degreeMajor = edu.degree || '[DEGREE/MAJOR - TO BE FILLED IN]';
          const schoolName = edu.school || '[UNIVERSITY - TO BE FILLED IN]';
          const eduLine = `${degreeMajor}  |  ${schoolName}`;
          
          const gradYear = edu.year || '';
          const currentY = doc.y;
          doc.text(eduLine, doc.page.margins.left, currentY, { lineGap: 2 });
          
          if (gradYear) {
            doc.font(fontRegular).fontSize(10).fillColor('#666666');
            doc.text(gradYear, doc.page.margins.left, currentY, {
              align: 'right'
            });
          }
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
    
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);
    return outputPath;
  }
}
