import { logger } from './logger';

interface ConfigSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean';
    required?: boolean;
    default?: any;
    validate?: (value: any) => boolean;
  };
}

const schema: ConfigSchema = {
  PORT: { type: 'number', default: 4002 },
  DATABASE_URL: { type: 'string', required: false },
  SANDBOX_ENABLED: { type: 'boolean', default: false },
  USE_REDIS: { type: 'boolean', default: false },
  REDIS_URL: { type: 'string', required: false }
};

export class ConfigValidator {
  validate(config: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const [key, spec] of Object.entries(schema)) {
      const value = config[key];

      if (spec.required && !value) {
        errors.push(`${key} is required`);
        continue;
      }

      if (value !== undefined) {
        const actualType = typeof value;
        if (actualType !== spec.type) {
          errors.push(`${key} must be ${spec.type}, got ${actualType}`);
        }

        if (spec.validate && !spec.validate(value)) {
          errors.push(`${key} validation failed`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  applyDefaults(config: Record<string, any>): Record<string, any> {
    const result = { ...config };
    
    for (const [key, spec] of Object.entries(schema)) {
      if (result[key] === undefined && spec.default !== undefined) {
        result[key] = spec.default;
      }
    }

    return result;
  }
}
