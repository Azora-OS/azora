import { documentGenerationService } from '../services/document-generation.service.js';
import { legalService } from '../services/legal.service.js';

describe('DocumentGenerationService', () => {
  const mockBusinessId = 'test-business-123';
  const mockUserId = 'test-user-123';
  let templateId: string;

  beforeAll(async () => {
    // Get a template to use for testing
    const templates = await legalService.getTemplates();
    templateId = templates[0].id;
  });

  describe('generateDocument', () => {
    it('should generate a document from template with data population', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'Test Business',
          businessType: 'e-commerce',
          ownerName: 'John Doe',
          date: '2024-01-01',
          additionalTerms: 'Standard terms apply',
        },
      };

      const document = await documentGenerationService.generateDocument(
        mockBusinessId,
        documentData,
        mockUserId
      );

      expect(document).toBeDefined();
      expect(document.id).toBeDefined();
      expect(document.businessId).toBe(mockBusinessId);
      expect(document.templateId).toBe(templateId);
      expect(document.status).toBe('draft');
      expect(document.content).toContain('Test Business');
      expect(document.content).toContain('John Doe');
    });

    it('should throw error when required fields are missing', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'Test Business',
          // Missing other required fields
        },
      };

      await expect(
        documentGenerationService.generateDocument(mockBusinessId, documentData, mockUserId)
      ).rejects.toThrow();
    });

    it('should throw error when template does not exist', async () => {
      const documentData = {
        templateId: 'non-existent-template',
        data: {
          businessName: 'Test Business',
        },
      };

      await expect(
        documentGenerationService.generateDocument(mockBusinessId, documentData, mockUserId)
      ).rejects.toThrow();
    });
  });

  describe('generatePDF', () => {
    it('should generate PDF from document content', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'PDF Test Business',
          businessType: 'tutoring',
          ownerName: 'Jane Doe',
          date: '2024-01-01',
          additionalTerms: 'PDF test terms',
        },
      };

      const document = await documentGenerationService.generateDocument(
        mockBusinessId,
        documentData,
        mockUserId
      );

      const pdfBuffer = await documentGenerationService.generatePDF(document.id, mockUserId);

      expect(pdfBuffer).toBeDefined();
      expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it('should throw error when document does not exist', async () => {
      await expect(
        documentGenerationService.generatePDF('non-existent-doc', mockUserId)
      ).rejects.toThrow();
    });
  });

  describe('generateBatchDocuments', () => {
    it('should generate multiple documents in batch', async () => {
      const templates = await legalService.getTemplates();
      const batchData = [
        {
          templateId: templates[0].id,
          data: {
            businessName: 'Batch Business 1',
            businessType: 'ride-sharing',
            ownerName: 'Owner 1',
            date: '2024-01-01',
            additionalTerms: 'Terms 1',
          },
        },
        {
          templateId: templates[1].id,
          data: {
            businessName: 'Batch Business 2',
            businessActivity: 'Operations',
            location: 'New York',
            fiscalYear: '2024',
            managementStructure: 'Solo',
            decisionMaking: 'Owner decides',
            amendmentProcedures: 'Written notice',
          },
        },
      ];

      const documents = await documentGenerationService.generateBatchDocuments(
        mockBusinessId,
        batchData,
        mockUserId
      );

      expect(documents).toBeDefined();
      expect(documents.length).toBeGreaterThan(0);
      expect(documents[0].content).toContain('Batch Business 1');
    });
  });

  describe('updateGeneratedDocument', () => {
    it('should update document content', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'Update Test Business',
          businessType: 'gig-platform',
          ownerName: 'Update Owner',
          date: '2024-01-01',
          additionalTerms: 'Update terms',
        },
      };

      const document = await documentGenerationService.generateDocument(
        mockBusinessId,
        documentData,
        mockUserId
      );

      const updatedContent = document.content + '\n\nUpdated content added.';
      const updated = await documentGenerationService.updateGeneratedDocument(
        document.id,
        mockUserId,
        {
          content: updatedContent,
        }
      );

      expect(updated.content).toContain('Updated content added');
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(document.updatedAt.getTime());
    });

    it('should update document status', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'Status Test Business',
          businessType: 'e-commerce',
          ownerName: 'Status Owner',
          date: '2024-01-01',
          additionalTerms: 'Status terms',
        },
      };

      const document = await documentGenerationService.generateDocument(
        mockBusinessId,
        documentData,
        mockUserId
      );

      const updated = await documentGenerationService.updateGeneratedDocument(
        document.id,
        mockUserId,
        {
          status: 'signed',
        }
      );

      expect(updated.status).toBe('signed');
    });
  });

  describe('exportAsText', () => {
    it('should export document as text', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'Export Test Business',
          businessType: 'tutoring',
          ownerName: 'Export Owner',
          date: '2024-01-01',
          additionalTerms: 'Export terms',
        },
      };

      const document = await documentGenerationService.generateDocument(
        mockBusinessId,
        documentData,
        mockUserId
      );

      const text = await documentGenerationService.exportAsText(document.id, mockUserId);

      expect(typeof text).toBe('string');
      expect(text).toContain('Export Test Business');
    });
  });

  describe('exportAsJSON', () => {
    it('should export document as JSON', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'JSON Export Business',
          businessType: 'ride-sharing',
          ownerName: 'JSON Owner',
          date: '2024-01-01',
          additionalTerms: 'JSON terms',
        },
      };

      const document = await documentGenerationService.generateDocument(
        mockBusinessId,
        documentData,
        mockUserId
      );

      const json = await documentGenerationService.exportAsJSON(document.id, mockUserId);

      expect(json).toBeDefined();
      expect(json.id).toBe(document.id);
      expect(json.businessId).toBe(mockBusinessId);
      expect(json.status).toBe('draft');
      expect(json.content).toContain('JSON Export Business');
    });
  });

  describe('getGenerationHistory', () => {
    it('should retrieve generation history for a business', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'History Test Business',
          businessType: 'e-commerce',
          ownerName: 'History Owner',
          date: '2024-01-01',
          additionalTerms: 'History terms',
        },
      };

      await documentGenerationService.generateDocument(mockBusinessId, documentData, mockUserId);

      const history = await documentGenerationService.getGenerationHistory(mockBusinessId);

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0]).toHaveProperty('documentId');
      expect(history[0]).toHaveProperty('templateId');
      expect(history[0]).toHaveProperty('generatedAt');
      expect(history[0]).toHaveProperty('status');
    });
  });

  describe('getDocumentVersions', () => {
    it('should retrieve version history for a document', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'Version Test Business',
          businessType: 'gig-platform',
          ownerName: 'Version Owner',
          date: '2024-01-01',
          additionalTerms: 'Version terms',
        },
      };

      const document = await documentGenerationService.generateDocument(
        mockBusinessId,
        documentData,
        mockUserId
      );

      // Update document to create a new version
      await documentGenerationService.updateGeneratedDocument(document.id, mockUserId, {
        content: document.content + '\n\nVersion 2 content',
      });

      const versions = await documentGenerationService.getDocumentVersions(
        document.id,
        mockUserId
      );

      expect(Array.isArray(versions)).toBe(true);
      expect(versions.length).toBeGreaterThanOrEqual(1);
      expect(versions[0]).toHaveProperty('version');
      expect(versions[0]).toHaveProperty('content');
      expect(versions[0]).toHaveProperty('status');
      expect(versions[0]).toHaveProperty('updatedAt');
    });
  });

  describe('restoreDocumentVersion', () => {
    it('should restore document to previous version', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'Restore Test Business',
          businessType: 'tutoring',
          ownerName: 'Restore Owner',
          date: '2024-01-01',
          additionalTerms: 'Restore terms',
        },
      };

      const document = await documentGenerationService.generateDocument(
        mockBusinessId,
        documentData,
        mockUserId
      );

      const originalContent = document.content;

      // Update document
      await documentGenerationService.updateGeneratedDocument(document.id, mockUserId, {
        content: originalContent + '\n\nModified content',
      });

      // Restore to version 1
      const restored = await documentGenerationService.restoreDocumentVersion(
        document.id,
        mockUserId,
        1
      );

      expect(restored.content).toBe(originalContent);
    });

    it('should throw error for invalid version number', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'Invalid Version Business',
          businessType: 'e-commerce',
          ownerName: 'Invalid Owner',
          date: '2024-01-01',
          additionalTerms: 'Invalid terms',
        },
      };

      const document = await documentGenerationService.generateDocument(
        mockBusinessId,
        documentData,
        mockUserId
      );

      await expect(
        documentGenerationService.restoreDocumentVersion(document.id, mockUserId, 999)
      ).rejects.toThrow();
    });
  });

  describe('storePDF and retrievePDF', () => {
    it('should store and retrieve PDF', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'PDF Storage Business',
          businessType: 'ride-sharing',
          ownerName: 'PDF Owner',
          date: '2024-01-01',
          additionalTerms: 'PDF storage terms',
        },
      };

      const document = await documentGenerationService.generateDocument(
        mockBusinessId,
        documentData,
        mockUserId
      );

      const pdfBuffer = await documentGenerationService.generatePDF(document.id, mockUserId);
      await documentGenerationService.storePDF(document.id, pdfBuffer);

      const retrieved = await documentGenerationService.retrievePDF(document.id, mockUserId);

      expect(Buffer.isBuffer(retrieved)).toBe(true);
      expect(retrieved.length).toBe(pdfBuffer.length);
    });

    it('should throw error when retrieving non-existent PDF', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'No PDF Business',
          businessType: 'tutoring',
          ownerName: 'No PDF Owner',
          date: '2024-01-01',
          additionalTerms: 'No PDF terms',
        },
      };

      const document = await documentGenerationService.generateDocument(
        mockBusinessId,
        documentData,
        mockUserId
      );

      // Don't store PDF, just try to retrieve
      await expect(
        documentGenerationService.retrievePDF(document.id, mockUserId)
      ).rejects.toThrow();
    });
  });

  describe('validateDocumentData', () => {
    it('should validate document data successfully', async () => {
      const data = {
        businessName: 'Valid Business',
        businessType: 'e-commerce',
        ownerName: 'Valid Owner',
        date: '2024-01-01',
        additionalTerms: 'Valid terms',
      };

      const result = await documentGenerationService.validateDocumentData(templateId, data);

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should detect missing required fields', async () => {
      const data = {
        businessName: 'Incomplete Business',
        // Missing other required fields
      };

      const result = await documentGenerationService.validateDocumentData(templateId, data);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect empty field values', async () => {
      const data = {
        businessName: '',
        businessType: 'e-commerce',
        ownerName: 'Owner',
        date: '2024-01-01',
        additionalTerms: 'Terms',
      };

      const result = await documentGenerationService.validateDocumentData(templateId, data);

      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('getGenerationStats', () => {
    it('should retrieve generation statistics', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'Stats Test Business',
          businessType: 'gig-platform',
          ownerName: 'Stats Owner',
          date: '2024-01-01',
          additionalTerms: 'Stats terms',
        },
      };

      await documentGenerationService.generateDocument(mockBusinessId, documentData, mockUserId);

      const stats = await documentGenerationService.getGenerationStats(mockBusinessId);

      expect(stats).toBeDefined();
      expect(stats.totalGenerated).toBeGreaterThan(0);
      expect(stats.byStatus).toBeDefined();
      expect(stats.byTemplate).toBeDefined();
      expect(stats.byStatus['draft']).toBeGreaterThan(0);
    });
  });

  describe('generateStyledDocument', () => {
    it('should generate document with custom styling', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'Styled Business',
          businessType: 'e-commerce',
          ownerName: 'Styled Owner',
          date: '2024-01-01',
          additionalTerms: 'Styled terms',
        },
      };

      const styling = {
        fontSize: 12,
        fontFamily: 'Arial',
        headerText: 'OFFICIAL DOCUMENT',
        footerText: 'Page 1 of 1',
      };

      const document = await documentGenerationService.generateStyledDocument(
        mockBusinessId,
        documentData,
        styling
      );

      expect(document).toBeDefined();
      expect(document.content).toContain('OFFICIAL DOCUMENT');
      expect(document.content).toContain('Page 1 of 1');
    });
  });
});
