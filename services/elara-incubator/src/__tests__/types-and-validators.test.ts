import { validators, ValidationError } from '../utils/validators.js';
import { validateAgainstSchema, validationSchemas } from '../utils/validation-schemas.js';
import {
  Business,
  RevenueTransaction,
  Payment,
  CitadelFund,
  ApiResponse,
  PaginatedResponse,
} from '../types/index.js';

describe('Types and Validators', () => {
  describe('Business Validators', () => {
    it('should validate valid business creation request', () => {
      const validData = {
        businessName: 'Tech Startup',
        businessType: 'e-commerce',
      };
      const result = validators.validateBusinessCreation(validData);
      expect(result.businessName).toBe('Tech Startup');
      expect(result.businessType).toBe('e-commerce');
    });

    it('should throw error for missing business name', () => {
      const invalidData = {
        businessType: 'e-commerce',
      };
      expect(() => validators.validateBusinessCreation(invalidData)).toThrow(ValidationError);
    });

    it('should throw error for empty business name', () => {
      const invalidData = {
        businessName: '',
        businessType: 'e-commerce',
      };
      expect(() => validators.validateBusinessCreation(invalidData)).toThrow(ValidationError);
    });

    it('should throw error for business name exceeding max length', () => {
      const invalidData = {
        businessName: 'a'.repeat(256),
        businessType: 'e-commerce',
      };
      expect(() => validators.validateBusinessCreation(invalidData)).toThrow(ValidationError);
    });

    it('should validate business type correctly', () => {
      expect(validators.validateBusinessType('ride-sharing')).toBe(true);
      expect(validators.validateBusinessType('tutoring')).toBe(true);
      expect(validators.validateBusinessType('e-commerce')).toBe(true);
      expect(validators.validateBusinessType('gig-platform')).toBe(true);
      expect(validators.validateBusinessType('custom')).toBe(true);
      expect(validators.validateBusinessType('invalid')).toBe(false);
    });

    it('should validate business status correctly', () => {
      expect(validators.validateBusinessStatus('draft')).toBe(true);
      expect(validators.validateBusinessStatus('in_progress')).toBe(true);
      expect(validators.validateBusinessStatus('launched')).toBe(true);
      expect(validators.validateBusinessStatus('active')).toBe(true);
      expect(validators.validateBusinessStatus('invalid')).toBe(false);
    });
  });

  describe('Revenue Validators', () => {
    it('should validate valid revenue transaction', () => {
      const validData = {
        amount: 1000.50,
        source: 'Direct Sales',
        currency: 'USD',
      };
      const result = validators.validateRevenueTransaction(validData);
      expect(result.amount).toBe(1000.50);
      expect(result.source).toBe('Direct Sales');
      expect(result.currency).toBe('USD');
    });

    it('should throw error for negative amount', () => {
      const invalidData = {
        amount: -100,
        source: 'Direct Sales',
      };
      expect(() => validators.validateRevenueTransaction(invalidData)).toThrow(ValidationError);
    });

    it('should throw error for zero amount', () => {
      const invalidData = {
        amount: 0,
        source: 'Direct Sales',
      };
      expect(() => validators.validateRevenueTransaction(invalidData)).toThrow(ValidationError);
    });

    it('should throw error for missing source', () => {
      const invalidData = {
        amount: 1000,
      };
      expect(() => validators.validateRevenueTransaction(invalidData)).toThrow(ValidationError);
    });

    it('should validate currency correctly', () => {
      expect(validators.validateCurrency('USD')).toBe(true);
      expect(validators.validateCurrency('EUR')).toBe(true);
      expect(validators.validateCurrency('GBP')).toBe(true);
      expect(validators.validateCurrency('invalid')).toBe(false);
    });

    it('should validate decimal amounts correctly', () => {
      expect(validators.validateDecimalAmount(100.50)).toBe(true);
      expect(validators.validateDecimalAmount(100.5)).toBe(true);
      expect(validators.validateDecimalAmount(100)).toBe(true);
      expect(validators.validateDecimalAmount(100.999)).toBe(false);
      expect(validators.validateDecimalAmount(-100)).toBe(false);
    });
  });

  describe('Payment Validators', () => {
    it('should validate valid payment request', () => {
      const validData = {
        amount: 500.00,
        type: 'revenue',
      };
      const result = validators.validatePayment(validData);
      expect(result.amount).toBe(500.00);
      expect(result.type).toBe('revenue');
    });

    it('should throw error for invalid payment type', () => {
      const invalidData = {
        amount: 500,
        type: 'invalid',
      };
      expect(() => validators.validatePayment(invalidData)).toThrow(ValidationError);
    });

    it('should validate payment status correctly', () => {
      expect(validators.validatePaymentStatus('pending')).toBe(true);
      expect(validators.validatePaymentStatus('processing')).toBe(true);
      expect(validators.validatePaymentStatus('completed')).toBe(true);
      expect(validators.validatePaymentStatus('failed')).toBe(true);
      expect(validators.validatePaymentStatus('invalid')).toBe(false);
    });
  });

  describe('Legal Document Validators', () => {
    it('should validate valid legal document request', () => {
      const validData = {
        templateId: '550e8400-e29b-41d4-a716-446655440000',
        data: { businessName: 'Test Business' },
      };
      const result = validators.validateLegalDocument(validData);
      expect(result.templateId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result.data.businessName).toBe('Test Business');
    });

    it('should throw error for missing template ID', () => {
      const invalidData = {
        data: { businessName: 'Test Business' },
      };
      expect(() => validators.validateLegalDocument(invalidData)).toThrow(ValidationError);
    });

    it('should validate document status correctly', () => {
      expect(validators.validateDocumentStatus('draft')).toBe(true);
      expect(validators.validateDocumentStatus('signed')).toBe(true);
      expect(validators.validateDocumentStatus('archived')).toBe(true);
      expect(validators.validateDocumentStatus('invalid')).toBe(false);
    });

    it('should validate template type correctly', () => {
      expect(validators.validateTemplateType('registration')).toBe(true);
      expect(validators.validateTemplateType('operating')).toBe(true);
      expect(validators.validateTemplateType('revenue_share')).toBe(true);
      expect(validators.validateTemplateType('ip')).toBe(true);
      expect(validators.validateTemplateType('compliance')).toBe(true);
      expect(validators.validateTemplateType('invalid')).toBe(false);
    });
  });

  describe('Document Signing Validators', () => {
    it('should validate valid document signing request', () => {
      const validData = {
        documentId: '550e8400-e29b-41d4-a716-446655440000',
        signatureHash: 'abc123def456',
      };
      const result = validators.validateDocumentSigning(validData);
      expect(result.documentId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result.signatureHash).toBe('abc123def456');
    });

    it('should throw error for invalid document ID format', () => {
      const invalidData = {
        documentId: 'invalid-id',
        signatureHash: 'abc123',
      };
      expect(() => validators.validateDocumentSigning(invalidData)).toThrow(ValidationError);
    });
  });

  describe('Fund Distribution Validators', () => {
    it('should validate valid fund distribution request', () => {
      const validData = {
        amount: 5000.00,
        type: 'scholarship',
        description: 'Scholarship for underprivileged students',
      };
      const result = validators.validateFundDistribution(validData);
      expect(result.amount).toBe(5000.00);
      expect(result.type).toBe('scholarship');
    });

    it('should throw error for invalid distribution type', () => {
      const invalidData = {
        amount: 5000,
        type: 'invalid',
        description: 'Test',
      };
      expect(() => validators.validateFundDistribution(invalidData)).toThrow(ValidationError);
    });
  });

  describe('User Validators', () => {
    it('should validate valid user registration', () => {
      const validData = {
        email: 'user@example.com',
        name: 'John Doe',
        password: 'SecurePassword123',
      };
      const result = validators.validateUserRegistration(validData);
      expect(result.email).toBe('user@example.com');
      expect(result.name).toBe('John Doe');
    });

    it('should throw error for invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        name: 'John Doe',
        password: 'SecurePassword123',
      };
      expect(() => validators.validateUserRegistration(invalidData)).toThrow(ValidationError);
    });

    it('should throw error for short password', () => {
      const invalidData = {
        email: 'user@example.com',
        name: 'John Doe',
        password: 'short',
      };
      expect(() => validators.validateUserRegistration(invalidData)).toThrow(ValidationError);
    });

    it('should validate user login', () => {
      const validData = {
        email: 'user@example.com',
        password: 'password123',
      };
      const result = validators.validateUserLogin(validData);
      expect(result.email).toBe('user@example.com');
    });
  });

  describe('Notification Validators', () => {
    it('should validate valid notification', () => {
      const validData = {
        type: 'payment',
        title: 'Payment Received',
        message: 'Your payment has been processed successfully',
      };
      const result = validators.validateNotification(validData);
      expect(result.type).toBe('payment');
      expect(result.title).toBe('Payment Received');
    });

    it('should throw error for invalid notification type', () => {
      const invalidData = {
        type: 'invalid',
        title: 'Test',
        message: 'Test message',
      };
      expect(() => validators.validateNotification(invalidData)).toThrow(ValidationError);
    });
  });

  describe('UUID Validator', () => {
    it('should validate valid UUID', () => {
      expect(validators.validateUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(validators.validateUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
    });

    it('should reject invalid UUID', () => {
      expect(validators.validateUUID('invalid-uuid')).toBe(false);
      expect(validators.validateUUID('550e8400-e29b-41d4-a716')).toBe(false);
    });
  });

  describe('Pagination Validator', () => {
    it('should validate pagination parameters', () => {
      const result = validators.validatePagination(2, 20);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(20);
    });

    it('should default to page 1 if invalid', () => {
      const result = validators.validatePagination(0, 10);
      expect(result.page).toBe(1);
    });

    it('should cap page size at 100', () => {
      const result = validators.validatePagination(1, 200);
      expect(result.pageSize).toBe(100);
    });
  });

  describe('Ownership Percentage Validator', () => {
    it('should validate correct ownership split', () => {
      expect(validators.validateOwnershipPercentage(90, 10)).toBe(true);
      expect(validators.validateOwnershipPercentage(80, 20)).toBe(true);
    });

    it('should reject incorrect ownership split', () => {
      expect(validators.validateOwnershipPercentage(90, 5)).toBe(false);
      expect(validators.validateOwnershipPercentage(100, 10)).toBe(false);
    });
  });

  describe('Date Range Validator', () => {
    it('should validate valid date range', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      expect(validators.validateDateRange(start, end)).toBe(true);
    });

    it('should reject invalid date range', () => {
      const start = new Date('2024-12-31');
      const end = new Date('2024-01-01');
      expect(validators.validateDateRange(start, end)).toBe(false);
    });
  });

  describe('IP Address Validator', () => {
    it('should validate valid IPv4 addresses', () => {
      expect(validators.validateIPAddress('192.168.1.1')).toBe(true);
      expect(validators.validateIPAddress('10.0.0.1')).toBe(true);
    });

    it('should reject invalid IP addresses', () => {
      expect(validators.validateIPAddress('256.256.256.256')).toBe(false);
      expect(validators.validateIPAddress('invalid')).toBe(false);
    });
  });

  describe('Validation Schemas', () => {
    it('should validate business creation schema', () => {
      const validData = {
        businessName: 'Test Business',
        businessType: 'e-commerce',
      };
      const result = validateAgainstSchema(validData, validationSchemas.businessCreation);
      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('should detect missing required fields', () => {
      const invalidData = {
        businessName: 'Test Business',
      };
      const result = validateAgainstSchema(invalidData, validationSchemas.businessCreation);
      expect(result.valid).toBe(false);
      expect(result.errors.businessType).toBeDefined();
    });

    it('should validate revenue transaction schema', () => {
      const validData = {
        amount: 1000.50,
        source: 'Direct Sales',
      };
      const result = validateAgainstSchema(validData, validationSchemas.revenueTransaction);
      expect(result.valid).toBe(true);
    });

    it('should validate payment schema', () => {
      const validData = {
        amount: 500.00,
        type: 'revenue',
      };
      const result = validateAgainstSchema(validData, validationSchemas.payment);
      expect(result.valid).toBe(true);
    });

    it('should validate user registration schema', () => {
      const validData = {
        email: 'user@example.com',
        name: 'John Doe',
        password: 'SecurePassword123',
      };
      const result = validateAgainstSchema(validData, validationSchemas.userRegistration);
      expect(result.valid).toBe(true);
    });

    it('should detect invalid enum values', () => {
      const invalidData = {
        businessName: 'Test',
        businessType: 'invalid-type',
      };
      const result = validateAgainstSchema(invalidData, validationSchemas.businessCreation);
      expect(result.valid).toBe(false);
      expect(result.errors.businessType).toBeDefined();
    });

    it('should detect string length violations', () => {
      const invalidData = {
        businessName: 'a'.repeat(256),
        businessType: 'e-commerce',
      };
      const result = validateAgainstSchema(invalidData, validationSchemas.businessCreation);
      expect(result.valid).toBe(false);
      expect(result.errors.businessName).toBeDefined();
    });
  });

  describe('Type Definitions', () => {
    it('should allow creating Business type', () => {
      const business: Business = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        userId: '550e8400-e29b-41d4-a716-446655440001',
        businessName: 'Test Business',
        businessType: 'e-commerce',
        status: 'draft',
        userOwnership: 90,
        citadelFundShare: 10,
        currentWizardStep: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(business.businessName).toBe('Test Business');
    });

    it('should allow creating RevenueTransaction type', () => {
      const transaction: RevenueTransaction = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        businessId: '550e8400-e29b-41d4-a716-446655440001',
        amount: 1000,
        currency: 'USD',
        source: 'Direct Sales',
        receivedAt: new Date(),
        status: 'completed',
        createdAt: new Date(),
      };
      expect(transaction.amount).toBe(1000);
    });

    it('should allow creating Payment type', () => {
      const payment: Payment = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        businessId: '550e8400-e29b-41d4-a716-446655440001',
        userId: '550e8400-e29b-41d4-a716-446655440002',
        amount: 500,
        type: 'revenue',
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(payment.type).toBe('revenue');
    });

    it('should allow creating CitadelFund type', () => {
      const fund: CitadelFund = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        balance: 50000,
        totalContributions: 100000,
        totalDistributions: 50000,
        updatedAt: new Date(),
      };
      expect(fund.balance).toBe(50000);
    });

    it('should allow creating ApiResponse type', () => {
      const response: ApiResponse<Business> = {
        success: true,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          userId: '550e8400-e29b-41d4-a716-446655440001',
          businessName: 'Test',
          businessType: 'e-commerce',
          status: 'draft',
          userOwnership: 90,
          citadelFundShare: 10,
          currentWizardStep: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
      expect(response.success).toBe(true);
    });

    it('should allow creating PaginatedResponse type', () => {
      const response: PaginatedResponse<Business> = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
      expect(response.page).toBe(1);
    });
  });
});
