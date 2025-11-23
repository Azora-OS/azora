import {
  BusinessCreationRequest,
  RevenueTransactionRequest,
  PaymentRequest,
  LegalDocumentRequest,
  UserRegistrationRequest,
  UserLoginRequest,
  DocumentSigningRequest,
  FundDistributionRequest,
  NotificationRequest,
} from '../types/index.js';

export class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validators = {
  // Business Validators
  validateBusinessCreation: (data: any): BusinessCreationRequest => {
    if (!data.businessName || typeof data.businessName !== 'string' || data.businessName.trim().length === 0) {
      throw new ValidationError('businessName', 'Business name is required and must be a non-empty string');
    }
    if (!data.businessType || typeof data.businessType !== 'string' || data.businessType.trim().length === 0) {
      throw new ValidationError('businessType', 'Business type is required and must be a non-empty string');
    }
    if (data.businessName.length > 255) {
      throw new ValidationError('businessName', 'Business name must not exceed 255 characters');
    }
    return {
      businessName: data.businessName.trim(),
      businessType: data.businessType.trim(),
      templateId: data.templateId || undefined,
    };
  },

  // Revenue Validators
  validateRevenueTransaction: (data: any): RevenueTransactionRequest => {
    if (typeof data.amount !== 'number' || data.amount <= 0) {
      throw new ValidationError('amount', 'Amount must be a positive number');
    }
    if (!data.source || typeof data.source !== 'string' || data.source.trim().length === 0) {
      throw new ValidationError('source', 'Revenue source is required');
    }
    if (data.currency && typeof data.currency !== 'string') {
      throw new ValidationError('currency', 'Currency must be a string');
    }
    return {
      amount: data.amount,
      currency: data.currency || 'USD',
      source: data.source.trim(),
      receivedAt: data.receivedAt ? new Date(data.receivedAt) : new Date(),
    };
  },

  // Payment Validators
  validatePayment: (data: any): PaymentRequest => {
    if (typeof data.amount !== 'number' || data.amount <= 0) {
      throw new ValidationError('amount', 'Amount must be a positive number');
    }
    const validTypes = ['revenue', 'refund', 'fund_distribution'];
    if (!validTypes.includes(data.type)) {
      throw new ValidationError('type', `Payment type must be one of: ${validTypes.join(', ')}`);
    }
    return {
      amount: data.amount,
      type: data.type,
      paymentMethod: data.paymentMethod || undefined,
    };
  },

  // Legal Document Validators
  validateLegalDocument: (data: any): LegalDocumentRequest => {
    if (!data.templateId || typeof data.templateId !== 'string') {
      throw new ValidationError('templateId', 'Template ID is required');
    }
    if (!data.data || typeof data.data !== 'object') {
      throw new ValidationError('data', 'Document data is required and must be an object');
    }
    return {
      templateId: data.templateId,
      data: data.data,
    };
  },

