import { FileChange } from './ChangesetManager';
import * as path from 'path';

export interface FormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: FieldValidation;
  options?: Array<{ label: string; value: string | number }>; // For select/radio
  defaultValue?: any;
}

export interface FieldValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: string; // Custom validation function
}

export interface FormSpec {
  id: string;
  name: string;
  fields: FormField[];
  submitEndpoint?: string;
  submitMethod?: 'POST' | 'PUT' | 'PATCH';
  onSuccessRedirect?: string;
  zodSchema?: string; // Backend Zod schema to sync with
}

export class FormBuilder {
  /**
   * Generate a complete form component with React Hook Form and validation
   */
  generateForm(spec: FormSpec, outputDir: string): FileChange[] {
    const changes: FileChange[] = [];
    const componentPath = path.join(outputDir, 'components', 'forms', `${this.toKebabCase(spec.name)}.tsx`);
    
    changes.push({
      path: componentPath,
      type: 'create',
      content: this.generateFormComponent(spec),
    });

    // Generate Zod schema if not provided
    if (!spec.zodSchema) {
      const schemaPath = path.join(outputDir, 'schemas', `${this.toKebabCase(spec.name)}-schema.ts`);
      changes.push({
        path: schemaPath,
        type: 'create',
        content: this.generateZodSchema(spec),
      });
    }

    return changes;
  }

  /**
   * Generate form component with React Hook Form
   */
  private generateFormComponent(spec: FormSpec): string {
    const componentName = this.toPascalCase(spec.name);
    const schemaName = `${this.toCamelCase(spec.name)}Schema`;
    const hasSubmitEndpoint = !!spec.submitEndpoint;
    
    return `'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
${hasSubmitEndpoint ? "import { useMutation } from '@tanstack/react-query';" : ''}
${hasSubmitEndpoint ? "import { useRouter } from 'next/navigation';" : ''}
import { ${schemaName}, type ${this.toPascalCase(spec.name)}FormData } from '@/schemas/${this.toKebabCase(spec.name)}-schema';

interface ${componentName}Props {
  defaultValues?: Partial<${this.toPascalCase(spec.name)}FormData>;
  onSubmit?: (data: ${this.toPascalCase(spec.name)}FormData) => void | Promise<void>;
}

export default function ${componentName}({ defaultValues, onSubmit }: ${componentName}Props) {
  ${hasSubmitEndpoint ? 'const router = useRouter();' : ''}
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<${this.toPascalCase(spec.name)}FormData>({
    resolver: zodResolver(${schemaName}),
    defaultValues,
  });

  ${hasSubmitEndpoint ? this.generateMutationHook(spec) : ''}

  const onSubmitHandler = async (data: ${this.toPascalCase(spec.name)}FormData) => {
    try {
      ${hasSubmitEndpoint ? `
      await mutation.mutateAsync(data);
      ${spec.onSuccessRedirect ? `router.push('${spec.onSuccessRedirect}');` : ''}
      reset();
      ` : `
      if (onSubmit) {
        await onSubmit(data);
      }
      `}
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6 max-w-2xl">
      ${this.generateFormFields(spec.fields)}

      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isSubmitting${hasSubmitEndpoint ? ' || mutation.isPending' : ''}}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting${hasSubmitEndpoint ? ' || mutation.isPending' : ''} ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      ${hasSubmitEndpoint ? `
      {mutation.isError && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">
            Error: {mutation.error instanceof Error ? mutation.error.message : 'An error occurred'}
          </p>
        </div>
      )}

