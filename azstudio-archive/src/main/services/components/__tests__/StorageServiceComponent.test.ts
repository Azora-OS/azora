import { StorageServiceComponent, StorageServiceConfig } from '../StorageServiceComponent';

describe('StorageServiceComponent', () => {
  let storageComponent: StorageServiceComponent;
  const outputDir = '/test/output';

  beforeEach(() => {
    storageComponent = new StorageServiceComponent();
  });

  describe('generateStorageService', () => {
    it('should generate basic storage service files', () => {
      const config: StorageServiceConfig = {
        name: 'test-storage',
        port: 3004,
      };

      const changes = storageComponent.generateStorageService(config, outputDir);

      expect(changes).toBeInstanceOf(Array);
      expect(changes.length).toBeGreaterThan(0);

      const filePaths = changes.map(c => c.path);
      expect(filePaths).toContain(expect.stringContaining('index.ts'));
      expect(filePaths).toContain(expect.stringContaining('storage.controller.ts'));
      expect(filePaths).toContain(expect.stringContaining('storage.service.ts'));
      expect(filePaths).toContain(expect.stringContaining('provider.service.ts'));
      expect(filePaths).toContain(expect.stringContaining('file.repository.ts'));
    });

    it('should include image service when optimization is enabled', () => {
      const config: StorageServiceConfig = {
        name: 'test-storage',
        enableImageOptimization: true,
      };

      const changes = storageComponent.generateStorageService(config, outputDir);
      const filePaths = changes.map(c => c.path);
      
      expect(filePaths).toContain(expect.stringContaining('image.service.ts'));
    });

    it('should generate S3 provider by default', () => {
      const config: StorageServiceConfig = {
        name: 'test-storage',
      };

      const changes = storageComponent.generateStorageService(config, outputDir);
      const providerFile = changes.find(c => c.path.includes('provider.service.ts'));

      expect(providerFile).toBeDefined();
      expect(providerFile!.content).toContain('@aws-sdk/client-s3');
      expect(providerFile!.content).toContain('S3Client');
    });

    it('should generate R2 provider when specified', () => {
      const config: StorageServiceConfig = {
        name: 'test-storage',
        provider: 'r2',
      };

      const changes = storageComponent.generateStorageService(config, outputDir);
      const providerFile = changes.find(c => c.path.includes('provider.service.ts'));

      expect(providerFile).toBeDefined();
      expect(providerFile!.content).toContain('R2_ENDPOINT');
      expect(providerFile!.content).toContain('R2_BUCKET');
    });

    it('should generate local provider when specified', () => {
      const config: StorageServiceConfig = {
        name: 'test-storage',
        provider: 'local',
      };

      const changes = storageComponent.generateStorageService(config, outputDir);
      const providerFile = changes.find(c => c.path.includes('provider.service.ts'));

      expect(providerFile).toBeDefined();
      expect(providerFile!.content).toContain('UPLOAD_DIR');
      expect(providerFile!.content).toContain('fs.writeFile');
    });

    it('should include signed URL functionality when enabled', () => {
      const config: StorageServiceConfig = {
        name: 'test-storage',
        enableSignedUrls: true,
      };

      const changes = storageComponent.generateStorageService(config, outputDir);
      const controllerFile = changes.find(c => c.path.includes('storage.controller.ts'));
      const serviceFile = changes.find(c => c.path.includes('storage.service.ts'));

      expect(controllerFile!.content).toContain('getSignedUrl');
      expect(serviceFile!.content).toContain('getSignedUrl');
    });

    it('should generate file upload logic', () => {
      const config: StorageServiceConfig = {
        name: 'test-storage',
      };

      const changes = storageComponent.generateStorageService(config, outputDir);
      const serviceFile = changes.find(c => c.path.includes('storage.service.ts'));

      expect(serviceFile).toBeDefined();
      expect(serviceFile!.content).toContain('uploadFile');
      expect(serviceFile!.content).toContain('uploadMultiple');
      expect(serviceFile!.content).toContain('deleteFile');
    });

    it('should generate image optimization when enabled', () => {
      const config: StorageServiceConfig = {
        name: 'test-storage',
        enableImageOptimization: true,
      };

      const changes = storageComponent.generateStorageService(config, outputDir);
      const imageFile = changes.find(c => c.path.includes('image.service.ts'));

      expect(imageFile).toBeDefined();
      expect(imageFile!.content).toContain('sharp');
      expect(imageFile!.content).toContain('optimize');
      expect(imageFile!.content).toContain('generateThumbnail');
    });

    it('should generate upload middleware with file size limit', () => {
      const config: StorageServiceConfig = {
        name: 'test-storage',
        maxFileSize: 20,
      };

      const changes = storageComponent.generateStorageService(config, outputDir);
      const middlewareFile = changes.find(c => c.path.includes('upload.middleware.ts'));

      expect(middlewareFile).toBeDefined();
      expect(middlewareFile!.content).toContain('multer');
      expect(middlewareFile!.content).toContain('20MB');
    });

    it('should generate Prisma schema with File model', () => {
      const config: StorageServiceConfig = {
        name: 'test-storage',
      };

      const changes = storageComponent.generateStorageService(config, outputDir);
      const schemaFile = changes.find(c => c.path.includes('schema.prisma'));

      expect(schemaFile).toBeDefined();
      expect(schemaFile!.content).toContain('model File');
      expect(schemaFile!.content).toContain('originalName');
      expect(schemaFile!.content).toContain('mimeType');
      expect(schemaFile!.content).toContain('size');
    });

    it('should generate package.json with correct dependencies', () => {
      const config: StorageServiceConfig = {
        name: 'test-storage',
        provider: 's3',
        enableImageOptimization: true,
      };

      const changes = storageComponent.generateStorageService(config, outputDir);
      const packageFile = changes.find(c => c.path.includes('package.json'));

      expect(packageFile).toBeDefined();
      const packageJson = JSON.parse(packageFile!.content);
      
      expect(packageJson.dependencies).toHaveProperty('@aws-sdk/client-s3');
      expect(packageJson.dependencies).toHaveProperty('multer');
      expect(packageJson.dependencies).toHaveProperty('sharp');
    });

    it('should generate README with provider documentation', () => {
      const config: StorageServiceConfig = {
        name: 'test-storage',
        provider: 'r2',
        enableSignedUrls: true,
        enableImageOptimization: true,
      };

      const changes = storageComponent.generateStorageService(config, outputDir);
      const readmeFile = changes.find(c => c.path.includes('README.md'));

      expect(readmeFile).toBeDefined();
      expect(readmeFile!.content).toContain('Storage Service');
      expect(readmeFile!.content).toContain('R2');
      expect(readmeFile!.content).toContain('Image Optimization');
      expect(readmeFile!.content).toContain('/api/storage/upload');
    });

    it('should use custom port when specified', () => {
      const config: StorageServiceConfig = {
        name: 'test-storage',
        port: 5000,
      };

      const changes = storageComponent.generateStorageService(config, outputDir);
      const indexFile = changes.find(c => c.path.includes('src/index.ts'));

      expect(indexFile).toBeDefined();
      expect(indexFile!.content).toContain('5000');
    });
  });
});
