import * as path from 'path';
import { FileChange } from './ChangesetManager';

export interface ServiceSpec {
  name: string;
  type: 'rest-api' | 'graphql' | 'microservice' | 'worker';
  port?: number;
  database?: boolean;
  authentication?: boolean;
  features?: string[];
}

export class ServiceGenerator {
  /**
   * Generate complete service boilerplate
   */
  generateService(spec: ServiceSpec, outputDir: string): FileChange[] {
    const changes: FileChange[] = [];
    const serviceName = this.toKebabCase(spec.name);
    const serviceDir = path.join(outputDir, 'services', serviceName);

    // Generate main service file
    changes.push({
      path: path.join(serviceDir, 'src', 'index.ts'),
      type: 'create',
      content: this.generateIndexFile(spec),
    });

    // Generate controller
    changes.push({
      path: path.join(serviceDir, 'src', 'controllers', `${serviceName}.controller.ts`),
      type: 'create',
      content: this.generateController(spec),
    });

    // Generate service layer
    changes.push({
      path: path.join(serviceDir, 'src', 'services', `${serviceName}.service.ts`),
      type: 'create',
      content: this.generateServiceLayer(spec),
    });

    // Generate repository if database is enabled
    if (spec.database) {
      changes.push({
        path: path.join(serviceDir, 'src', 'repositories', `${serviceName}.repository.ts`),
        type: 'create',
        content: this.generateRepository(spec),
      });

      changes.push({
        path: path.join(serviceDir, 'prisma', 'schema.prisma'),
        type: 'create',
        content: this.generatePrismaSchema(spec),
      });
    }

    // Generate middleware
    changes.push({
      path: path.join(serviceDir, 'src', 'middleware', 'error-handler.ts'),
      type: 'create',
      content: this.generateErrorHandler(),
    });

    if (spec.authentication) {
      changes.push({
        path: path.join(serviceDir, 'src', 'middleware', 'auth.ts'),
        type: 'create',
        content: this.generateAuthMiddleware(),
      });
    }

    // Generate types
    changes.push({
      path: path.join(serviceDir, 'src', 'types', 'index.ts'),
      type: 'create',
      content: this.generateTypes(spec),
    });

    // Generate validation schemas
    changes.push({
      path: path.join(serviceDir, 'src', 'validation', 'schemas.ts'),
      type: 'create',
      content: this.generateValidationSchemas(spec),
    });

    // Generate package.json
    changes.push({
      path: path.join(serviceDir, 'package.json'),
      type: 'create',
      content: this.generatePackageJson(spec),
    });

    // Generate tsconfig.json
    changes.push({
      path: path.join(serviceDir, 'tsconfig.json'),
      type: 'create',
      content: this.generateTsConfig(),
    });

    // Generate .env.example
    changes.push({
      path: path.join(serviceDir, '.env.example'),
      type: 'create',
      content: this.generateEnvExample(spec),
    });

    // Generate README
    changes.push({
      path: path.join(serviceDir, 'README.md'),
      type: 'create',
      content: this.generateReadme(spec),
    });

    return changes;
  }

  /**
   * Generate index.ts file
   */
  private generateIndexFile(spec: ServiceSpec): string {
    const serviceName = this.toPascalCase(spec.name);
    const port = spec.port || 3000;

    return `import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ${serviceName}Controller } from './controllers/${this.toKebabCase(spec.name)}.controller';
import { errorHandler } from './middleware/error-handler';
${spec.authentication ? "import { authMiddleware } from './middleware/auth';" : ''}

const app: Application = express();
const PORT = process.env.PORT || ${port};

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: '${spec.name}' });
});

// Routes
const controller = new ${serviceName}Controller();
app.use('/api/${this.toKebabCase(spec.name)}', controller.router);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(\`${spec.name} service running on port \${PORT}\`);
});

export default app;
`;
  }