      {mutation.isSuccess && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">Form submitted successfully!</p>
        </div>
      )}
      ` : ''}
    </form>
  );
}
`;
  }

  /**
   * Generate mutation hook for form submission
   */
  private generateMutationHook(spec: FormSpec): string {
    if (!spec.submitEndpoint) return '';
    
    return `
  const mutation = useMutation({
    mutationFn: async (data: ${this.toPascalCase(spec.name)}FormData) => {
      const response = await fetch('${spec.submitEndpoint}', {
        method: '${spec.submitMethod || 'POST'}',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }

      return response.json();
    },
  });
`;
  }

  /**
   * Generate form fields JSX
   */
  private generateFormFields(fields: FormField[]): string {
    return fields.map(field => this.generateFormField(field)).join('\n\n      ');
  }

  /**
   * Generate a single form field
   */
  private generateFormField(field: FormField): string {
    switch (field.type) {
      case 'textarea':
        return this.generateTextareaField(field);
      case 'select':
        return this.generateSelectField(field);
      case 'checkbox':
        return this.generateCheckboxField(field);
      case 'radio':
        return this.generateRadioField(field);
      default:
        return this.generateInputField(field);
    }
  }

  /**
   * Generate standard input field
   */
  private generateInputField(field: FormField): string {
    return `<div>
        <label htmlFor="${field.name}" className="block text-sm font-medium text-gray-700 mb-1">
          ${field.label}${field.required ? ' *' : ''}
        </label>
        <input
          id="${field.name}"
          type="${field.type}"
          {...register('${field.name}')}
          placeholder="${field.placeholder || ''}"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.${field.name} && (
          <p className="mt-1 text-sm text-red-600">{errors.${field.name}?.message}</p>
        )}
      </div>`;
  }

  /**
   * Generate textarea field
   */
  private generateTextareaField(field: FormField): string {
    return `<div>
        <label htmlFor="${field.name}" className="block text-sm font-medium text-gray-700 mb-1">
          ${field.label}${field.required ? ' *' : ''}
        </label>
        <textarea
          id="${field.name}"
          {...register('${field.name}')}
          placeholder="${field.placeholder || ''}"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.${field.name} && (
          <p className="mt-1 text-sm text-red-600">{errors.${field.name}?.message}</p>
        )}
      </div>`;
  }

  /**
   * Generate select field
   */
  private generateSelectField(field: FormField): string {
    const options = field.options || [];
    return `<div>
        <label htmlFor="${field.name}" className="block text-sm font-medium text-gray-700 mb-1">
          ${field.label}${field.required ? ' *' : ''}
        </label>
        <select
          id="${field.name}"
          {...register('${field.name}')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select an option</option>
          ${options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('\n          ')}
        </select>
        {errors.${field.name} && (
          <p className="mt-1 text-sm text-red-600">{errors.${field.name}?.message}</p>
        )}
      </div>`;
  }

  /**
   * Generate checkbox field
   */
  private generateCheckboxField(field: FormField): string {
    return `<div className="flex items-center">
        <input
          id="${field.name}"
          type="checkbox"
          {...register('${field.name}')}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="${field.name}" className="ml-2 block text-sm text-gray-900">
          ${field.label}${field.required ? ' *' : ''}
        </label>
        {errors.${field.name} && (
          <p className="ml-6 text-sm text-red-600">{errors.${field.name}?.message}</p>
        )}
      </div>`;
  }

  /**
   * Generate radio field group
   */
  private generateRadioField(field: FormField): string {
    const options = field.options || [];
    return `<div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ${field.label}${field.required ? ' *' : ''}
        </label>
        <div className="space-y-2">
          ${options.map(opt => `
          <div className="flex items-center">
            <input
              id="${field.name}-${opt.value}"
              type="radio"
              value="${opt.value}"
              {...register('${field.name}')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="${field.name}-${opt.value}" className="ml-2 block text-sm text-gray-900">
              ${opt.label}
            </label>
          </div>`).join('\n          ')}
        </div>
        {errors.${field.name} && (
          <p className="mt-1 text-sm text-red-600">{errors.${field.name}?.message}</p>
        )}
      </div>`;
  }

  /**
   * Generate Zod validation schema
   */
  private generateZodSchema(spec: FormSpec): string {
    const schemaName = `${this.toCamelCase(spec.name)}Schema`;
    const typeName = `${this.toPascalCase(spec.name)}FormData`;
    
    return `import { z } from 'zod';

export const ${schemaName} = z.object({
${spec.fields.map(field => this.generateZodFieldValidation(field)).join(',\n')}
});

export type ${typeName} = z.infer<typeof ${schemaName}>;
`;
  }

  /**
   * Generate Zod validation for a single field
   */
  private generateZodFieldValidation(field: FormField): string {
    let validation = this.getBaseZodType(field);
    
    // Add validation rules
    if (field.validation) {
      const v = field.validation;
      
      if (field.type === 'text' || field.type === 'textarea' || field.type === 'email' || field.type === 'password' || field.type === 'tel' || field.type === 'url') {
        if (v.minLength !== undefined) {
          validation += `.min(${v.minLength}, { message: '${field.label} must be at least ${v.minLength} characters' })`;
        }
        if (v.maxLength !== undefined) {
          validation += `.max(${v.maxLength}, { message: '${field.label} must be at most ${v.maxLength} characters' })`;
        }
        if (v.pattern) {
          validation += `.regex(/${v.pattern}/, { message: '${field.label} format is invalid' })`;
        }
      }
      
      if (field.type === 'number') {
        if (v.min !== undefined) {
          validation += `.min(${v.min}, { message: '${field.label} must be at least ${v.min}' })`;
        }
        if (v.max !== undefined) {
          validation += `.max(${v.max}, { message: '${field.label} must be at most ${v.max}' })`;
        }
      }
    }
    
    // Make optional if not required
    if (!field.required) {
      validation += '.optional()';
    }
    
    return `  ${field.name}: ${validation}`;
  }

  /**
   * Get base Zod type for field
   */
  private getBaseZodType(field: FormField): string {
    switch (field.type) {
      case 'email':
        return "z.string().email({ message: 'Invalid email address' })";
      case 'url':
        return "z.string().url({ message: 'Invalid URL' })";
      case 'number':
        return 'z.number({ required_error: `${field.label} is required` })';
      case 'date':
        return 'z.string().datetime()';
      case 'checkbox':
        return 'z.boolean()';
      case 'select':
      case 'radio':
        if (field.options && field.options.length > 0) {
          const values = field.options.map(o => `'${o.value}'`).join(', ');
          return `z.enum([${values}])`;
        }
        return "z.string()";
      default:
        return `z.string({ required_error: '${field.label} is required' })`;
    }
  }

  /**
   * Convert string to PascalCase
   */
  private toPascalCase(str: string): string {
    return str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
      .replace(/^[a-z]/, c => c.toUpperCase());
  }

  /**
   * Convert string to camelCase
   */
  private toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  /**
   * Convert string to kebab-case
   */
  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }
}