  // User Validators
  validateUserRegistration: (data: any): UserRegistrationRequest => {
    if (!data.email || typeof data.email !== 'string') {
      throw new ValidationError('email', 'Email is required');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new ValidationError('email', 'Invalid email format');
    }
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      throw new ValidationError('name', 'Name is required');
    }
    if (!data.password || typeof data.password !== 'string' || data.password.length < 8) {
      throw new ValidationError('password', 'Password must be at least 8 characters long');
    }
    return {
      email: data.email.toLowerCase(),
      name: data.name.trim(),
      password: data.password,
    };
  },

  validateUserLogin: (data: any): UserLoginRequest => {
    if (!data.email || typeof data.email !== 'string') {
      throw new ValidationError('email', 'Email is required');
    }
    if (!data.password || typeof data.password !== 'string') {
      throw new ValidationError('password', 'Password is required');
    }
    return {
      email: data.email.toLowerCase(),
      password: data.password,
    };
  },

  // UUID Validator
  validateUUID: (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  },

  // Pagination Validator
  validatePagination: (page: any, pageSize: any): { page: number; pageSize: number } => {
    let p = parseInt(page) || 1;
    let ps = parseInt(pageSize) || 10;
    
    if (p < 1) {p = 1;}
    if (ps < 1) {ps = 10;}
    if (ps > 100) {ps = 100;}
    
    return { page: p, pageSize: ps };
  },

  // Document Signing Validator
  validateDocumentSigning: (data: any): DocumentSigningRequest => {
    if (!data.documentId || typeof data.documentId !== 'string') {
      throw new ValidationError('documentId', 'Document ID is required');
    }
    if (!validators.validateUUID(data.documentId)) {
      throw new ValidationError('documentId', 'Invalid document ID format');
    }
    if (!data.signatureHash || typeof data.signatureHash !== 'string') {
      throw new ValidationError('signatureHash', 'Signature hash is required');
    }
    return {
      documentId: data.documentId,
      signatureHash: data.signatureHash,
    };
  },

  // Fund Distribution Validator
  validateFundDistribution: (data: any): FundDistributionRequest => {
    if (typeof data.amount !== 'number' || data.amount <= 0) {
      throw new ValidationError('amount', 'Amount must be a positive number');
    }
    const validTypes = ['scholarship', 'project', 'community'];
    if (!validTypes.includes(data.type)) {
      throw new ValidationError('type', `Distribution type must be one of: ${validTypes.join(', ')}`);
    }
    if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
      throw new ValidationError('description', 'Description is required');
    }
    return {
      amount: data.amount,
      type: data.type,
      description: data.description.trim(),
    };
  },

  // Notification Validator
  validateNotification: (data: any): NotificationRequest => {
    const validTypes = ['payment', 'milestone', 'mentorship', 'fund_distribution', 'reminder'];
    if (!validTypes.includes(data.type)) {
      throw new ValidationError('type', `Notification type must be one of: ${validTypes.join(', ')}`);
    }
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
      throw new ValidationError('title', 'Title is required');
    }
    if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
      throw new ValidationError('message', 'Message is required');
    }
    if (data.title.length > 255) {
      throw new ValidationError('title', 'Title must not exceed 255 characters');
    }
    if (data.message.length > 1000) {
      throw new ValidationError('message', 'Message must not exceed 1000 characters');
    }
    return {
      type: data.type,
      title: data.title.trim(),
      message: data.message.trim(),
      data: data.data || undefined,
    };
  },

  // Business Type Validator
  validateBusinessType: (type: string): boolean => {
    const validTypes = ['ride-sharing', 'tutoring', 'e-commerce', 'gig-platform', 'custom'];
    return validTypes.includes(type);
  },

  // Currency Validator
  validateCurrency: (currency: string): boolean => {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR'];
    return validCurrencies.includes(currency.toUpperCase());
  },

  // Decimal Amount Validator
  validateDecimalAmount: (amount: any, minValue: number = 0, maxValue: number = 999999999.99): boolean => {
    if (typeof amount !== 'number') {return false;}
    if (amount < minValue || amount > maxValue) {return false;}
    const decimalPlaces = (amount.toString().split('.')[1] || '').length;
    return decimalPlaces <= 2;
  },

  // Ownership Percentage Validator
  validateOwnershipPercentage: (userOwnership: number, citadelShare: number): boolean => {
    const total = userOwnership + citadelShare;
    return Math.abs(total - 100) < 0.01; // Allow for floating point precision
  },

  // Date Range Validator
  validateDateRange: (startDate: Date, endDate: Date): boolean => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start < end;
  },

  // IP Address Validator
  validateIPAddress: (ip: string): boolean => {
    const ipv4Regex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  },

  // Business Status Validator
  validateBusinessStatus: (status: string): boolean => {
    const validStatuses = ['draft', 'in_progress', 'launched', 'active'];
    return validStatuses.includes(status);
  },

  // Payment Status Validator
  validatePaymentStatus: (status: string): boolean => {
    const validStatuses = ['pending', 'processing', 'completed', 'failed'];
    return validStatuses.includes(status);
  },

  // Document Status Validator
  validateDocumentStatus: (status: string): boolean => {
    const validStatuses = ['draft', 'signed', 'archived'];
    return validStatuses.includes(status);
  },

  // Template Type Validator
  validateTemplateType: (type: string): boolean => {
    const validTypes = ['registration', 'operating', 'revenue_share', 'ip', 'compliance'];
    return validTypes.includes(type);
  },
};
