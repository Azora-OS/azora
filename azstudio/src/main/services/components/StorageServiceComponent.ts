import * as path from 'path';
import { FileChange } from '../ChangesetManager';

export interface StorageServiceConfig {
  name: string;
  port?: number;
  provider?: 's3' | 'r2' | 'local';
  enableImageOptimization?: boolean;
  enableSignedUrls?: boolean;
  maxFileSize?: number; // in MB
}

export class StorageServiceComponent {
  /**
   * Generate complete storage service with S3/R2 integration
   */
  generateStorageService(config: StorageServiceConfig, outputDir: string): FileChange[] {
    const changes: FileChange[] = [];
    const serviceName = 'storage-service';
    const serviceDir = path.join(outputDir, 'services', serviceName);

    // Main service file
    changes.push({
      path: path.join(serviceDir, 'src', 'index.ts'),
      type: 'create',
      content: this.generateIndexFile(config),
    });

    // Controllers
    changes.push({
      path: path.join(serviceDir, 'src', 'controllers', 'storage.controller.ts'),
      type: 'create',
      content: this.generateStorageController(config),
    });

    // Services
    changes.push({
      path: path.join(serviceDir, 'src', 'services', 'storage.service.ts'),
      type: 'create',
      content: this.generateStorageServiceFile(config),
    });

    changes.push({
      path: path.join(serviceDir, 'src', 'services', 'provider.service.ts'),
      type: 'create',
      content: this.generateProviderService(config),
    });

    if (config.enableImageOptimization) {
      changes.push({
        path: path.join(serviceDir, 'src', 'services', 'image.service.ts'),
        type: 'create',
        content: this.generateImageService(),
      });
    }

    // Repository
    changes.push({
      path: path.join(serviceDir, 'src', 'repositories', 'file.repository.ts'),
      type: 'create',
      content: this.generateFileRepository(),
    });

    // Middleware
    changes.push({
      path: path.join(serviceDir, 'src', 'middleware', 'upload.middleware.ts'),
      type: 'create',
      content: this.generateUploadMiddleware(config),
    });

    // Types
    changes.push({
      path: path.join(serviceDir, 'src', 'types', 'index.ts'),
      type: 'create',
      content: this.generateTypes(config),
    });

    // Validation schemas
    changes.push({
      path: path.join(serviceDir, 'src', 'validation', 'storage.schemas.ts'),
      type: 'create',
      content: this.generateValidationSchemas(),
    });

    // Prisma schema
    changes.push({
      path: path.join(serviceDir, 'prisma', 'schema.prisma'),
      type: 'create',
      content: this.generatePrismaSchema(),
    });

    // Configuration files
    changes.push({
      path: path.join(serviceDir, 'package.json'),
      type: 'create',
      content: this.generatePackageJson(config),
    });

    changes.push({
      path: path.join(serviceDir, '.env.example'),
      type: 'create',
      content: this.generateEnvExample(config),
    });

    changes.push({
      path: path.join(serviceDir, 'README.md'),
      type: 'create',
      content: this.generateReadme(config),
    });

    return changes;
  }

  private generateIndexFile(config: StorageServiceConfig): string {
    const port = config.port || 3004;
    return `import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { StorageController } from './controllers/storage.controller';
import { errorHandler } from './middleware/error-handler';

const app: Application = express();
const PORT = process.env.PORT || ${port};

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'storage-service' });
});

// Routes
const storageController = new StorageController();
app.use('/api/storage', storageController.router);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(\`Storage service running on port \${PORT}\`);
});

export default app;
`;
  }

