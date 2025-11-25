import * as path from 'path';
import { FileChange } from '../ChangesetManager';

export interface ServiceConnection {
  sourceService: string;
  targetService: string;
  endpoints: ConnectionEndpoint[];
  authentication?: boolean;
}

export interface ConnectionEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  requestSchema?: string;
  responseSchema?: string;
}

export class ServiceConnectionGenerator {
  /**
   * Generate API routes and client code for service-to-service communication
   */
  generateServiceConnection(connection: ServiceConnection, outputDir: string): FileChange[] {
    const changes: FileChange[] = [];

    // Generate API routes in target service
    changes.push(...this.generateAPIRoutes(connection, outputDir));

    // Generate service client in source service
    changes.push(...this.generateServiceClient(connection, outputDir));

    // Generate authentication middleware if needed
    if (connection.authentication) {
      changes.push(...this.generateAuthMiddleware(connection, outputDir));
    }

    // Generate request validation
    changes.push(...this.generateValidation(connection, outputDir));

    return changes;
  }

  private generateAPIRoutes(connection: ServiceConnection, outputDir: string): FileChange[] {
    const changes: FileChange[] = [];
    const targetDir = path.join(outputDir, 'services', connection.targetService);
    const routeName = this.toKebabCase(connection.sourceService);

    // Generate route controller
    changes.push({
      path: path.join(targetDir, 'src', 'controllers', `${routeName}.controller.ts`),
      type: 'create',
      content: this.generateRouteController(connection),
    });

    // Generate route service
    changes.push({
      path: path.join(targetDir, 'src', 'services', `${routeName}.service.ts`),
      type: 'create',
      content: this.generateRouteService(connection),
    });

    return changes;
  }

  private generateRouteController(connection: ServiceConnection): string {
    const serviceName = this.toPascalCase(connection.sourceService);
    
    return `import { Router, Request, Response, NextFunction } from 'express';
import { ${serviceName}Service } from '../services/${this.toKebabCase(connection.sourceService)}.service';
import { validate } from '../middleware/validation';
import { ${serviceName}Schemas } from '../validation/${this.toKebabCase(connection.sourceService)}.schemas';
${connection.authentication ? "import { authMiddleware } from '../middleware/auth.middleware';" : ''}

export class ${serviceName}Controller {
  public router: Router;
  private ${this.toCamelCase(connection.sourceService)}Service: ${serviceName}Service;

  constructor() {
    this.router = Router();
    this.${this.toCamelCase(connection.sourceService)}Service = new ${serviceName}Service();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
${connection.endpoints.map(endpoint => {
  const methodName = this.getMethodName(endpoint);
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(endpoint.method);
  
  return `    // ${endpoint.description}
    this.router.${endpoint.method.toLowerCase()}(
      '${endpoint.path}',
      ${connection.authentication ? 'authMiddleware, ' : ''}${hasBody && endpoint.requestSchema ? `validate(${serviceName}Schemas.${methodName}), ` : ''}this.${methodName}.bind(this)
    );
`;
}).join('\n')}
  }
${connection.endpoints.map(endpoint => {
  const methodName = this.getMethodName(endpoint);
  
  return `
  private async ${methodName}(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.${this.toCamelCase(connection.sourceService)}Service.${methodName}(${this.getMethodParams(endpoint)});
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }`;
}).join('\n')}
}
`;
  }

  private generateRouteService(connection: ServiceConnection): string {
    const serviceName = this.toPascalCase(connection.sourceService);
    
    return `export class ${serviceName}Service {
${connection.endpoints.map(endpoint => {
  const methodName = this.getMethodName(endpoint);
  const params = this.getServiceMethodParams(endpoint);
  
  return `
  async ${methodName}(${params}): Promise<any> {
    // TODO: Implement ${endpoint.description}
    throw new Error('Not implemented');
  }`;
}).join('\n')}
}
`;
  }

  private generateServiceClient(connection: ServiceConnection, outputDir: string): FileChange[] {
    const changes: FileChange[] = [];
    const sourceDir = path.join(outputDir, 'services', connection.sourceService);
    const clientName = this.toKebabCase(connection.targetService);

    // Generate client class
    changes.push({
      path: path.join(sourceDir, 'src', 'clients', `${clientName}.client.ts`),
      type: 'create',
      content: this.generateClientClass(connection),
    });

    // Generate client types
    changes.push({
      path: path.join(sourceDir, 'src', 'clients', `${clientName}.types.ts`),
      type: 'create',
      content: this.generateClientTypes(connection),
    });

    return changes;
  }