  /**
   * Generate controller file
   */
  private generateController(spec: ServiceSpec): string {
    const serviceName = this.toPascalCase(spec.name);
    const serviceVar = this.toCamelCase(spec.name);

    return `import { Router, Request, Response, NextFunction } from 'express';
import { ${serviceName}Service } from '../services/${this.toKebabCase(spec.name)}.service';
import { validate } from '../middleware/validation';
import { ${serviceName}Schema } from '../validation/schemas';
${spec.authentication ? "import { authMiddleware } from '../middleware/auth';" : ''}

export class ${serviceName}Controller {
  public router: Router;
  private ${serviceVar}Service: ${serviceName}Service;

  constructor() {
    this.router = Router();
    this.${serviceVar}Service = new ${serviceName}Service();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET all
    this.router.get('/', ${spec.authentication ? 'authMiddleware, ' : ''}this.getAll.bind(this));
    
    // GET by ID
    this.router.get('/:id', ${spec.authentication ? 'authMiddleware, ' : ''}this.getById.bind(this));
    
    // POST create
    this.router.post(
      '/',
      ${spec.authentication ? 'authMiddleware, ' : ''}validate(${serviceName}Schema.create),
      this.create.bind(this)
    );
    
    // PUT update
    this.router.put(
      '/:id',
      ${spec.authentication ? 'authMiddleware, ' : ''}validate(${serviceName}Schema.update),
      this.update.bind(this)
    );
    
    // DELETE
    this.router.delete('/:id', ${spec.authentication ? 'authMiddleware, ' : ''}this.delete.bind(this));
  }

  private async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await this.${serviceVar}Service.findAll();
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  }

  private async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.${serviceVar}Service.findById(id);
      
      if (!item) {
        res.status(404).json({ success: false, error: 'Not found' });
        return;
      }
      
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  private async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await this.${serviceVar}Service.create(req.body);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  private async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.${serviceVar}Service.update(id, req.body);
      
      if (!item) {
        res.status(404).json({ success: false, error: 'Not found' });
        return;
      }
      
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  private async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.${serviceVar}Service.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
`;
  }

  /**
   * Generate service layer file
   */
  private generateServiceLayer(spec: ServiceSpec): string {
    const serviceName = this.toPascalCase(spec.name);

    return `${spec.database ? `import { ${serviceName}Repository } from '../repositories/${this.toKebabCase(spec.name)}.repository';` : ''}
import { ${serviceName}, Create${serviceName}Input, Update${serviceName}Input } from '../types';

export class ${serviceName}Service {
  ${spec.database ? `private repository: ${serviceName}Repository;` : ''}

  constructor() {
    ${spec.database ? `this.repository = new ${serviceName}Repository();` : ''}
  }

  async findAll(): Promise<${serviceName}[]> {
    ${spec.database ? `return this.repository.findAll();` : `// TODO: Implement findAll logic\n    return [];`}
  }

  async findById(id: string): Promise<${serviceName} | null> {
    ${spec.database ? `return this.repository.findById(id);` : `// TODO: Implement findById logic\n    return null;`}
  }

  async create(data: Create${serviceName}Input): Promise<${serviceName}> {
    // Add business logic here
    ${spec.database ? `return this.repository.create(data);` : `// TODO: Implement create logic\n    throw new Error('Not implemented');`}
  }

  async update(id: string, data: Update${serviceName}Input): Promise<${serviceName} | null> {
    // Add business logic here
    ${spec.database ? `return this.repository.update(id, data);` : `// TODO: Implement update logic\n    return null;`}
  }

  async delete(id: string): Promise<void> {
    ${spec.database ? `await this.repository.delete(id);` : `// TODO: Implement delete logic`}
  }
}
`;
  }

  /**
   * Generate repository file
   */
  private generateRepository(spec: ServiceSpec): string {
    const serviceName = this.toPascalCase(spec.name);
    const modelName = this.toCamelCase(spec.name);

    return `import { PrismaClient } from '@prisma/client';
import { ${serviceName}, Create${serviceName}Input, Update${serviceName}Input } from '../types';

const prisma = new PrismaClient();

export class ${serviceName}Repository {
  async findAll(): Promise<${serviceName}[]> {
    return prisma.${modelName}.findMany();
  }

  async findById(id: string): Promise<${serviceName} | null> {
    return prisma.${modelName}.findUnique({
      where: { id },
    });
  }

  async create(data: Create${serviceName}Input): Promise<${serviceName}> {
    return prisma.${modelName}.create({
      data,
    });
  }

