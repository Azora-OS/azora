import { generateUUID } from '../utils/uuid.js';
import { LegalDocument, LegalDocumentRequest } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { legalService } from './legal.service.js';

// Lazy load pdfkit to avoid import errors if not installed
let PDFDocument: any = null;
let pdfkitLoaded = false;

const loadPDFKit = async () => {
  if (!pdfkitLoaded) {
    try {
      // @ts-ignore - dynamic import
      const pdfkit = await import('pdfkit');
      PDFDocument = pdfkit.default || pdfkit;
      pdfkitLoaded = true;
    } catch (error) {
      console.warn('pdfkit not available, PDF generation will use fallback');
      pdfkitLoaded = true;
    }
  }
  return PDFDocument;
};

// Mock storage for generated documents and versions
const generatedDocuments: Map<string, LegalDocument> = new Map();
const documentVersions: Map<string, LegalDocument[]> = new Map();
const documentStorage: Map<string, Buffer> = new Map();

export class DocumentGenerationService {
  /**
   * Generate document from template with data population
   * Requirements: 3.2, 3.3
   */
  async generateDocument(
    businessId: string,
    data: LegalDocumentRequest,
    userId: string
  ): Promise<LegalDocument> {
    // Validate template exists
    await legalService.getTemplateById(data.templateId);

    // Validate all required placeholders are provided
    const validation = await legalService.validateTemplatePlaceholders(data.templateId, data.data);
    if (!validation.valid) {
      throw new AppError(400, `Missing required fields: ${validation.missingFields.join(', ')}`);
    }

    // Generate document using legal service
    const document = await legalService.generateDocument(businessId, data, userId);

    // Store generated document
    generatedDocuments.set(document.id, document);

    // Initialize version history
    if (!documentVersions.has(document.id)) {
      documentVersions.set(document.id, []);
    }
    documentVersions.get(document.id)!.push({ ...document });

    return document;
  }

