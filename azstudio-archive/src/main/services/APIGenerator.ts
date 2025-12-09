import * as path from 'path';
import { FileChange } from './ChangesetManager';

export interface APIEndpointSpec {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  description: string;
  authentication?: boolean;
  requestSchema?: {
    body?: Record<string, any>;
    query?: Record<string, any>;
    params?: Record<string, any>;
  };
  responseSchema?: Record<string, any>;
  errorResponses?: Array<{
    code: number;
    description: string;
  }>;
}

export class APIGenerator {
  /**
   * Generate API endpoint code
   */
  generateEndpoint(spec: APIEndpointSpec, serviceDir: string): FileChange[] {
    const changes: FileChange[] = [];
    const endpointName = this.getEndpointName(spec.path, spec.method);

    // Generate route handler
    changes.push({
      path: path.join(serviceDir, 'src', 'routes', `${endpointName}.route.ts`),
      type: 'create',
      content: this.generateRouteHandler(spec),
    });

    // Generate controller method
    changes.push({
      path: path.join(serviceDir, 'src', 'controllers', `${endpointName}.controller.ts`),
      type: 'create',
      content: this.generateControllerMethod(spec),
    });

    // Generate validation schema
    if (spec.requestSchema) {
      changes.push({
        path: path.join(serviceDir, 'src', 'validation', `${endpointName}.schema.ts`),
        type: 'create',
        content: this.generateValidationSchema(spec),
      });
    }

    // Generate TypeScript types
    changes.push({
      path: path.join(serviceDir, 'src', 'types', `${endpointName}.types.ts`),
      type: 'create',
      content: this.generateTypes(spec),
    });

    // Generate OpenAPI documentation
    changes.push({
      path: path.join(serviceDir, 'docs', 'openapi', `${endpointName}.yaml`),
      type: 'create',
      content: this.generateOpenAPIDoc(spec),
    });

    // Generate integration test
    changes.push({
      path: path.join(serviceDir, 'tests', 'integration', `${endpointName}.test.ts`),
      type: 'create',
      content: this.generateIntegrationTest(spec),
    });

    return changes;
  }

  /**
   * Generate route handler
   */
  private generateRouteHandler(spec: APIEndpointSpec): string {
    const controllerName = this.toPascalCase(this.getEndpointName(spec.path, spec.method));
    const methodName = this.toCamelCase(spec.method.toLowerCase());

    return `import { Router } from 'express';
import { ${controllerName}Controller } from '../controllers/${this.toKebabCase(controllerName)}.controller';
${spec.authentication ? "import { authMiddleware } from '../middleware/auth';" : ''}
${spec.requestSchema ? `import { validate } from '../middleware/validation';\nimport { ${controllerName}Schema } from '../validation/${this.toKebabCase(controllerName)}.schema';` : ''}

const router = Router();
const controller = new ${controllerName}Controller();

/**
 * ${spec.description}
 * @route ${spec.method} ${spec.path}
 */
router.${methodName}(
  '${spec.path}',
  ${spec.authentication ? 'authMiddleware,' : ''}
  ${spec.requestSchema ? `validate(${controllerName}Schema),` : ''}
  controller.handle.bind(controller)
);

export default router;
`;
  }

  /**
   * Generate controller method
   */
  private generateControllerMethod(spec: APIEndpointSpec): string {
    const controllerName = this.toPascalCase(this.getEndpointName(spec.path, spec.method));
    const hasBody = spec.requestSchema?.body;
    const hasQuery = spec.requestSchema?.query;
    const hasParams = spec.requestSchema?.params;

    return `import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/error-handler';
${hasBody || hasQuery || hasParams ? `import { ${controllerName}Request, ${controllerName}Response } from '../types/${this.toKebabCase(controllerName)}.types';` : ''}

export class ${controllerName}Controller {
  /**
   * ${spec.description}
   */
  async handle(
    req: Request${hasBody || hasQuery || hasParams ? `<any, any, ${hasBody ? `${controllerName}Request['body']` : 'any'}, ${hasQuery ? `${controllerName}Request['query']` : 'any'}>` : ''},
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      ${hasParams ? `const params = req.params;` : ''}
      ${hasQuery ? `const query = req.query;` : ''}
      ${hasBody ? `const body = req.body;` : ''}

      // TODO: Implement business logic here
      ${this.generateBusinessLogicPlaceholder(spec)}

      // Success response
      const response${spec.responseSchema ? `: ${controllerName}Response` : ''} = {
        success: true,
        ${this.generateResponsePlaceholder(spec)}
      };

      res.status(${this.getSuccessStatusCode(spec.method)}).json(response);
    } catch (error) {
      next(error);
    }
  }
}
`;
  }

