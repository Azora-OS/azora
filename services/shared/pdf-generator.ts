/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * PDF Generation with Watermark/Logo/UID
 * 
 * Real PDF generation using pdf-lib
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export interface PDFOptions {
  watermark?: {
    text?: string;
    logoPath?: string;
    opacity?: number;
  };
  uid?: string;
  title: string;
  content: string;
  metadata: {
    studentName: string;
    studentNumber: string;
    credentialType: string;
    issuedDate: Date;
    issuer: string;
  };
}

export class PDFGenerator {
  private static readonly LOGO_PATH = path.join(process.cwd(), 'public/branding/services/azora-education-logo.svg');
  private static readonly DEFAULT_WATERMARK_TEXT = 'AZORA EDUCATION';

  /**
   * Generate PDF certificate with watermark and logo
   */
  static async generateCertificate(options: PDFOptions): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();

    // Add watermark
    if (options.watermark?.enabled !== false) {
      await this.addWatermark(page, options.watermark || {}, width, height, font);
    }

    // Add logo
    if (options.watermark?.logoPath || this.logoExists()) {
      await this.addLogo(page, options.watermark?.logoPath || this.LOGO_PATH, width, height);
    }

    // Add title
    page.drawText(options.title, {
      x: width / 2 - font.widthOfTextAtSize(options.title, 24) / 2,
      y: height - 150,
      size: 24,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Add content
    const lines = this.splitTextIntoLines(options.content, width - 100, font, 12);
    let yPosition = height - 250;
    for (const line of lines) {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;
    }

    // Add metadata
    const metadataY = 100;
    page.drawText(`Student: ${options.metadata.studentName}`, {
      x: 50,
      y: metadataY,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText(`Student Number: ${options.metadata.studentNumber}`, {
      x: 50,
      y: metadataY - 15,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText(`Issued: ${options.metadata.issuedDate.toLocaleDateString()}`, {
      x: 50,
      y: metadataY - 30,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText(`Issuer: ${options.metadata.issuer}`, {
      x: 50,
      y: metadataY - 45,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Add UID in footer
    if (options.uid) {
      page.drawText(`UID: ${options.uid}`, {
        x: 50,
        y: 30,
        size: 8,
        font: font,
        color: rgb(0.7, 0.7, 0.7),
      });
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * Add watermark to page
   */
  private static async addWatermark(
    page: any,
    watermark: PDFOptions['watermark'],
    width: number,
    height: number,
    font: any
  ): Promise<void> {
    const text = watermark.text || this.DEFAULT_WATERMARK_TEXT;
    const opacity = watermark.opacity || 0.2;

    // Draw watermark text diagonally across page
    const fontSize = 60;
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = fontSize;

    // Rotate and draw watermark
    page.pushGraphicsState();
    page.setFont(font);
    page.setFontSize(fontSize);
    page.setAlpha(opacity);
    
    // Center watermark
    const x = (width - textWidth) / 2;
    const y = height / 2;
    
    page.drawText(text, {
      x,
      y,
      rotate: { angleRadians: -0.785 }, // 45 degrees
      color: rgb(0.8, 0.8, 0.8),
    });

    page.popGraphicsState();
  }

  /**
   * Add logo to page
   */
  private static async addLogo(page: any, logoPath: string, width: number, height: number): Promise<void> {
    try {
      // Try to load logo (PNG/JPEG)
      if (fs.existsSync(logoPath)) {
        const logoBytes = fs.readFileSync(logoPath);
        let logoImage;

        if (logoPath.endsWith('.png')) {
          logoImage = await page.doc.embedPng(logoBytes);
        } else if (logoPath.endsWith('.jpg') || logoPath.endsWith('.jpeg')) {
          logoImage = await page.doc.embedJpg(logoBytes);
        } else {
          // SVG not directly supported, skip
          return;
        }

        // Add logo at top right
        const logoSize = 80;
        page.drawImage(logoImage, {
          x: width - logoSize - 50,
          y: height - logoSize - 50,
          width: logoSize,
          height: logoSize,
        });
      }
    } catch (error) {
      console.warn('Could not add logo:', error);
    }
  }

  /**
   * Split text into lines that fit page width
   */
  private static splitTextIntoLines(text: string, maxWidth: number, font: any, fontSize: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Check if logo exists
   */
  private static logoExists(): boolean {
    return fs.existsSync(this.LOGO_PATH);
  }
}
