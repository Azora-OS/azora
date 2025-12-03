import { generateUUID } from '../utils/uuid.js';
import {
  LegalTemplate,
  LegalDocument,
  LegalDocumentRequest,
  SignatureData,
  DocumentSigningRequest,
} from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';
import crypto from 'crypto';

// Mock database - replace with actual database calls
const templates: Map<string, LegalTemplate> = new Map();
const documents: Map<string, LegalDocument> = new Map();

// Initialize default templates
function initializeDefaultTemplates(): void {
  if (templates.size > 0) {return;}

  const defaultTemplates: LegalTemplate[] = [
    {
      id: generateUUID(),
      name: 'Business Registration Agreement',
      type: 'registration',
      content: `
BUSINESS REGISTRATION AGREEMENT

This Business Registration Agreement ("Agreement") is entered into as of {{date}} between {{businessName}} ("Business") and Citadel Fund ("Fund").

1. BUSINESS INFORMATION
   - Business Name: {{businessName}}
   - Business Type: {{businessType}}
   - Owner: {{ownerName}}
   - Registration Date: {{date}}

2. OWNERSHIP STRUCTURE
   - Business Owner Equity: 90%
   - Citadel Fund Equity: 10%

3. TERMS AND CONDITIONS
   {{additionalTerms}}

4. SIGNATURES
   Business Owner: _________________ Date: _______
   Citadel Fund Representative: _________________ Date: _______
      `,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateUUID(),
      name: 'Operating Agreement',
      type: 'operating',
      content: `
OPERATING AGREEMENT

This Operating Agreement ("Agreement") is entered into as of {{date}} for {{businessName}}.

1. BUSINESS OPERATIONS
   - Primary Business Activity: {{businessActivity}}
   - Operating Location: {{location}}
   - Fiscal Year: {{fiscalYear}}

2. MANAGEMENT STRUCTURE
   {{managementStructure}}

3. DECISION-MAKING AUTHORITY
   {{decisionMaking}}

4. AMENDMENT PROCEDURES
   {{amendmentProcedures}}

5. SIGNATURES
   Owner: _________________ Date: _______
   Witness: _________________ Date: _______
      `,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateUUID(),
      name: 'Revenue Share & Payment Terms',
      type: 'revenue_share',
      content: `
REVENUE SHARE & PAYMENT TERMS AGREEMENT

This Agreement outlines the revenue sharing arrangement for {{businessName}}.

1. REVENUE ALLOCATION
   - Business Owner Share: 90%
   - Citadel Fund Share: 10%

2. PAYMENT SCHEDULE
   {{paymentSchedule}}

3. REVENUE SOURCES
   {{revenueSources}}

4. PAYMENT METHODS
   {{paymentMethods}}

5. DISPUTE RESOLUTION
   {{disputeResolution}}

6. SIGNATURES
   Business Owner: _________________ Date: _______
   Fund Representative: _________________ Date: _______
      `,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateUUID(),
      name: 'IP Assignment',
      type: 'ip',
      content: `
INTELLECTUAL PROPERTY ASSIGNMENT AGREEMENT

This IP Assignment Agreement ("Agreement") is entered into for {{businessName}}.

1. INTELLECTUAL PROPERTY DEFINITION
   {{ipDefinition}}

2. OWNERSHIP ASSIGNMENT
   {{ownershipTerms}}

3. USAGE RIGHTS
   {{usageRights}}

4. PROTECTION MEASURES
   {{protectionMeasures}}

5. DISPUTE RESOLUTION
   {{ipDisputes}}

6. SIGNATURES
   Business Owner: _________________ Date: _______
   Witness: _________________ Date: _______
      `,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateUUID(),
      name: 'Compliance Checklist',
      type: 'compliance',
      content: `
COMPLIANCE CHECKLIST

Business: {{businessName}}
Date: {{date}}

1. LEGAL COMPLIANCE
   ☐ Business registration completed
   ☐ Tax ID obtained
   ☐ Business license acquired
   ☐ Insurance policies in place

2. FINANCIAL COMPLIANCE
   ☐ Accounting system established
   ☐ Bank account opened
   ☐ Financial records organized
   ☐ Tax filing schedule created

3. OPERATIONAL COMPLIANCE
   ☐ Employee policies documented
   ☐ Data protection measures implemented
   ☐ Safety protocols established
   ☐ Quality standards defined

4. CITADEL FUND COMPLIANCE
   ☐ Revenue tracking system set up
   ☐ Fund allocation process established
   ☐ Reporting procedures documented
   ☐ Audit trail configured

5. SIGN-OFF
   Business Owner: _________________ Date: _______
   Compliance Officer: _________________ Date: _______
      `,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  defaultTemplates.forEach((template) => {
    templates.set(template.id, template);
  });
}

export class LegalService {
  constructor() {
    initializeDefaultTemplates();
  }

  /**
   * Get all legal templates
   * Requirements: 3.1, 3.2
   */
  async getTemplates(): Promise<LegalTemplate[]> {
    return Array.from(templates.values());
  }

  /**
   * Get template by ID
   * Requirements: 3.1, 3.2
   */
  async getTemplateById(templateId: string): Promise<LegalTemplate> {
    const template = templates.get(templateId);

    if (!template) {
      throw new AppError(404, 'Legal template not found');
    }

    return template;
  }

  /**
   * Get template by type
   * Requirements: 3.1, 3.2
   */
  async getTemplateByType(type: string): Promise<LegalTemplate | null> {
    const template = Array.from(templates.values()).find((t) => t.type === type);
    return template || null;
  }

  /**
   * Create legal document from template
   * Requirements: 3.2, 3.3
   */
  async generateDocument(
    businessId: string,
    data: LegalDocumentRequest,
    userId: string
  ): Promise<LegalDocument> {
    const template = await this.getTemplateById(data.templateId);

    const documentId = generateUUID();
    const now = new Date();

    // Populate template with data
    let content = template.content;
    for (const [key, value] of Object.entries(data.data)) {
      const placeholder = `{{${key}}}`;
      content = content.replace(new RegExp(placeholder, 'g'), String(value));
    }

    const document: LegalDocument = {
      id: documentId,
      businessId,
      templateId: data.templateId,
      templateVersion: template.version,
      content,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    documents.set(documentId, document);

    return document;
  }

  /**
   * Get document by ID
   * Requirements: 3.2, 3.3
   */
  async getDocumentById(documentId: string, userId: string): Promise<LegalDocument> {
    const document = documents.get(documentId);

    if (!document) {
      throw new AppError(404, 'Legal document not found');
    }

    // TODO: Verify user has access to this document through business ownership
    return document;
  }

  /**
   * Get documents for a business
   * Requirements: 3.2, 3.3
   */
  async getBusinessDocuments(
    businessId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{
    documents: LegalDocument[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const businessDocs = Array.from(documents.values()).filter((d) => d.businessId === businessId);

    const total = businessDocs.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      documents: businessDocs.slice(start, end),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Sign document
   * Requirements: 3.4, 3.5, 7.1
   */
  async signDocument(
    documentId: string,
    userId: string,
    data: DocumentSigningRequest,
    ipAddress: string,
    userAgent: string
  ): Promise<LegalDocument> {
    const document = await this.getDocumentById(documentId, userId);

    if (document.status === 'signed') {
      throw new AppError(400, 'Document is already signed');
    }

    if (document.status === 'archived') {
      throw new AppError(400, 'Cannot sign archived document');
    }

    // Validate signature hash format (SHA256 produces 64 character hex string)
    if (!/^[a-f0-9]{64}$/i.test(data.signatureHash)) {
      throw new AppError(400, 'Invalid signature hash format');
    }

    document.status = 'signed';
    document.signedAt = new Date();
    document.signerId = userId;
    document.signatureHash = data.signatureHash;
    document.ipAddress = ipAddress;
    document.userAgent = userAgent;
    document.updatedAt = new Date();

    documents.set(documentId, document);

    return document;
  }

  /**
   * Update document
   * Requirements: 3.2, 3.3
   */
  async updateDocument(
    documentId: string,
    userId: string,
    data: Partial<LegalDocument>
  ): Promise<LegalDocument> {
    const document = await this.getDocumentById(documentId, userId);

    if (document.status === 'signed') {
      throw new AppError(400, 'Cannot update signed document');
    }

    if (data.content) {
      document.content = data.content;
    }

    if (data.status) {
      document.status = data.status;
    }

    document.updatedAt = new Date();
    documents.set(documentId, document);

    return document;
  }

  /**
   * Archive document
   * Requirements: 3.2, 3.3
   */
  async archiveDocument(documentId: string): Promise<LegalDocument> {
    const document = documents.get(documentId);

    if (!document) {
      throw new AppError(404, 'Legal document not found');
    }

    document.status = 'archived';
    document.updatedAt = new Date();
    documents.set(documentId, document);

    return document;
  }

  /**
   * Get document audit trail
   * Requirements: 3.4, 3.5, 7.1
   */
  async getDocumentAuditTrail(documentId: string, userId: string): Promise<{
    documentId: string;
    auditEntries: Array<{
      action: string;
      timestamp: Date;
      userId?: string;
      ipAddress?: string;
      details: string;
    }>;
    totalCount: number;
  }> {
    const document = await this.getDocumentById(documentId, userId);

    const auditEntries = [];

    // Document creation
    auditEntries.push({
      action: 'created',
      timestamp: document.createdAt,
      details: `Document created from template ${document.templateId}`,
    });

    // Document update
    if (document.updatedAt > document.createdAt) {
      auditEntries.push({
        action: 'updated',
        timestamp: document.updatedAt,
        details: 'Document content updated',
      });
    }

    // Document signing
    if (document.status === 'signed' && document.signedAt) {
      auditEntries.push({
        action: 'signed',
        timestamp: document.signedAt,
        userId: document.signerId,
        ipAddress: document.ipAddress,
        details: `Document signed with hash: ${document.signatureHash?.substring(0, 16)}...`,
      });
    }

    // Document archival
    if (document.status === 'archived') {
      auditEntries.push({
        action: 'archived',
        timestamp: document.updatedAt,
        details: 'Document archived',
      });
    }

    return {
      documentId,
      auditEntries,
      totalCount: auditEntries.length,
    };
  }



  /**
   * Create new template version
   * Requirements: 3.1, 3.2
   */
  async createTemplateVersion(templateId: string, updatedContent: string): Promise<LegalTemplate> {
    const template = await this.getTemplateById(templateId);

    const newTemplate: LegalTemplate = {
      id: generateUUID(),
      name: template.name,
      type: template.type,
      content: updatedContent,
      version: template.version + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    templates.set(newTemplate.id, newTemplate);

    return newTemplate;
  }

  /**
   * Validate template placeholders
   * Requirements: 3.1, 3.2
   */
  async validateTemplatePlaceholders(templateId: string, data: Record<string, any>): Promise<{
    valid: boolean;
    missingFields: string[];
  }> {
    const template = await this.getTemplateById(templateId);

    // Extract placeholders from template
    const placeholderRegex = /{{(\w+)}}/g;
    const matches = template.content.matchAll(placeholderRegex);
    const requiredFields = new Set<string>();

    for (const match of matches) {
      requiredFields.add(match[1]);
    }

    // Check which fields are missing
    const missingFields = Array.from(requiredFields).filter((field) => !(field in data));

    return {
      valid: missingFields.length === 0,
      missingFields,
    };
  }
}

export const legalService = new LegalService();