  private generateStorageController(config: StorageServiceConfig): string {
    return `import { Router, Request, Response, NextFunction } from 'express';
import { StorageService } from '../services/storage.service';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { authMiddleware } from '../middleware/auth.middleware';

export class StorageController {
  public router: Router;
  private storageService: StorageService;

  constructor() {
    this.router = Router();
    this.storageService = new StorageService();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Upload file
    this.router.post(
      '/upload',
      authMiddleware,
      uploadMiddleware.single('file'),
      this.uploadFile.bind(this)
    );
    
    // Upload multiple files
    this.router.post(
      '/upload-multiple',
      authMiddleware,
      uploadMiddleware.array('files', 10),
      this.uploadMultiple.bind(this)
    );
    
    // Get file
    this.router.get('/:id', this.getFile.bind(this));
    
    // Download file
    this.router.get('/:id/download', this.downloadFile.bind(this));
${config.enableSignedUrls ? `
    // Get signed URL
    this.router.get('/:id/signed-url', authMiddleware, this.getSignedUrl.bind(this));
` : ''}
    // Delete file
    this.router.delete('/:id', authMiddleware, this.deleteFile.bind(this));
    
    // List user files
    this.router.get('/', authMiddleware, this.listFiles.bind(this));
  }

  private async uploadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: 'No file provided' });
        return;
      }

      const file = await this.storageService.uploadFile(
        req.file,
        req.user!.userId
      );

      res.json({ success: true, data: file });
    } catch (error) {
      next(error);
    }
  }

  private async uploadMultiple(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        res.status(400).json({ success: false, error: 'No files provided' });
        return;
      }

      const files = await this.storageService.uploadMultiple(
        req.files,
        req.user!.userId
      );

      res.json({ success: true, data: files });
    } catch (error) {
      next(error);
    }
  }

  private async getFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = await this.storageService.getFile(req.params.id);
      res.json({ success: true, data: file });
    } catch (error) {
      next(error);
    }
  }

  private async downloadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url, file } = await this.storageService.getDownloadUrl(req.params.id);
      res.redirect(url);
    } catch (error) {
      next(error);
    }
  }
${config.enableSignedUrls ? `
  private async getSignedUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const url = await this.storageService.getSignedUrl(req.params.id, req.user!.userId);
      res.json({ success: true, data: { url } });
    } catch (error) {
      next(error);
    }
  }
` : ''}
  private async deleteFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.storageService.deleteFile(req.params.id, req.user!.userId);
      res.json({ success: true, message: 'File deleted' });
    } catch (error) {
      next(error);
    }
  }

  private async listFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = await this.storageService.listUserFiles(req.user!.userId);
      res.json({ success: true, data: files });
    } catch (error) {
      next(error);
    }
  }
}
`;
  }

  private generateStorageServiceFile(config: StorageServiceConfig): string {
    return `import { ProviderService } from './provider.service';
${config.enableImageOptimization ? "import { ImageService } from './image.service';" : ''}
import { FileRepository } from '../repositories/file.repository';
import { AppError } from '../middleware/error-handler';
import { File, UploadedFile } from '../types';
import * as crypto from 'crypto';

export class StorageService {
  private providerService: ProviderService;
${config.enableImageOptimization ? '  private imageService: ImageService;' : ''}
  private fileRepository: FileRepository;

  constructor() {
    this.providerService = new ProviderService();
${config.enableImageOptimization ? '    this.imageService = new ImageService();' : ''}
    this.fileRepository = new FileRepository();
  }

  async uploadFile(file: Express.Multer.File, userId: string): Promise<File> {
    const fileKey = this.generateFileKey(file.originalname);
${config.enableImageOptimization ? `
    // Optimize image if applicable
    let buffer = file.buffer;
    if (this.isImage(file.mimetype)) {
      buffer = await this.imageService.optimize(buffer, file.mimetype);
    }
` : '    const buffer = file.buffer;'}
    // Upload to storage provider
    const url = await this.providerService.upload(fileKey, buffer, file.mimetype);

    // Save metadata to database
    const savedFile = await this.fileRepository.create({
      userId,
      key: fileKey,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url,
    });

    return savedFile;
  }

  async uploadMultiple(files: Express.Multer.File[], userId: string): Promise<File[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, userId));
    return Promise.all(uploadPromises);
  }

  async getFile(id: string): Promise<File> {
    const file = await this.fileRepository.findById(id);
    if (!file) {
      throw new AppError(404, 'File not found');
    }
    return file;
  }

  async getDownloadUrl(id: string): Promise<{ url: string; file: File }> {
    const file = await this.getFile(id);
    const url = await this.providerService.getPublicUrl(file.key);
    return { url, file };
  }
${config.enableSignedUrls ? `
  async getSignedUrl(id: string, userId: string): Promise<string> {
    const file = await this.getFile(id);
    
    if (file.userId !== userId) {
      throw new AppError(403, 'Access denied');
    }

    return this.providerService.getSignedUrl(file.key, 3600); // 1 hour expiry
  }
` : ''}
  async deleteFile(id: string, userId: string): Promise<void> {
    const file = await this.getFile(id);
    
    if (file.userId !== userId) {
      throw new AppError(403, 'Access denied');
    }

    await this.providerService.delete(file.key);
    await this.fileRepository.delete(id);
  }

  async listUserFiles(userId: string): Promise<File[]> {
    return this.fileRepository.findByUserId(userId);
  }

  private generateFileKey(originalName: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const ext = originalName.split('.').pop();
    return \`uploads/\${timestamp}-\${random}.\${ext}\`;
  }
${config.enableImageOptimization ? `
  private isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }
` : ''}
}
`;
  }

  private generateProviderService(config: StorageServiceConfig): string {
    const provider = config.provider || 's3';
    
    return `${provider === 's3' || provider === 'r2' ? "import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';\nimport { getSignedUrl } from '@aws-sdk/s3-request-presigner';" : ''}
${provider === 'local' ? "import * as fs from 'fs/promises';\nimport * as path from 'path';" : ''}

export class ProviderService {
${provider === 's3' || provider === 'r2' ? `  private s3Client: S3Client;
  private bucket: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.${provider === 'r2' ? 'R2_REGION' : 'AWS_REGION'} || 'auto',
      endpoint: process.env.${provider === 'r2' ? 'R2_ENDPOINT' : 'S3_ENDPOINT'},
      credentials: {
        accessKeyId: process.env.${provider === 'r2' ? 'R2_ACCESS_KEY_ID' : 'AWS_ACCESS_KEY_ID'}!,
        secretAccessKey: process.env.${provider === 'r2' ? 'R2_SECRET_ACCESS_KEY' : 'AWS_SECRET_ACCESS_KEY'}!,
      },
    });
    this.bucket = process.env.${provider === 'r2' ? 'R2_BUCKET' : 'S3_BUCKET'}!;
  }

  async upload(key: string, buffer: Buffer, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await this.s3Client.send(command);
    return this.getPublicUrl(key);
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  async getPublicUrl(key: string): Promise<string> {
    const endpoint = process.env.${provider === 'r2' ? 'R2_PUBLIC_URL' : 'S3_PUBLIC_URL'};
    return \`\${endpoint}/\${key}\`;
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }` : ''}${provider === 'local' ? `  private uploadDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
  }

  async upload(key: string, buffer: Buffer, contentType: string): Promise<string> {
    const filePath = path.join(this.uploadDir, key);
    const dir = path.dirname(filePath);

    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(filePath, buffer);

    return this.getPublicUrl(key);
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key);
    await fs.unlink(filePath);
  }

  async getPublicUrl(key: string): Promise<string> {
    const baseUrl = process.env.BASE_URL || 'http://localhost:${config.port || 3004}';
    return \`\${baseUrl}/files/\${key}\`;
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    // For local storage, just return the public URL
    return this.getPublicUrl(key);
  }` : ''}
}
`;
  }

  private generateImageService(): string {
    return `import sharp from 'sharp';

export class ImageService {
  async optimize(buffer: Buffer, mimeType: string): Promise<Buffer> {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Resize if too large
    if (metadata.width && metadata.width > 2000) {
      image.resize(2000, null, { withoutEnlargement: true });
    }

    // Convert to appropriate format and optimize
    if (mimeType === 'image/png') {
      return image.png({ quality: 80, compressionLevel: 9 }).toBuffer();
    } else if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
      return image.jpeg({ quality: 80, progressive: true }).toBuffer();
    } else if (mimeType === 'image/webp') {
      return image.webp({ quality: 80 }).toBuffer();
    }

    return buffer;
  }

  async generateThumbnail(buffer: Buffer, width: number = 200): Promise<Buffer> {
    return sharp(buffer)
      .resize(width, null, { withoutEnlargement: true })
      .jpeg({ quality: 70 })
      .toBuffer();
  }
}
`;
  }

  private generateFileRepository(): string {
    return `import { PrismaClient } from '@prisma/client';
import { File, CreateFileInput } from '../types';

const prisma = new PrismaClient();

export class FileRepository {
  async create(data: CreateFileInput): Promise<File> {
    return prisma.file.create({ data });
  }

  async findById(id: string): Promise<File | null> {
    return prisma.file.findUnique({ where: { id } });
  }

  async findByUserId(userId: string): Promise<File[]> {
    return prisma.file.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.file.delete({ where: { id } });
  }
}
`;
  }

  private generateUploadMiddleware(config: StorageServiceConfig): string {
    const maxSize = (config.maxFileSize || 10) * 1024 * 1024; // Convert MB to bytes
    
    return `import multer from 'multer';