  async update(id: string, data: Update${serviceName}Input): Promise<${serviceName} | null> {
    return prisma.${modelName}.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.${modelName}.delete({
      where: { id },
    });
  }
}
`;
  }

  /**
   * Generate Prisma schema
   */
  private generatePrismaSchema(spec: ServiceSpec): string {
    const modelName = this.toPascalCase(spec.name);

    return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model ${modelName} {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Add your fields here
  name      String
  
  @@map("${this.toSnakeCase(spec.name)}")
}
`;
  }

  /**
   * Generate error handler middleware
   */
  private generateErrorHandler(): string {
    return `import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};
`;
  }

  /**
   * Generate auth middleware
   */
  private generateAuthMiddleware(): string {
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
`;
  }

  /**
   * Generate types file
   */
  private generateTypes(spec: ServiceSpec): string {
    const serviceName = this.toPascalCase(spec.name);

    return `export interface ${serviceName} {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  // Add more fields as needed
}

export interface Create${serviceName}Input {
  name: string;
  // Add more fields as needed
}

export interface Update${serviceName}Input {
  name?: string;
  // Add more fields as needed
}
`;
  }

  /**
   * Generate validation schemas
   */
  private generateValidationSchemas(spec: ServiceSpec): string {
    const serviceName = this.toPascalCase(spec.name);

    return `import { z } from 'zod';

export const ${serviceName}Schema = {
  create: z.object({
    body: z.object({
      name: z.string().min(1).max(255),
      // Add more validation rules
    }),
  }),

  update: z.object({
    body: z.object({
      name: z.string().min(1).max(255).optional(),
      // Add more validation rules
    }),
    params: z.object({
      id: z.string().cuid(),
    }),
  }),
};
`;
  }

  /**
   * Generate package.json
   */
  private generatePackageJson(spec: ServiceSpec): string {
    const serviceName = this.toKebabCase(spec.name);

    return JSON.stringify({
      name: serviceName,
      version: '1.0.0',
      description: `${spec.name} service`,
      main: 'dist/index.js',
      scripts: {
        dev: 'ts-node-dev --respawn --transpile-only src/index.ts',
        build: 'tsc',
        start: 'node dist/index.js',
        test: 'jest',
        'test:watch': 'jest --watch',
        lint: 'eslint src --ext .ts',
        'lint:fix': 'eslint src --ext .ts --fix',
      },
      dependencies: {
        express: '^4.18.2',
        cors: '^2.8.5',
        helmet: '^7.1.0',
        zod: '^3.22.4',
        ...(spec.database && {
          '@prisma/client': '^5.7.1',
        }),
        ...(spec.authentication && {
          jsonwebtoken: '^9.0.2',
          '@types/jsonwebtoken': '^9.0.5',
        }),
      },
      devDependencies: {
        '@types/express': '^4.17.21',
        '@types/cors': '^2.8.17',
        '@types/node': '^20.10.5',
        typescript: '^5.3.3',
        'ts-node-dev': '^2.0.0',
        jest: '^29.7.0',
        '@types/jest': '^29.5.11',
        'ts-jest': '^29.1.1',
        eslint: '^8.56.0',
        '@typescript-eslint/eslint-plugin': '^6.15.0',
        '@typescript-eslint/parser': '^6.15.0',
        ...(spec.database && {
          prisma: '^5.7.1',
        }),
      },
    }, null, 2);
  }

  /**
   * Generate tsconfig.json
   */
  private generateTsConfig(): string {
    return JSON.stringify({
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        lib: ['ES2020'],
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', '**/*.test.ts'],
    }, null, 2);
  }

  /**
   * Generate .env.example
   */
  private generateEnvExample(spec: ServiceSpec): string {
    let env = `PORT=${spec.port || 3000}\nNODE_ENV=development\n`;

    if (spec.database) {
      env += '\nDATABASE_URL=postgresql://user:password@localhost:5432/dbname\n';
    }

    if (spec.authentication) {
      env += '\nJWT_SECRET=your-secret-key-here\n';
    }

    return env;
  }

  /**
   * Generate README.md
   */
  private generateReadme(spec: ServiceSpec): string {
    const serviceName = spec.name;

    return `# ${serviceName} Service

## Description

${serviceName} service generated by AzStudio.

## Installation

\`\`\`bash
npm install
\`\`\`

## Configuration

Copy \`.env.example\` to \`.env\` and configure your environment variables.

${spec.database ? `## Database Setup

\`\`\`bash
npx prisma migrate dev
npx prisma generate
\`\`\`
` : ''}

## Development

\`\`\`bash
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`

## Production

\`\`\`bash
npm start
\`\`\`

## Testing

\`\`\`bash
npm test
\`\`\`

## API Endpoints

- \`GET /api/${this.toKebabCase(serviceName)}\` - Get all items
- \`GET /api/${this.toKebabCase(serviceName)}/:id\` - Get item by ID
- \`POST /api/${this.toKebabCase(serviceName)}\` - Create new item
- \`PUT /api/${this.toKebabCase(serviceName)}/:id\` - Update item
- \`DELETE /api/${this.toKebabCase(serviceName)}/:id\` - Delete item

## Health Check

\`GET /health\` - Service health status
`;
  }

  // Utility methods
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

  private toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }
}
