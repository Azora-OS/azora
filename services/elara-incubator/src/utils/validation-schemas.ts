/**
 * Validation Schemas
 * Defines structured validation rules for all API request/response types
 */

export interface ValidationSchema {
  fields: Record<string, FieldSchema>;
  required: string[];
}

export interface FieldSchema {
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: (string | number)[];
  message?: string;
  nested?: ValidationSchema;
}

export const validationSchemas = {
  // Business Schemas
  businessCreation: {
    fields: {
      businessName: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 255,
        message: 'Business name must be between 1 and 255 characters',
      },
      businessType: {
        type: 'string',
        required: true,
        enum: ['ride-sharing', 'tutoring', 'e-commerce', 'gig-platform', 'custom'],
        message: 'Invalid business type',
      },
      templateId: {
        type: 'string',
        required: false,
        pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        message: 'Invalid template ID format',
      },
    },
    required: ['businessName', 'businessType'],
  } as ValidationSchema,

  businessUpdate: {
    fields: {
      businessName: {
        type: 'string',
        required: false,
        minLength: 1,
        maxLength: 255,
      },
      businessType: {
        type: 'string',
        required: false,
        enum: ['ride-sharing', 'tutoring', 'e-commerce', 'gig-platform', 'custom'],
      },
      status: {
        type: 'string',
        required: false,
        enum: ['draft', 'in_progress', 'launched', 'active'],
      },
      currentWizardStep: {
        type: 'number',
        required: false,
        min: 0,
        max: 6,
      },
    },
    required: [],
  } as ValidationSchema,

  // Revenue Schemas
  revenueTransaction: {
    fields: {
      amount: {
        type: 'number',
        required: true,
        min: 0.01,
        max: 999999999.99,
        message: 'Amount must be between 0.01 and 999999999.99',
      },
      currency: {
        type: 'string',
        required: false,
        enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR'],
        message: 'Invalid currency code',
      },
      source: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 100,
        message: 'Revenue source must be between 1 and 100 characters',
      },
      receivedAt: {
        type: 'date',
        required: false,
      },
    },
    required: ['amount', 'source'],
  } as ValidationSchema,

  // Payment Schemas
  payment: {
    fields: {
      amount: {
        type: 'number',
        required: true,
        min: 0.01,
        max: 999999999.99,
      },
      type: {
        type: 'string',
        required: true,
        enum: ['revenue', 'refund', 'fund_distribution'],
        message: 'Invalid payment type',
      },
      paymentMethod: {
        type: 'string',
        required: false,
        maxLength: 100,
      },
    },
    required: ['amount', 'type'],
  } as ValidationSchema,

  // Legal Document Schemas
  legalDocument: {
    fields: {
      templateId: {
        type: 'string',
        required: true,
        pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      },
      data: {
        type: 'object',
        required: true,
        message: 'Document data is required',
      },
    },
    required: ['templateId', 'data'],
  } as ValidationSchema,

  documentSigning: {
    fields: {
      documentId: {
        type: 'string',
        required: true,
        pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      },
      signatureHash: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 255,
      },
    },
    required: ['documentId', 'signatureHash'],
  } as ValidationSchema,

  // Fund Schemas
  fundDistribution: {
    fields: {
      amount: {
        type: 'number',
        required: true,
        min: 0.01,
        max: 999999999.99,
      },
      type: {
        type: 'string',
        required: true,
        enum: ['scholarship', 'project', 'community'],
      },
      description: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 500,
      },
    },
    required: ['amount', 'type', 'description'],
  } as ValidationSchema,

  // User Schemas
  userRegistration: {
    fields: {
      email: {
        type: 'string',
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Invalid email format',
      },
      name: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 255,
      },
      password: {
        type: 'string',
        required: true,
        minLength: 8,
        maxLength: 255,
        message: 'Password must be at least 8 characters',
      },
    },
    required: ['email', 'name', 'password'],
  } as ValidationSchema,

  userLogin: {
    fields: {
      email: {
        type: 'string',
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      },
      password: {
        type: 'string',
        required: true,
        minLength: 1,
      },
    },
    required: ['email', 'password'],
  } as ValidationSchema,

  // Notification Schemas
  notification: {
    fields: {
      type: {
        type: 'string',
        required: true,
        enum: ['payment', 'milestone', 'mentorship', 'fund_distribution', 'reminder'],
      },
      title: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 255,
      },
      message: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 1000,
      },
      data: {
        type: 'object',
        required: false,
      },
    },
    required: ['type', 'title', 'message'],
  } as ValidationSchema,
};

/**
 * Validates data against a schema
 */
export function validateAgainstSchema(data: any, schema: ValidationSchema): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Check required fields
  for (const field of schema.required) {
    if (!(field in data) || data[field] === null || data[field] === undefined) {
      errors[field] = `${field} is required`;
    }
  }

  // Validate each field
  for (const [fieldName, fieldSchema] of Object.entries(schema.fields)) {
    if (!(fieldName in data)) {continue;}

    const value = data[fieldName];

    // Type validation
    if (value !== null && value !== undefined) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (fieldSchema.type === 'date' && !(value instanceof Date)) {
        errors[fieldName] = `${fieldName} must be a valid date`;
        continue;
      }
      if (fieldSchema.type !== 'date' && actualType !== fieldSchema.type) {
        errors[fieldName] = `${fieldName} must be of type ${fieldSchema.type}`;
        continue;
      }
    }

    // String validations
    if (fieldSchema.type === 'string' && typeof value === 'string') {
      if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
        errors[fieldName] = `${fieldName} must be at least ${fieldSchema.minLength} characters`;
      }
      if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
        errors[fieldName] = `${fieldName} must not exceed ${fieldSchema.maxLength} characters`;
      }
      if (fieldSchema.pattern && !fieldSchema.pattern.test(value)) {
        errors[fieldName] = fieldSchema.message || `${fieldName} format is invalid`;
      }
      if (fieldSchema.enum && !fieldSchema.enum.includes(value as string | number)) {
        errors[fieldName] = `${fieldName} must be one of: ${fieldSchema.enum.join(', ')}`;
      }
    }

    // Number validations
    if (fieldSchema.type === 'number' && typeof value === 'number') {
      if (fieldSchema.min !== undefined && value < fieldSchema.min) {
        errors[fieldName] = `${fieldName} must be at least ${fieldSchema.min}`;
      }
      if (fieldSchema.max !== undefined && value > fieldSchema.max) {
        errors[fieldName] = `${fieldName} must not exceed ${fieldSchema.max}`;
      }
      if (fieldSchema.enum && !fieldSchema.enum.includes(value as string | number)) {
        errors[fieldName] = `${fieldName} must be one of: ${fieldSchema.enum.join(', ')}`;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