import { AppError } from './error-handler';

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Add file type validation here if needed
  cb(null, true);
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: ${maxSize}, // ${config.maxFileSize || 10}MB
  },
});
`;
  }

  private generateTypes(config: StorageServiceConfig): string {
    return `export interface File {
  id: string;
  userId: string;
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFileInput {
  userId: string;
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface UploadedFile {
  id: string;
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
}
`;
  }

  private generateValidationSchemas(): string {
    return `import { z } from 'zod';

export const StorageSchemas = {
  upload: z.object({
    file: z.any(),
  }),
};
`;
  }

  private generatePrismaSchema(): string {
    return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model File {
  id           String   @id @default(cuid())
  userId       String
  key          String   @unique
  originalName String
  mimeType     String
  size         Int
  url          String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@index([userId])
  @@index([createdAt])
  @@map("files")
}
`;
  }

  private generatePackageJson(config: StorageServiceConfig): string {
    const provider = config.provider || 's3';
    const dependencies: Record<string, string> = {
      express: '^4.18.2',
      cors: '^2.8.5',
      helmet: '^7.1.0',
      zod: '^3.22.4',
      '@prisma/client': '^5.7.1',
      multer: '^1.4.5-lts.1',
    };

    if (provider === 's3' || provider === 'r2') {
      dependencies['@aws-sdk/client-s3'] = '^3.470.0';
      dependencies['@aws-sdk/s3-request-presigner'] = '^3.470.0';
    }

    if (config.enableImageOptimization) {
      dependencies['sharp'] = '^0.33.1';
    }

    return JSON.stringify({
      name: 'storage-service',
      version: '1.0.0',
      description: 'File Storage Service',
      main: 'dist/index.js',
      scripts: {
        dev: 'ts-node-dev --respawn --transpile-only src/index.ts',
        build: 'tsc',
        start: 'node dist/index.js',
        test: 'jest',
        'test:watch': 'jest --watch',
        'prisma:generate': 'prisma generate',
        'prisma:migrate': 'prisma migrate dev',
      },
      dependencies,
      devDependencies: {
        '@types/express': '^4.17.21',
        '@types/cors': '^2.8.17',
        '@types/node': '^20.10.5',
        '@types/multer': '^1.4.11',
        typescript: '^5.3.3',
        'ts-node-dev': '^2.0.0',
        jest: '^29.7.0',
        '@types/jest': '^29.5.11',
        'ts-jest': '^29.1.1',
        prisma: '^5.7.1',
      },
    }, null, 2);
  }

  private generateEnvExample(config: StorageServiceConfig): string {
    const provider = config.provider || 's3';
    let env = `PORT=${config.port || 3004}\nNODE_ENV=development\n\nDATABASE_URL=postgresql://user:password@localhost:5432/storage_db\n`;

    if (provider === 's3') {
      env += '\nAWS_REGION=us-east-1\nAWS_ACCESS_KEY_ID=your_access_key\nAWS_SECRET_ACCESS_KEY=your_secret_key\nS3_BUCKET=your-bucket-name\nS3_PUBLIC_URL=https://your-bucket.s3.amazonaws.com\n';
    } else if (provider === 'r2') {
      env += '\nR2_REGION=auto\nR2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com\nR2_ACCESS_KEY_ID=your_access_key\nR2_SECRET_ACCESS_KEY=your_secret_key\nR2_BUCKET=your-bucket-name\nR2_PUBLIC_URL=https://your-domain.com\n';
    } else if (provider === 'local') {
      env += '\nUPLOAD_DIR=./uploads\nBASE_URL=http://localhost:3004\n';
    }

    return env;
  }

  private generateReadme(config: StorageServiceConfig): string {
    const provider = config.provider || 's3';
    return `# Storage Service

File storage service with ${provider.toUpperCase()} integration${config.enableImageOptimization ? ' and image optimization' : ''}.

## Features

- File upload and download
- ${provider.toUpperCase()} storage integration
${config.enableSignedUrls ? '- Signed URL generation\n' : ''}${config.enableImageOptimization ? '- Automatic image optimization\n' : ''}- File metadata tracking
- Multi-file upload support

## Installation

\`\`\`bash
npm install
\`\`\`

## Database Setup

\`\`\`bash
npx prisma migrate dev
npx prisma generate
\`\`\`

## Configuration

Copy \`.env.example\` to \`.env\` and configure your ${provider.toUpperCase()} credentials.

## Development

\`\`\`bash
npm run dev
\`\`\`

## Production

\`\`\`bash
npm run build
npm start
\`\`\`

## API Endpoints

- \`POST /api/storage/upload\` - Upload single file
- \`POST /api/storage/upload-multiple\` - Upload multiple files
- \`GET /api/storage/:id\` - Get file metadata
- \`GET /api/storage/:id/download\` - Download file
${config.enableSignedUrls ? '- `GET /api/storage/:id/signed-url` - Get signed URL\n' : ''}- \`DELETE /api/storage/:id\` - Delete file
- \`GET /api/storage\` - List user files

## Testing

\`\`\`bash
npm test
\`\`\`
${config.enableImageOptimization ? `
## Image Optimization

Images are automatically optimized on upload:
- Resized to max 2000px width
- Compressed with quality 80
- Converted to appropriate format
` : ''}
`;
  }
}
