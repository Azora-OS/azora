import { EmailServiceComponent, EmailServiceConfig } from '../EmailServiceComponent';

describe('EmailServiceComponent', () => {
  let emailComponent: EmailServiceComponent;
  const outputDir = '/test/output';

  beforeEach(() => {
    emailComponent = new EmailServiceComponent();
  });

  describe('generateEmailService', () => {
    it('should generate basic email service files', () => {
      const config: EmailServiceConfig = {
        name: 'test-email',
        port: 3003,
      };

      const changes = emailComponent.generateEmailService(config, outputDir);

      expect(changes).toBeInstanceOf(Array);
      expect(changes.length).toBeGreaterThan(0);

      const filePaths = changes.map(c => c.path);
      expect(filePaths).toContain(expect.stringContaining('index.ts'));
      expect(filePaths).toContain(expect.stringContaining('email.controller.ts'));
      expect(filePaths).toContain(expect.stringContaining('email.service.ts'));
      expect(filePaths).toContain(expect.stringContaining('provider.service.ts'));
      expect(filePaths).toContain(expect.stringContaining('email.repository.ts'));
    });

    it('should include template service when enabled', () => {
      const config: EmailServiceConfig = {
        name: 'test-email',
        enableTemplates: true,
      };

      const changes = emailComponent.generateEmailService(config, outputDir);
      const filePaths = changes.map(c => c.path);
      
      expect(filePaths).toContain(expect.stringContaining('template.service.ts'));
      expect(filePaths).toContain(expect.stringContaining('welcome.html'));
      expect(filePaths).toContain(expect.stringContaining('password-reset.html'));
      expect(filePaths).toContain(expect.stringContaining('verification.html'));
    });

    it('should generate SendGrid provider by default', () => {
      const config: EmailServiceConfig = {
        name: 'test-email',
      };

      const changes = emailComponent.generateEmailService(config, outputDir);
      const providerFile = changes.find(c => c.path.includes('provider.service.ts'));

      expect(providerFile).toBeDefined();
      expect(providerFile!.content).toContain('@sendgrid/mail');
      expect(providerFile!.content).toContain('SENDGRID_API_KEY');
    });

    it('should generate SES provider when specified', () => {
      const config: EmailServiceConfig = {
        name: 'test-email',
        provider: 'ses',
      };

      const changes = emailComponent.generateEmailService(config, outputDir);
      const providerFile = changes.find(c => c.path.includes('provider.service.ts'));

      expect(providerFile).toBeDefined();
      expect(providerFile!.content).toContain('@aws-sdk/client-ses');
      expect(providerFile!.content).toContain('SESClient');
    });

    it('should generate SMTP provider when specified', () => {
      const config: EmailServiceConfig = {
        name: 'test-email',
        provider: 'smtp',
      };

      const changes = emailComponent.generateEmailService(config, outputDir);
      const providerFile = changes.find(c => c.path.includes('provider.service.ts'));

      expect(providerFile).toBeDefined();
      expect(providerFile!.content).toContain('nodemailer');
      expect(providerFile!.content).toContain('SMTP_HOST');
    });

    it('should include verification endpoints when enabled', () => {
      const config: EmailServiceConfig = {
        name: 'test-email',
        enableVerification: true,
      };

      const changes = emailComponent.generateEmailService(config, outputDir);
      const controllerFile = changes.find(c => c.path.includes('email.controller.ts'));

      expect(controllerFile).toBeDefined();
      expect(controllerFile!.content).toContain('sendVerificationEmail');
      expect(controllerFile!.content).toContain('verifyEmailToken');
    });

    it('should generate email sending logic', () => {
      const config: EmailServiceConfig = {
        name: 'test-email',
      };

      const changes = emailComponent.generateEmailService(config, outputDir);
      const serviceFile = changes.find(c => c.path.includes('email.service.ts'));

      expect(serviceFile).toBeDefined();
      expect(serviceFile!.content).toContain('sendEmail');
      expect(serviceFile!.content).toContain('getEmailById');
      expect(serviceFile!.content).toContain('listEmails');
    });

    it('should generate template rendering when enabled', () => {
      const config: EmailServiceConfig = {
        name: 'test-email',
        enableTemplates: true,
      };

      const changes = emailComponent.generateEmailService(config, outputDir);
      const templateFile = changes.find(c => c.path.includes('template.service.ts'));

      expect(templateFile).toBeDefined();
      expect(templateFile!.content).toContain('Handlebars');
      expect(templateFile!.content).toContain('render');
      expect(templateFile!.content).toContain('htmlToText');
    });

    it('should generate Prisma schema with Email model', () => {
      const config: EmailServiceConfig = {
        name: 'test-email',
      };

      const changes = emailComponent.generateEmailService(config, outputDir);
      const schemaFile = changes.find(c => c.path.includes('schema.prisma'));

      expect(schemaFile).toBeDefined();
      expect(schemaFile!.content).toContain('model Email');
      expect(schemaFile!.content).toContain('messageId');
      expect(schemaFile!.content).toContain('status');
    });

    it('should include verification models when enabled', () => {
      const config: EmailServiceConfig = {
        name: 'test-email',
        enableVerification: true,
      };

      const changes = emailComponent.generateEmailService(config, outputDir);
      const schemaFile = changes.find(c => c.path.includes('schema.prisma'));

      expect(schemaFile).toBeDefined();
      expect(schemaFile!.content).toContain('model EmailVerification');
      expect(schemaFile!.content).toContain('emailVerified');
    });

    it('should generate validation schemas', () => {
      const config: EmailServiceConfig = {
        name: 'test-email',
        enableVerification: true,
      };

      const changes = emailComponent.generateEmailService(config, outputDir);
      const validationFile = changes.find(c => c.path.includes('email.schemas.ts'));

      expect(validationFile).toBeDefined();
      expect(validationFile!.content).toContain('send');
      expect(validationFile!.content).toContain('sendTemplate');
      expect(validationFile!.content).toContain('verify');
    });

    it('should generate HTML email templates', () => {
      const config: EmailServiceConfig = {
        name: 'test-email',
        enableTemplates: true,
      };

      const changes = emailComponent.generateEmailService(config, outputDir);
      const welcomeTemplate = changes.find(c => c.path.includes('welcome.html'));
      const resetTemplate = changes.find(c => c.path.includes('password-reset.html'));

      expect(welcomeTemplate).toBeDefined();
      expect(welcomeTemplate!.content).toContain('SUBJECT:');
      expect(welcomeTemplate!.content).toContain('{{appName}}');
      
      expect(resetTemplate).toBeDefined();
      expect(resetTemplate!.content).toContain('{{resetUrl}}');
    });

    it('should generate package.json with correct provider dependency', () => {
      const config: EmailServiceConfig = {
        name: 'test-email',
        provider: 'sendgrid',
        enableTemplates: true,
      };

      const changes = emailComponent.generateEmailService(config, outputDir);
      const packageFile = changes.find(c => c.path.includes('package.json'));

      expect(packageFile).toBeDefined();
      const packageJson = JSON.parse(packageFile!.content);
      
      expect(packageJson.dependencies).toHaveProperty('@sendgrid/mail');
      expect(packageJson.dependencies).toHaveProperty('handlebars');
    });

    it('should generate README with template documentation', () => {
      const config: EmailServiceConfig = {
        name: 'test-email',
        enableTemplates: true,
        enableVerification: true,
      };

      const changes = emailComponent.generateEmailService(config, outputDir);
      const readmeFile = changes.find(c => c.path.includes('README.md'));

      expect(readmeFile).toBeDefined();
      expect(readmeFile!.content).toContain('Email Service');
      expect(readmeFile!.content).toContain('Email Templates');
      expect(readmeFile!.content).toContain('/api/email/send');
    });
  });
});
