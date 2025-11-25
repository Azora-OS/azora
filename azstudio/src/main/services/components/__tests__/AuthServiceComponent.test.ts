import { AuthServiceComponent, AuthServiceConfig } from '../AuthServiceComponent';
import { FileChange } from '../../ChangesetManager';

describe('AuthServiceComponent', () => {
  let authComponent: AuthServiceComponent;
  const outputDir = '/test/output';

  beforeEach(() => {
    authComponent = new AuthServiceComponent();
  });

  describe('generateAuthService', () => {
    it('should generate basic auth service files', () => {
      const config: AuthServiceConfig = {
        name: 'test-auth',
        port: 3001,
      };

      const changes = authComponent.generateAuthService(config, outputDir);

      expect(changes).toBeInstanceOf(Array);
      expect(changes.length).toBeGreaterThan(0);

      // Check for essential files
      const filePaths = changes.map(c => c.path);
      expect(filePaths).toContain(expect.stringContaining('index.ts'));
      expect(filePaths).toContain(expect.stringContaining('auth.controller.ts'));
      expect(filePaths).toContain(expect.stringContaining('auth.service.ts'));
      expect(filePaths).toContain(expect.stringContaining('token.service.ts'));
      expect(filePaths).toContain(expect.stringContaining('session.service.ts'));
      expect(filePaths).toContain(expect.stringContaining('user.repository.ts'));
      expect(filePaths).toContain(expect.stringContaining('schema.prisma'));
      expect(filePaths).toContain(expect.stringContaining('package.json'));
    });

    it('should include MFA endpoints when enabled', () => {
      const config: AuthServiceConfig = {
        name: 'test-auth',
        enableMFA: true,
      };

      const changes = authComponent.generateAuthService(config, outputDir);
      const controllerFile = changes.find(c => c.path.includes('auth.controller.ts'));

      expect(controllerFile).toBeDefined();
      expect(controllerFile!.content).toContain('enableMFA');
      expect(controllerFile!.content).toContain('verifyMFA');
      expect(controllerFile!.content).toContain('disableMFA');
    });

    it('should generate JWT authentication logic', () => {
      const config: AuthServiceConfig = {
        name: 'test-auth',
      };

      const changes = authComponent.generateAuthService(config, outputDir);
      const serviceFile = changes.find(c => c.path.includes('auth.service.ts'));

      expect(serviceFile).toBeDefined();
      expect(serviceFile!.content).toContain('register');
      expect(serviceFile!.content).toContain('login');
      expect(serviceFile!.content).toContain('logout');
      expect(serviceFile!.content).toContain('refreshToken');
    });

    it('should generate password reset functionality', () => {
      const config: AuthServiceConfig = {
        name: 'test-auth',
        passwordResetExpiry: 2,
      };

      const changes = authComponent.generateAuthService(config, outputDir);
      const serviceFile = changes.find(c => c.path.includes('auth.service.ts'));

      expect(serviceFile).toBeDefined();
      expect(serviceFile!.content).toContain('requestPasswordReset');
      expect(serviceFile!.content).toContain('confirmPasswordReset');
    });

    it('should generate session management', () => {
      const config: AuthServiceConfig = {
        name: 'test-auth',
        sessionDuration: 48,
      };

      const changes = authComponent.generateAuthService(config, outputDir);
      const sessionFile = changes.find(c => c.path.includes('session.service.ts'));

      expect(sessionFile).toBeDefined();
      expect(sessionFile!.content).toContain('createSession');
      expect(sessionFile!.content).toContain('getSessionByToken');
      expect(sessionFile!.content).toContain('deleteSessionByToken');
      expect(sessionFile!.content).toContain('cleanupExpiredSessions');
    });

    it('should generate Prisma schema with User and Session models', () => {
      const config: AuthServiceConfig = {
        name: 'test-auth',
      };

      const changes = authComponent.generateAuthService(config, outputDir);
      const schemaFile = changes.find(c => c.path.includes('schema.prisma'));

      expect(schemaFile).toBeDefined();
      expect(schemaFile!.content).toContain('model User');
      expect(schemaFile!.content).toContain('model Session');
      expect(schemaFile!.content).toContain('passwordResetToken');
      expect(schemaFile!.content).toContain('refreshToken');
    });

    it('should include MFA fields in schema when enabled', () => {
      const config: AuthServiceConfig = {
        name: 'test-auth',
        enableMFA: true,
      };

      const changes = authComponent.generateAuthService(config, outputDir);
      const schemaFile = changes.find(c => c.path.includes('schema.prisma'));

      expect(schemaFile).toBeDefined();
      expect(schemaFile!.content).toContain('mfaEnabled');
      expect(schemaFile!.content).toContain('mfaSecret');
    });

    it('should generate validation schemas with Zod', () => {
      const config: AuthServiceConfig = {
        name: 'test-auth',
      };

      const changes = authComponent.generateAuthService(config, outputDir);
      const validationFile = changes.find(c => c.path.includes('auth.schemas.ts'));

      expect(validationFile).toBeDefined();
      expect(validationFile!.content).toContain('z.object');
      expect(validationFile!.content).toContain('register');
      expect(validationFile!.content).toContain('login');
      expect(validationFile!.content).toContain('passwordResetRequest');
    });

    it('should generate auth middleware', () => {
      const config: AuthServiceConfig = {
        name: 'test-auth',
      };

      const changes = authComponent.generateAuthService(config, outputDir);
      const middlewareFile = changes.find(c => c.path.includes('auth.middleware.ts'));

      expect(middlewareFile).toBeDefined();
      expect(middlewareFile!.content).toContain('authMiddleware');
      expect(middlewareFile!.content).toContain('verifyAccessToken');
      expect(middlewareFile!.content).toContain('optionalAuth');
    });

    it('should generate password utilities with bcrypt', () => {
      const config: AuthServiceConfig = {
        name: 'test-auth',
      };

      const changes = authComponent.generateAuthService(config, outputDir);
      const passwordFile = changes.find(c => c.path.includes('password.ts'));

      expect(passwordFile).toBeDefined();
      expect(passwordFile!.content).toContain('hashPassword');
      expect(passwordFile!.content).toContain('verifyPassword');
      expect(passwordFile!.content).toContain('bcrypt');
    });

    it('should generate package.json with correct dependencies', () => {
      const config: AuthServiceConfig = {
        name: 'test-auth',
        enableMFA: true,
      };

      const changes = authComponent.generateAuthService(config, outputDir);
      const packageFile = changes.find(c => c.path.includes('package.json'));

      expect(packageFile).toBeDefined();
      const packageJson = JSON.parse(packageFile!.content);
      
      expect(packageJson.dependencies).toHaveProperty('express');
      expect(packageJson.dependencies).toHaveProperty('jsonwebtoken');
      expect(packageJson.dependencies).toHaveProperty('bcrypt');
      expect(packageJson.dependencies).toHaveProperty('@prisma/client');
      expect(packageJson.dependencies).toHaveProperty('speakeasy');
      expect(packageJson.dependencies).toHaveProperty('qrcode');
    });

    it('should generate README with API documentation', () => {
      const config: AuthServiceConfig = {
        name: 'test-auth',
        enableMFA: true,
      };

      const changes = authComponent.generateAuthService(config, outputDir);
      const readmeFile = changes.find(c => c.path.includes('README.md'));

      expect(readmeFile).toBeDefined();
      expect(readmeFile!.content).toContain('Auth Service');
      expect(readmeFile!.content).toContain('/api/auth/register');
      expect(readmeFile!.content).toContain('/api/auth/login');
      expect(readmeFile!.content).toContain('/api/auth/mfa/enable');
    });

    it('should use custom port when specified', () => {
      const config: AuthServiceConfig = {
        name: 'test-auth',
        port: 4000,
      };

      const changes = authComponent.generateAuthService(config, outputDir);
      const indexFile = changes.find(c => c.path.includes('src/index.ts'));

      expect(indexFile).toBeDefined();
      expect(indexFile!.content).toContain('4000');
    });

    it('should use custom session duration', () => {
      const config: AuthServiceConfig = {
        name: 'test-auth',
        sessionDuration: 72,
      };

      const changes = authComponent.generateAuthService(config, outputDir);
      const tokenFile = changes.find(c => c.path.includes('token.service.ts'));

      expect(tokenFile).toBeDefined();
      expect(tokenFile!.content).toContain('72h');
    });
  });
});
