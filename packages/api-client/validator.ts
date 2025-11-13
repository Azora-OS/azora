/**
 * Input validation utilities
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validate = {
  email: (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) throw new ValidationError('Invalid email format');
    return true;
  },

  required: (value: any, field: string): boolean => {
    if (!value) throw new ValidationError(`${field} is required`);
    return true;
  },

  minLength: (value: string, min: number, field: string): boolean => {
    if (value.length < min) throw new ValidationError(`${field} must be at least ${min} characters`);
    return true;
  },

  positive: (value: number, field: string): boolean => {
    if (value <= 0) throw new ValidationError(`${field} must be positive`);
    return true;
  },

  uuid: (value: string, field: string): boolean => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!regex.test(value)) throw new ValidationError(`${field} must be a valid UUID`);
    return true;
  }
};