  /**
   * Generate validation schema
   */
  private generateValidationSchema(spec: APIEndpointSpec): string {
    const controllerName = this.toPascalCase(this.getEndpointName(spec.path, spec.method));

    let schema = `import { z } from 'zod';\n\nexport const ${controllerName}Schema = z.object({\n`;

    if (spec.requestSchema?.body) {
      schema += `  body: z.object({\n`;
      for (const [key, type] of Object.entries(spec.requestSchema.body)) {
        schema += `    ${key}: ${this.getZodType(type)},\n`;
      }
      schema += `  }),\n`;
    }

    if (spec.requestSchema?.query) {
      schema += `  query: z.object({\n`;
      for (const [key, type] of Object.entries(spec.requestSchema.query)) {
        schema += `    ${key}: ${this.getZodType(type)},\n`;
      }
      schema += `  }),\n`;
    }

    if (spec.requestSchema?.params) {
      schema += `  params: z.object({\n`;
      for (const [key, type] of Object.entries(spec.requestSchema.params)) {
        schema += `    ${key}: ${this.getZodType(type)},\n`;
      }
      schema += `  }),\n`;
    }

    schema += `});\n`;

    return schema;
  }

  /**
   * Generate TypeScript types
   */
  private generateTypes(spec: APIEndpointSpec): string {
    const controllerName = this.toPascalCase(this.getEndpointName(spec.path, spec.method));
    let types = '';

    if (spec.requestSchema) {
      types += `export interface ${controllerName}Request {\n`;
      
      if (spec.requestSchema.body) {
        types += `  body: {\n`;
        for (const [key, type] of Object.entries(spec.requestSchema.body)) {
          types += `    ${key}: ${this.getTypeScriptType(type)};\n`;
        }
        types += `  };\n`;
      }

      if (spec.requestSchema.query) {
        types += `  query: {\n`;
        for (const [key, type] of Object.entries(spec.requestSchema.query)) {
          types += `    ${key}: ${this.getTypeScriptType(type)};\n`;
        }
        types += `  };\n`;
      }

      if (spec.requestSchema.params) {
        types += `  params: {\n`;
        for (const [key, type] of Object.entries(spec.requestSchema.params)) {
          types += `    ${key}: ${this.getTypeScriptType(type)};\n`;
        }
        types += `  };\n`;
      }

      types += `}\n\n`;
    }

    if (spec.responseSchema) {
      types += `export interface ${controllerName}Response {\n`;
      types += `  success: boolean;\n`;
      for (const [key, type] of Object.entries(spec.responseSchema)) {
        types += `  ${key}: ${this.getTypeScriptType(type)};\n`;
      }
      types += `}\n`;
    }

    return types;
  }

  /**
   * Generate OpenAPI documentation
   */
  private generateOpenAPIDoc(spec: APIEndpointSpec): string {
    const method = spec.method.toLowerCase();
    
    let doc = `${spec.path}:\n`;
    doc += `  ${method}:\n`;
    doc += `    summary: ${spec.description}\n`;
    doc += `    description: ${spec.description}\n`;

    if (spec.authentication) {
      doc += `    security:\n`;
      doc += `      - bearerAuth: []\n`;
    }

    if (spec.requestSchema?.params) {
      doc += `    parameters:\n`;
      for (const [key, type] of Object.entries(spec.requestSchema.params)) {
        doc += `      - name: ${key}\n`;
        doc += `        in: path\n`;
        doc += `        required: true\n`;
        doc += `        schema:\n`;
        doc += `          type: ${this.getOpenAPIType(type)}\n`;
      }
    }

    if (spec.requestSchema?.query) {
      doc += `    parameters:\n`;
      for (const [key, type] of Object.entries(spec.requestSchema.query)) {
        doc += `      - name: ${key}\n`;
        doc += `        in: query\n`;
        doc += `        schema:\n`;
        doc += `          type: ${this.getOpenAPIType(type)}\n`;
      }
    }

    if (spec.requestSchema?.body) {
      doc += `    requestBody:\n`;
      doc += `      required: true\n`;
      doc += `      content:\n`;
      doc += `        application/json:\n`;
      doc += `          schema:\n`;
      doc += `            type: object\n`;
      doc += `            properties:\n`;
      for (const [key, type] of Object.entries(spec.requestSchema.body)) {
        doc += `              ${key}:\n`;
        doc += `                type: ${this.getOpenAPIType(type)}\n`;
      }
    }

    doc += `    responses:\n`;
    doc += `      '${this.getSuccessStatusCode(spec.method)}':\n`;
    doc += `        description: Success\n`;
    doc += `        content:\n`;
    doc += `          application/json:\n`;
    doc += `            schema:\n`;
    doc += `              type: object\n`;
    doc += `              properties:\n`;
    doc += `                success:\n`;
    doc += `                  type: boolean\n`;

    if (spec.responseSchema) {
      for (const [key, type] of Object.entries(spec.responseSchema)) {
        doc += `                ${key}:\n`;
        doc += `                  type: ${this.getOpenAPIType(type)}\n`;
      }
    }

    if (spec.errorResponses) {
      for (const error of spec.errorResponses) {
        doc += `      '${error.code}':\n`;
        doc += `        description: ${error.description}\n`;
      }
    }

    return doc;
  }

