/**
 * PDF Generator Service
 * Generates PDF receipts for payments
 */

import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { logger } from '../shared/logging';
import { ReceiptData, PaymentError } from './types';

export class PDFGenerator {
  private readonly pageWidth = 612; // 8.5 inches
  private readonly pageHeight = 792; // 11 inches
  private readonly margin = 40;
  private readonly contentWidth = this.pageWidth - this.margin * 2;

  /**
   * Generate PDF receipt
   */
  async generatePDF(receipt: ReceiptData, companyName: string = 'Azora OS'): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        logger.info('Generating PDF receipt', { invoiceNumber: receipt.invoiceNumber });

        const doc = new PDFDocument({
          size: 'LETTER',
          margin: this.margin,
        });

        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          logger.info('PDF receipt generated successfully', {
            invoiceNumber: receipt.invoiceNumber,
            size: pdfBuffer.length,
          });
          resolve(pdfBuffer);
        });

        doc.on('error', (error: Error) => {
          logger.error('PDF generation error', { error });
          reject(error);
        });

        // Generate PDF content
        this.generateHeader(doc, companyName);
        this.generateInvoiceInfo(doc, receipt);
        this.generateLineItems(doc, receipt);
        this.generateTotals(doc, receipt);
        this.generateFooter(doc);

        doc.end();
      } catch (error) {
        logger.error('Failed to generate PDF', { error });
        reject(
          new PaymentError('Failed to generate PDF receipt', 'PDF_ERROR', 500)
        );
      }
    });
  }

  /**
   * Generate PDF header
   */
  private generateHeader(doc: PDFDocument, companyName: string): void {
    // Company name
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text(companyName, this.margin, this.margin);

    // Receipt title
    doc
      .fontSize(14)
      .font('Helvetica')
      .text('RECEIPT', this.margin, this.margin + 40);

    // Horizontal line
    doc
      .moveTo(this.margin, this.margin + 65)
      .lineTo(this.pageWidth - this.margin, this.margin + 65)
      .stroke();
  }

  /**
   * Generate invoice information
   */
  private generateInvoiceInfo(doc: PDFDocument, receipt: ReceiptData): void {
    const startY = this.margin + 80;
    const leftColumn = this.margin;
    const rightColumn = this.pageWidth / 2;

    // Invoice number
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Invoice Number:', leftColumn, startY);
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(receipt.invoiceNumber, leftColumn + 120, startY);

    // Invoice date
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Date:', leftColumn, startY + 20);
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(receipt.createdAt.toLocaleDateString(), leftColumn + 120, startY + 20);

    // Payment ID
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Payment ID:', leftColumn, startY + 40);
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(receipt.paymentId, leftColumn + 120, startY + 40);

    // Currency
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Currency:', rightColumn, startY);
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(receipt.currency.toUpperCase(), rightColumn + 80, startY);
  }

  /**
   * Generate line items table
   */
  private generateLineItems(doc: PDFDocument, receipt: ReceiptData): void {
    const startY = this.margin + 180;
    const tableTop = startY;
    const itemHeight = 20;
    const col1 = this.margin;
    const col2 = this.pageWidth - this.margin - 200;
    const col3 = this.pageWidth - this.margin - 120;
    const col4 = this.pageWidth - this.margin - 40;

    // Table header
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#000000');

    doc.text('Description', col1, tableTop);
    doc.text('Qty', col2, tableTop);
    doc.text('Unit Price', col3, tableTop);
    doc.text('Total', col4, tableTop);

    // Header underline
    doc
      .moveTo(this.margin, tableTop + 15)
      .lineTo(this.pageWidth - this.margin, tableTop + 15)
      .stroke();

    // Table rows
    doc.fontSize(10).font('Helvetica');

    let currentY = tableTop + 25;

    receipt.items.forEach((item) => {
      const unitPrice = (item.unitPrice / 100).toFixed(2);
      const totalPrice = (item.totalPrice / 100).toFixed(2);

      doc.text(item.description, col1, currentY);
      doc.text(item.quantity.toString(), col2, currentY);
      doc.text(`$${unitPrice}`, col3, currentY);
      doc.text(`$${totalPrice}`, col4, currentY);

      currentY += itemHeight;
    });

    // Bottom line
    doc
      .moveTo(this.margin, currentY)
      .lineTo(this.pageWidth - this.margin, currentY)
      .stroke();
  }

  /**
   * Generate totals section
   */
  private generateTotals(doc: PDFDocument, receipt: ReceiptData): void {
    const startY = this.margin + 350;
    const col1 = this.pageWidth - this.margin - 150;
    const col2 = this.pageWidth - this.margin - 40;

    const subtotal = (receipt.amount / 100).toFixed(2);
    const total = (receipt.amount / 100).toFixed(2);

    // Subtotal
    doc
      .fontSize(10)
      .font('Helvetica')
      .text('Subtotal:', col1, startY);
    doc.text(`$${subtotal}`, col2, startY);

    // Tax (if applicable)
    doc.text('Tax:', col1, startY + 20);
    doc.text('$0.00', col2, startY + 20);

    // Total
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Total:', col1, startY + 50);
    doc.text(`$${total}`, col2, startY + 50);

    // Total box
    doc
      .rect(col1 - 10, startY + 40, 160, 30)
      .stroke();
  }

  /**
   * Generate footer
   */
  private generateFooter(doc: PDFDocument): void {
    const footerY = this.pageHeight - this.margin - 40;

    // Footer line
    doc
      .moveTo(this.margin, footerY)
      .lineTo(this.pageWidth - this.margin, footerY)
      .stroke();

    // Footer text
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#666666')
      .text(
        'Thank you for your purchase! For support, visit support.azora.world',
        this.margin,
        footerY + 10,
        { align: 'center', width: this.contentWidth }
      );

    // Page number
    doc
      .fontSize(8)
      .text(
        `Generated on ${new Date().toLocaleString()}`,
        this.margin,
        footerY + 25,
        { align: 'center', width: this.contentWidth }
      );
  }

  /**
   * Generate PDF stream
   */
  async generatePDFStream(receipt: ReceiptData, companyName: string = 'Azora OS'): Promise<Readable> {
    return new Promise((resolve, reject) => {
      try {
        logger.info('Generating PDF stream', { invoiceNumber: receipt.invoiceNumber });

        const doc = new PDFDocument({
          size: 'LETTER',
          margin: this.margin,
        });

        // Generate PDF content
        this.generateHeader(doc, companyName);
        this.generateInvoiceInfo(doc, receipt);
        this.generateLineItems(doc, receipt);
        this.generateTotals(doc, receipt);
        this.generateFooter(doc);

        resolve(doc);
      } catch (error) {
        logger.error('Failed to generate PDF stream', { error });
        reject(
          new PaymentError('Failed to generate PDF stream', 'PDF_ERROR', 500)
        );
      }
    });
  }
}

export default PDFGenerator;