  /**
   * Generate PDF from document content
   * Requirements: 3.2, 3.3
   */
  async generatePDF(documentId: string, userId: string): Promise<Buffer> {
    const document = await legalService.getDocumentById(documentId, userId);

    return new Promise(async (resolve, reject) => {
      try {
        const PDFKit = await loadPDFKit();

        if (!PDFKit) {
          // Fallback: return simple text-based PDF representation
          const fallbackPDF = this.createFallbackPDF(document);
          documentStorage.set(documentId, fallbackPDF);
          resolve(fallbackPDF);
          return;
        }

        const pdfDoc = new PDFKit({
          size: 'A4',
          margin: 50,
        });

        const chunks: Buffer[] = [];

        pdfDoc.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        pdfDoc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          // Store PDF in memory storage
          documentStorage.set(documentId, pdfBuffer);
          resolve(pdfBuffer);
        });

        pdfDoc.on('error', (error: Error) => {
          reject(error);
        });

        // Add content to PDF
        this.addContentToPDF(pdfDoc, document);

        pdfDoc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate document with custom styling
   * Requirements: 3.2, 3.3
   */
  async generateStyledDocument(
    businessId: string,
    data: LegalDocumentRequest,
    styling?: {
      fontSize?: number;
      fontFamily?: string;
      margins?: { top: number; bottom: number; left: number; right: number };
      headerText?: string;
      footerText?: string;
    }
  ): Promise<LegalDocument> {
    const document = await this.generateDocument(businessId, data, '');

    // Apply styling (would be used in PDF generation)
    if (styling) {
      document.content = this.applyStyleToContent(document.content, styling);
      generatedDocuments.set(document.id, document);
    }

    return document;
  }

  /**
   * Generate batch documents
   * Requirements: 3.2, 3.3
   */
  async generateBatchDocuments(
    businessId: string,
    documents: Array<{
      templateId: string;
      data: Record<string, any>;
    }>,
    userId: string
  ): Promise<LegalDocument[]> {
    const results: LegalDocument[] = [];

    for (const doc of documents) {
      try {
        const generated = await this.generateDocument(
          businessId,
          {
            templateId: doc.templateId,
            data: doc.data,
          },
          userId
        );
        results.push(generated);
      } catch (error) {
        console.error(`Failed to generate document from template ${doc.templateId}:`, error);
      }
    }

    return results;
  }

  /**
   * Get generated document
   * Requirements: 3.2, 3.3
   */
  async getGeneratedDocument(documentId: string, userId: string): Promise<LegalDocument> {
    return legalService.getDocumentById(documentId, userId);
  }

  /**
   * Update generated document
   * Requirements: 3.2, 3.3
   */
  async updateGeneratedDocument(
    documentId: string,
    userId: string,
    updates: {
      content?: string;
      status?: 'draft' | 'signed' | 'archived';
    }
  ): Promise<LegalDocument> {
    const document = await legalService.getDocumentById(documentId, userId);

    // Store current version before update
    if (documentVersions.has(documentId)) {
      documentVersions.get(documentId)!.push({ ...document });
    }

    return legalService.updateDocument(documentId, userId, updates);
  }

  /**
   * Export document as text
   * Requirements: 3.2, 3.3
   */
  async exportAsText(documentId: string, userId: string): Promise<string> {
    const document = await legalService.getDocumentById(documentId, userId);
    return document.content;
  }

  /**
   * Export document as JSON
   * Requirements: 3.2, 3.3
   */
  async exportAsJSON(documentId: string, userId: string): Promise<Record<string, any>> {
    const document = await legalService.getDocumentById(documentId, userId);

    return {
      id: document.id,
      businessId: document.businessId,
      templateId: document.templateId,
      templateVersion: document.templateVersion,
      status: document.status,
      content: document.content,
      signedAt: document.signedAt,
      signerId: document.signerId,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }

  /**
   * Get document generation history
   * Requirements: 3.2, 3.3
   */
  async getGenerationHistory(businessId: string): Promise<
    Array<{
      documentId: string;
      templateId: string;
      generatedAt: Date;
      status: string;
    }>
  > {
    const docs = Array.from(generatedDocuments.values()).filter((d) => d.businessId === businessId);

    return docs.map((d) => ({
      documentId: d.id,
      templateId: d.templateId,
      generatedAt: d.createdAt,
      status: d.status,
    }));
  }

  /**
   * Get document version history
   * Requirements: 3.2, 3.3
   */
  async getDocumentVersions(documentId: string, userId: string): Promise<
    Array<{
      version: number;
      content: string;
      status: string;
      updatedAt: Date;
    }>
  > {
    // Verify user has access
    await legalService.getDocumentById(documentId, userId);

    const versions = documentVersions.get(documentId) || [];

    return versions.map((v, index) => ({
      version: index + 1,
      content: v.content,
      status: v.status,
      updatedAt: v.updatedAt,
    }));
  }

  /**
   * Restore document to previous version
   * Requirements: 3.2, 3.3
   */
  async restoreDocumentVersion(
    documentId: string,
    userId: string,
    versionNumber: number
  ): Promise<LegalDocument> {
    const document = await legalService.getDocumentById(documentId, userId);
    const versions = documentVersions.get(documentId) || [];

    if (versionNumber < 1 || versionNumber > versions.length) {
      throw new AppError(400, `Invalid version number: ${versionNumber}`);
    }

    const targetVersion = versions[versionNumber - 1];

    // Update document to target version
    const updated = await legalService.updateDocument(documentId, userId, {
      content: targetVersion.content,
      status: targetVersion.status,
    });

    // Add restoration to version history
    documentVersions.get(documentId)!.push({ ...updated });

    return updated;
  }

  /**
   * Store document PDF
   * Requirements: 3.2, 3.3
   */
  async storePDF(documentId: string, pdfBuffer: Buffer): Promise<void> {
    documentStorage.set(documentId, pdfBuffer);
  }

  /**
   * Retrieve stored PDF
   * Requirements: 3.2, 3.3
   */
  async retrievePDF(documentId: string, userId: string): Promise<Buffer> {
    // Verify user has access
    await legalService.getDocumentById(documentId, userId);

    const pdf = documentStorage.get(documentId);
    if (!pdf) {
      throw new AppError(404, 'PDF not found for document');
    }

    return pdf;
  }

  /**
   * Validate document before generation
   * Requirements: 3.2, 3.3
   */
  async validateDocumentData(
    templateId: string,
    data: Record<string, any>
  ): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      await legalService.getTemplateById(templateId);

      // Check for required fields
      const validation = await legalService.validateTemplatePlaceholders(templateId, data);
      if (!validation.valid) {
        errors.push(`Missing required fields: ${validation.missingFields.join(', ')}`);
      }

      // Check for empty values
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'string' && value.trim().length === 0) {
          warnings.push(`Field "${key}" is empty`);
        }
      });

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [`Template not found: ${templateId}`],
        warnings: [],
      };
    }
  }

  /**
   * Get document generation statistics
   * Requirements: 3.2, 3.3
   */
  async getGenerationStats(businessId: string): Promise<{
    totalGenerated: number;
    byStatus: Record<string, number>;
    byTemplate: Record<string, number>;
  }> {
    const docs = Array.from(generatedDocuments.values()).filter((d) => d.businessId === businessId);

    const byStatus: Record<string, number> = {};
    const byTemplate: Record<string, number> = {};

    docs.forEach((d) => {
      byStatus[d.status] = (byStatus[d.status] || 0) + 1;
      byTemplate[d.templateId] = (byTemplate[d.templateId] || 0) + 1;
    });

    return {
      totalGenerated: docs.length,
      byStatus,
      byTemplate,
    };
  }

  /**
   * Create fallback PDF when pdfkit is not available
   * Requirements: 3.2, 3.3
   */
  private createFallbackPDF(document: LegalDocument): Buffer {
    // Create a simple text-based PDF representation
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length ${document.content.length + 100} >>
stream
BT
/F1 12 Tf
50 750 Td
(Legal Document) Tj
0 -20 Td
(Document ID: ${document.id}) Tj
0 -20 Td
(Status: ${document.status}) Tj
0 -20 Td
(Created: ${document.createdAt.toLocaleDateString()}) Tj
0 -40 Td
(${document.content.substring(0, 200)}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
${document.content.length + 400}
%%EOF`;

    return Buffer.from(pdfContent, 'utf-8');
  }

  /**
   * Add content to PDF document
   * Requirements: 3.2, 3.3
   */
  private addContentToPDF(pdfDoc: any, document: LegalDocument): void {
    // Add title
    pdfDoc.fontSize(16).font('Helvetica-Bold').text('Legal Document', { align: 'center' });
    pdfDoc.moveDown();

    // Add metadata
    pdfDoc.fontSize(10).font('Helvetica').text(`Document ID: ${document.id}`);
    pdfDoc.text(`Status: ${document.status}`);
    pdfDoc.text(`Created: ${document.createdAt.toLocaleDateString()}`);
    pdfDoc.moveDown();

    // Add content
    pdfDoc.fontSize(11).text(document.content, {
      align: 'left',
      width: 500,
    });

    // Add footer
    pdfDoc.moveDown();
    pdfDoc.fontSize(9).text('This is an automatically generated document.', {
      align: 'center',
    });
  }

  /**
   * Apply styling to document content
   * Requirements: 3.2, 3.3
   */
  private applyStyleToContent(
    content: string,
    styling: {
      fontSize?: number;
      fontFamily?: string;
      margins?: { top: number; bottom: number; left: number; right: number };
      headerText?: string;
      footerText?: string;
    }
  ): string {
    let styledContent = content;

    if (styling.headerText) {
      styledContent = `${styling.headerText}\n\n${styledContent}`;
    }

    if (styling.footerText) {
      styledContent = `${styledContent}\n\n${styling.footerText}`;
    }

    return styledContent;
  }
}

export const documentGenerationService = new DocumentGenerationService();