  private generateClientClass(connection: ServiceConnection): string {
    const clientName = this.toPascalCase(connection.targetService);
    
    return `import axios, { AxiosInstance } from 'axios';
${connection.endpoints.map(endpoint => {
  if (endpoint.requestSchema || endpoint.responseSchema) {
    return `import { ${endpoint.requestSchema || ''}, ${endpoint.responseSchema || ''} } from './${this.toKebabCase(connection.targetService)}.types';`;
  }
  return '';
}).filter(Boolean).join('\n')}

export class ${clientName}Client {
  private client: AxiosInstance;
  private baseURL: string;
${connection.authentication ? '  private authToken?: string;' : ''}

  constructor(baseURL?: string${connection.authentication ? ', authToken?: string' : ''}) {
    this.baseURL = baseURL || process.env.${this.toConstantCase(connection.targetService)}_URL || 'http://localhost:3000';
${connection.authentication ? '    this.authToken = authToken;' : ''}
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
${connection.authentication ? "        ...(this.authToken && { Authorization: \`Bearer \${this.authToken}\` })," : ''}
      },
    });
  }
${connection.authentication ? `
  setAuthToken(token: string): void {
    this.authToken = token;
    this.client.defaults.headers.common['Authorization'] = \`Bearer \${token}\`;
  }
` : ''}
${connection.endpoints.map(endpoint => {
  const methodName = this.getMethodName(endpoint);
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(endpoint.method);
  const params = this.getClientMethodParams(endpoint);
  const returnType = endpoint.responseSchema || 'any';
  
  return `
  async ${methodName}(${params}): Promise<${returnType}> {
    const response = await this.client.${endpoint.method.toLowerCase()}${hasBody ? `(
      '${endpoint.path}',
      ${endpoint.requestSchema ? 'data' : '{}'}
    )` : `('${endpoint.path}')`};
    return response.data.data;
  }`;
}).join('\n')}
}
`;
  }

  private generateClientTypes(connection: ServiceConnection): string {
    const types = new Set<string>();
    
    connection.endpoints.forEach(endpoint => {
      if (endpoint.requestSchema) types.add(endpoint.requestSchema);
      if (endpoint.responseSchema) types.add(endpoint.responseSchema);
    });

    if (types.size === 0) {
      return '// No types defined for this client\n';
    }

    return Array.from(types).map(type => {
      return `export interface ${type} {
  // TODO: Define ${type} properties
  [key: string]: any;
}
`;
    }).join('\n');
  }

  private generateAuthMiddleware(connection: ServiceConnection, outputDir: string): FileChange[] {
    const changes: FileChange[] = [];
    const targetDir = path.join(outputDir, 'services', connection.targetService);

    changes.push({
      path: path.join(targetDir, 'src', 'middleware', 'auth.middleware.ts'),
      type: 'create',
      content: this.generateAuthMiddlewareContent(),
    });

    return changes;
  }

  private generateAuthMiddlewareContent(): string {
    return `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error-handler';

interface JWTPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AppError(401, 'Authentication required');
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as JWTPayload;

    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError(401, 'Invalid or expired token'));
  }
};

export const serviceAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      throw new AppError(401, 'API key required');
    }

    const validApiKey = process.env.SERVICE_API_KEY;
    if (apiKey !== validApiKey) {
      throw new AppError(401, 'Invalid API key');
    }

    next();
  } catch (error) {
    next(error);
  }
};
`;
  }

  private generateValidation(connection: ServiceConnection, outputDir: string): FileChange[] {
    const changes: FileChange[] = [];
    const targetDir = path.join(outputDir, 'services', connection.targetService);
    const schemaName = this.toKebabCase(connection.sourceService);

    changes.push({
      path: path.join(targetDir, 'src', 'validation', `${schemaName}.schemas.ts`),
      type: 'create',
      content: this.generateValidationSchemas(connection),
    });

    return changes;
  }

  private generateValidationSchemas(connection: ServiceConnection): string {
    const serviceName = this.toPascalCase(connection.sourceService);
    
    return `import { z } from 'zod';

export const ${serviceName}Schemas = {
${connection.endpoints.filter(e => e.requestSchema).map(endpoint => {
  const methodName = this.getMethodName(endpoint);
  
  return `  ${methodName}: z.object({
    body: z.object({
      // TODO: Define validation schema for ${endpoint.description}
    }),
  }),
`;
}).join('\n')}
};
`;
  }

  // Helper methods
  private getMethodName(endpoint: ConnectionEndpoint): string {
    const pathParts = endpoint.path.split('/').filter(p => p && !p.startsWith(':'));
    const action = endpoint.method.toLowerCase();
    return `${action}${pathParts.map(p => this.toPascalCase(p)).join('')}`;
  }

  private getMethodParams(endpoint: ConnectionEndpoint): string {
    const params: string[] = [];
    
    // Extract path parameters
    const pathParams = endpoint.path.match(/:(\w+)/g);
    if (pathParams) {
      params.push(...pathParams.map(p => `req.params.${p.slice(1)}`));
    }

    // Add body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
      params.push('req.body');
    }

    // Add query params
    if (endpoint.method === 'GET') {
      params.push('req.query');
    }

    return params.join(', ');
  }

  private getServiceMethodParams(endpoint: ConnectionEndpoint): string {
    const params: string[] = [];
    
    // Extract path parameters
    const pathParams = endpoint.path.match(/:(\w+)/g);
    if (pathParams) {
      params.push(...pathParams.map(p => `${p.slice(1)}: string`));
    }

    // Add body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
      params.push('data: any');
    }

    // Add query params
    if (endpoint.method === 'GET') {
      params.push('query?: any');
    }

    return params.join(', ');
  }

  private getClientMethodParams(endpoint: ConnectionEndpoint): string {
    const params: string[] = [];
    
    // Extract path parameters
    const pathParams = endpoint.path.match(/:(\w+)/g);
    if (pathParams) {
      params.push(...pathParams.map(p => `${p.slice(1)}: string`));
    }

    // Add body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && endpoint.requestSchema) {
      params.push(`data: ${endpoint.requestSchema}`);
    }

    return params.join(', ');
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

  private toConstantCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toUpperCase();
  }
}