  /**
   * Generate integration test
   */
  private generateIntegrationTest(spec: APIEndpointSpec): string {
    const method = spec.method.toLowerCase();

    return `import request from 'supertest';
import app from '../../src/index';

describe('${spec.method} ${spec.path}', () => {
  ${spec.authentication ? `let authToken: string;\n\n  beforeAll(async () => {\n    // TODO: Get authentication token\n    authToken = 'test-token';\n  });\n` : ''}

  it('should ${spec.description.toLowerCase()}', async () => {
    const response = await request(app)
      .${method}('${spec.path}')
      ${spec.authentication ? `.set('Authorization', \`Bearer \${authToken}\`)` : ''}
      ${spec.requestSchema?.body ? `.send(${JSON.stringify(this.generateTestData(spec.requestSchema.body), null, 2)})` : ''}
      ${spec.requestSchema?.query ? `.query(${JSON.stringify(this.generateTestData(spec.requestSchema.query), null, 2)})` : ''}
      .expect(${this.getSuccessStatusCode(spec.method)});

    expect(response.body.success).toBe(true);
    ${spec.responseSchema ? Object.keys(spec.responseSchema).map(key => `expect(response.body.${key}).toBeDefined();`).join('\n    ') : ''}
  });

  ${spec.authentication ? `it('should return 401 without authentication', async () => {\n    await request(app)\n      .${method}('${spec.path}')\n      .expect(401);\n  });\n` : ''}

  ${spec.requestSchema?.body ? `it('should return 400 with invalid request body', async () => {\n    await request(app)\n      .${method}('${spec.path}')\n      ${spec.authentication ? `.set('Authorization', \`Bearer \${authToken}\`)` : ''}\n      .send({})\n      .expect(400);\n  });\n` : ''}

  ${spec.errorResponses ? spec.errorResponses.map(err => `it('should return ${err.code} - ${err.description}', async () => {\n    // TODO: Implement test case\n  });\n`).join('\n  ') : ''}
});
`;
  }

  // Helper methods
  private getEndpointName(path: string, method: string): string {
    const pathParts = path.split('/').filter(p => p && !p.startsWith(':'));
    return `${method.toLowerCase()}-${pathParts.join('-')}`;
  }

  private getSuccessStatusCode(method: string): number {
    switch (method) {
      case 'POST':
        return 201;
      case 'DELETE':
        return 204;
      default:
        return 200;
    }
  }

  private getZodType(type: any): string {
    if (typeof type === 'string') {
      switch (type) {
        case 'string':
          return 'z.string()';
        case 'number':
          return 'z.number()';
        case 'boolean':
          return 'z.boolean()';
        case 'date':
          return 'z.date()';
        case 'email':
          return 'z.string().email()';
        case 'url':
          return 'z.string().url()';
        case 'uuid':
          return 'z.string().uuid()';
        default:
          return 'z.string()';
      }
    }
    return 'z.any()';
  }

  private getTypeScriptType(type: any): string {
    if (typeof type === 'string') {
      switch (type) {
        case 'string':
        case 'email':
        case 'url':
        case 'uuid':
          return 'string';
        case 'number':
          return 'number';
        case 'boolean':
          return 'boolean';
        case 'date':
          return 'Date';
        default:
          return 'any';
      }
    }
    return 'any';
  }

  private getOpenAPIType(type: any): string {
    if (typeof type === 'string') {
      switch (type) {
        case 'string':
        case 'email':
        case 'url':
        case 'uuid':
          return 'string';
        case 'number':
          return 'number';
        case 'boolean':
          return 'boolean';
        case 'date':
          return 'string';
        default:
          return 'string';
      }
    }
    return 'string';
  }

  private generateBusinessLogicPlaceholder(spec: APIEndpointSpec): string {
    switch (spec.method) {
      case 'GET':
        return '// Fetch data from database or service';
      case 'POST':
        return '// Create new resource';
      case 'PUT':
      case 'PATCH':
        return '// Update existing resource';
      case 'DELETE':
        return '// Delete resource';
      default:
        return '// Implement logic';
    }
  }

  private generateResponsePlaceholder(spec: APIEndpointSpec): string {
    if (spec.responseSchema) {
      return Object.keys(spec.responseSchema).map(key => `${key}: null`).join(',\n        ');
    }
    return 'data: null';
  }

  private generateTestData(schema: Record<string, any>): Record<string, any> {
    const data: Record<string, any> = {};
    for (const [key, type] of Object.entries(schema)) {
      switch (type) {
        case 'string':
          data[key] = 'test-value';
          break;
        case 'number':
          data[key] = 123;
          break;
        case 'boolean':
          data[key] = true;
          break;
        case 'email':
          data[key] = 'test@example.com';
          break;
        case 'uuid':
          data[key] = '123e4567-e89b-12d3-a456-426614174000';
          break;
        default:
          data[key] = 'test';
      }
    }
    return data;
  }

  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  private toCamelCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
      .replace(/^[A-Z]/, c => c.toLowerCase());
  }

  private toPascalCase(str: string): string {
    const camel = this.toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  }
}
