import * as path from 'path';
import { FileChange } from '../ChangesetManager';

export interface EmailServiceConfig {
  name: string;
  port?: number;
  provider?: 'sendgrid' | 'ses' | 'smtp';
  enableTemplates?: boolean;
  enableVerification?: boolean;
}

export class EmailServiceComponent {
  /**
   * Generate complete email service with templates
   */
  generateEmailService(config: EmailServiceConfig, outputDir: string): FileChange[] {
    const changes: FileChange[] = [];
    const serviceName = 'email-service';
    const serviceDir = path.join(outputDir, 'services', serviceName);

    // Main service file
    changes.push({
      path: path.join(serviceDir, 'src', 'index.ts'),
      type: 'create',
      content: this.generateIndexFile(config),
    });

    // Controllers
    changes.push({
      path: path.join(serviceDir, 'src', 'controllers', 'email.controller.ts'),
      type: 'create',
      content: this.generateEmailController(config),
    });

    // Services
    changes.push({
      path: path.join(serviceDir, 'src', 'services', 'email.service.ts'),
      type: 'create',
      content: this.generateEmailServiceFile(config),
    });

    changes.push({
      path: path.join(serviceDir, 'src', 'services', 'provider.service.ts'),
      type: 'create',
      content: this.generateProviderService(config),
    });

    if (config.enableTemplates) {
      changes.push({
        path: path.join(serviceDir, 'src', 'services', 'template.service.ts'),
        type: 'create',
        content: this.generateTemplateService(),
      });
    }

    // Repository
    changes.push({
      path: path.join(serviceDir, 'src', 'repositories', 'email.repository.ts'),
      type: 'create',
      content: this.generateEmailRepository(),
    });

    // Types
    changes.push({
      path: path.join(serviceDir, 'src', 'types', 'index.ts'),
      type: 'create',
      content: this.generateTypes(config),
    });

    // Validation schemas
    changes.push({
      path: path.join(serviceDir, 'src', 'validation', 'email.schemas.ts'),
      type: 'create',
      content: this.generateValidationSchemas(config),
    });

    // Prisma schema
    changes.push({
      path: path.join(serviceDir, 'prisma', 'schema.prisma'),
      type: 'create',
      content: this.generatePrismaSchema(config),
    });

    // Email templates
    if (config.enableTemplates) {
      changes.push({
        path: path.join(serviceDir, 'templates', 'welcome.html'),
        type: 'create',
        content: this.generateWelcomeTemplate(),
      });

      changes.push({
        path: path.join(serviceDir, 'templates', 'password-reset.html'),
        type: 'create',
        content: this.generatePasswordResetTemplate(),
      });

      changes.push({
        path: path.join(serviceDir, 'templates', 'verification.html'),
        type: 'create',
        content: this.generateVerificationTemplate(),
      });
    }

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

  private generateIndexFile(config: EmailServiceConfig): string {
    const port = config.port || 3003;
    return `import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { EmailController } from './controllers/email.controller';
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
  res.json({ status: 'healthy', service: 'email-service' });
});

// Routes
const emailController = new EmailController();
app.use('/api/email', emailController.router);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(\`Email service running on port \${PORT}\`);
});

export default app;
`;
  }

  private generateEmailController(config: EmailServiceConfig): string {
    return `import { Router, Request, Response, NextFunction } from 'express';
import { EmailService } from '../services/email.service';
import { validate } from '../middleware/validation';
import { EmailSchemas } from '../validation/email.schemas';
import { authMiddleware } from '../middleware/auth.middleware';

export class EmailController {
  public router: Router;
  private emailService: EmailService;

  constructor() {
    this.router = Router();
    this.emailService = new EmailService();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Send email
    this.router.post(
      '/send',
      authMiddleware,
      validate(EmailSchemas.send),
      this.sendEmail.bind(this)
    );
    
    // Send template email
    this.router.post(
      '/send-template',
      authMiddleware,
      validate(EmailSchemas.sendTemplate),
      this.sendTemplateEmail.bind(this)
    );
${config.enableVerification ? `
    // Send verification email
    this.router.post(
      '/verify',
      authMiddleware,
      validate(EmailSchemas.verify),
      this.sendVerificationEmail.bind(this)
    );
    
    // Verify email token
    this.router.get('/verify/:token', this.verifyEmailToken.bind(this));
` : ''}
    // Get email status
    this.router.get('/:id', authMiddleware, this.getEmailStatus.bind(this));
    
    // List sent emails
    this.router.get('/', authMiddleware, this.listEmails.bind(this));
  }

  private async sendEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.emailService.sendEmail(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  private async sendTemplateEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.emailService.sendTemplateEmail(
        req.body.to,
        req.body.template,
        req.body.data
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
${config.enableVerification ? `
  private async sendVerificationEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.emailService.sendVerificationEmail(req.body.email, req.body.userId);
      res.json({ success: true, message: 'Verification email sent' });
    } catch (error) {
      next(error);
    }
  }

  private async verifyEmailToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.emailService.verifyEmailToken(req.params.token);
      res.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
      next(error);
    }
  }
` : ''}
  private async getEmailStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = await this.emailService.getEmailById(req.params.id);
      res.json({ success: true, data: email });
    } catch (error) {
      next(error);
    }
  }

  private async listEmails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const emails = await this.emailService.listEmails();
      res.json({ success: true, data: emails });
    } catch (error) {
      next(error);
    }
  }
}
`;
  }

  private generateEmailServiceFile(config: EmailServiceConfig): string {
    return `import { ProviderService } from './provider.service';
${config.enableTemplates ? "import { TemplateService } from './template.service';" : ''}
import { EmailRepository } from '../repositories/email.repository';
import { SendEmailInput, Email } from '../types';
${config.enableVerification ? "import * as crypto from 'crypto';" : ''}

export class EmailService {
  private providerService: ProviderService;
${config.enableTemplates ? '  private templateService: TemplateService;' : ''}
  private emailRepository: EmailRepository;

  constructor() {
    this.providerService = new ProviderService();
${config.enableTemplates ? '    this.templateService = new TemplateService();' : ''}
    this.emailRepository = new EmailRepository();
  }

  async sendEmail(input: SendEmailInput): Promise<Email> {
    // Send via provider
    const messageId = await this.providerService.send({
      to: input.to,
      from: input.from || process.env.EMAIL_FROM || 'noreply@example.com',
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    // Save to database
    const email = await this.emailRepository.create({
      to: input.to,
      from: input.from || process.env.EMAIL_FROM || 'noreply@example.com',
      subject: input.subject,
      html: input.html,
      text: input.text,
      messageId,
      status: 'sent',
    });

    return email;
  }
${config.enableTemplates ? `
  async sendTemplateEmail(to: string, templateName: string, data: Record<string, any>): Promise<Email> {
    const { subject, html, text } = await this.templateService.render(templateName, data);

    return this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }
` : ''}${config.enableVerification ? `
  async sendVerificationEmail(email: string, userId: string): Promise<void> {
    const token = crypto.randomBytes(32).toString('hex');
    const verificationUrl = \`\${process.env.APP_URL}/verify-email/\${token}\`;

    await this.emailRepository.saveVerificationToken(userId, token);

    await this.sendTemplateEmail(email, 'verification', {
      verificationUrl,
    });
  }

  async verifyEmailToken(token: string): Promise<void> {
    const verification = await this.emailRepository.findVerificationToken(token);
    
    if (!verification) {
      throw new Error('Invalid or expired verification token');
    }

    await this.emailRepository.markEmailVerified(verification.userId);
    await this.emailRepository.deleteVerificationToken(token);
  }
` : ''}
  async getEmailById(id: string): Promise<Email | null> {
    return this.emailRepository.findById(id);
  }

  async listEmails(): Promise<Email[]> {
    return this.emailRepository.findAll();
  }
}
`;
  }

  private generateProviderService(config: EmailServiceConfig): string {
    const provider = config.provider || 'sendgrid';
    
    return `${provider === 'sendgrid' ? "import sgMail from '@sendgrid/mail';" : ''}
${provider === 'ses' ? "import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';" : ''}
${provider === 'smtp' ? "import nodemailer from 'nodemailer';" : ''}

interface SendEmailParams {
  to: string;
  from: string;
  subject: string;
  html?: string;
  text?: string;
}

export class ProviderService {
${provider === 'sendgrid' ? `  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY is required');
    }
    sgMail.setApiKey(apiKey);
  }

  async send(params: SendEmailParams): Promise<string> {
    const msg = {
      to: params.to,
      from: params.from,
      subject: params.subject,
      html: params.html,
      text: params.text,
    };

    const [response] = await sgMail.send(msg);
    return response.headers['x-message-id'] || '';
  }` : ''}${provider === 'ses' ? `  private sesClient: SESClient;

  constructor() {
    this.sesClient = new SESClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  async send(params: SendEmailParams): Promise<string> {
    const command = new SendEmailCommand({
      Source: params.from,
      Destination: {
        ToAddresses: [params.to],
      },
      Message: {
        Subject: {
          Data: params.subject,
        },
        Body: {
          Html: params.html ? { Data: params.html } : undefined,
          Text: params.text ? { Data: params.text } : undefined,
        },
      },
    });

    const response = await this.sesClient.send(command);
    return response.MessageId || '';
  }` : ''}${provider === 'smtp' ? `  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async send(params: SendEmailParams): Promise<string> {
    const info = await this.transporter.sendMail({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    return info.messageId;
  }` : ''}
}
`;
  }

  private generateTemplateService(): string {
    return `import * as fs from 'fs/promises';
import * as path from 'path';
import Handlebars from 'handlebars';

interface RenderedTemplate {
  subject: string;
  html: string;
  text: string;
}

export class TemplateService {
  private templatesDir: string;

  constructor() {
    this.templatesDir = path.join(__dirname, '../../templates');
  }

  async render(templateName: string, data: Record<string, any>): Promise<RenderedTemplate> {
    const templatePath = path.join(this.templatesDir, \`\${templateName}.html\`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');

    const template = Handlebars.compile(templateContent);
    const html = template(data);

    // Extract subject from template (first line comment)
    const subjectMatch = html.match(/<!--\\s*SUBJECT:\\s*(.+?)\\s*-->/);
    const subject = subjectMatch ? subjectMatch[1] : 'No Subject';

    // Generate plain text version
    const text = this.htmlToText(html);

    return { subject, html, text };
  }

  private htmlToText(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\\s+/g, ' ')
      .trim();
  }
}
`;
  }

  private generateEmailRepository(): string {
    return `import { PrismaClient } from '@prisma/client';
import { Email, CreateEmailInput } from '../types';

const prisma = new PrismaClient();

export class EmailRepository {
  async create(data: CreateEmailInput): Promise<Email> {
    return prisma.email.create({ data });
  }

  async findById(id: string): Promise<Email | null> {
    return prisma.email.findUnique({ where: { id } });
  }

  async findAll(): Promise<Email[]> {
    return prisma.email.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async updateStatus(id: string, status: string): Promise<Email> {
    return prisma.email.update({
      where: { id },
      data: { status },
    });
  }

  async saveVerificationToken(userId: string, token: string): Promise<void> {
    await prisma.emailVerification.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });
  }

  async findVerificationToken(token: string): Promise<{ userId: string } | null> {
    return prisma.emailVerification.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async markEmailVerified(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  }

  async deleteVerificationToken(token: string): Promise<void> {
    await prisma.emailVerification.deleteMany({
      where: { token },
    });
  }
}
`;
  }

  private generateTypes(config: EmailServiceConfig): string {
    return `export interface Email {
  id: string;
  to: string;
  from: string;
  subject: string;
  html?: string;
  text?: string;
  messageId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmailInput {
  to: string;
  from: string;
  subject: string;
  html?: string;
  text?: string;
  messageId: string;
  status: string;
}

export interface SendEmailInput {
  to: string;
  from?: string;
  subject: string;
  html?: string;
  text?: string;
}
`;
  }

  private generateValidationSchemas(config: EmailServiceConfig): string {
    return `import { z } from 'zod';

export const EmailSchemas = {
  send: z.object({
    body: z.object({
      to: z.string().email('Invalid email address'),
      from: z.string().email('Invalid email address').optional(),
      subject: z.string().min(1, 'Subject is required'),
      html: z.string().optional(),
      text: z.string().optional(),
    }),
  }),

  sendTemplate: z.object({
    body: z.object({
      to: z.string().email('Invalid email address'),
      template: z.string().min(1, 'Template name is required'),
      data: z.record(z.any()),
    }),
  }),
${config.enableVerification ? `
  verify: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      userId: z.string().min(1, 'User ID is required'),
    }),
  }),
` : ''}
};
`;
  }

  private generatePrismaSchema(config: EmailServiceConfig): string {
    return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Email {
  id        String   @id @default(cuid())
  to        String
  from      String
  subject   String
  html      String?  @db.Text
  text      String?  @db.Text
  messageId String
  status    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([status])
  @@index([createdAt])
  @@map("emails")
}
${config.enableVerification ? `
model EmailVerification {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  @@index([token])
  @@index([userId])
  @@map("email_verifications")
}

model User {
  id            String  @id @default(cuid())
  email         String  @unique
  emailVerified Boolean @default(false)
  
  @@map("users")
}
` : ''}
`;
  }

  private generateWelcomeTemplate(): string {
    return `<!-- SUBJECT: Welcome to {{appName}}! -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Welcome</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #4F46E5;">Welcome to {{appName}}!</h1>
    <p>Hi {{name}},</p>
    <p>Thank you for signing up. We're excited to have you on board!</p>
    <p>Get started by exploring our features and let us know if you need any help.</p>
    <p>Best regards,<br>The {{appName}} Team</p>
  </div>
</body>
</html>
`;
  }

  private generatePasswordResetTemplate(): string {
    return `<!-- SUBJECT: Reset Your Password -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Password Reset</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #4F46E5;">Reset Your Password</h1>
    <p>Hi {{name}},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{resetUrl}}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
    </div>
    <p>If you didn't request this, you can safely ignore this email.</p>
    <p>This link will expire in 1 hour.</p>
    <p>Best regards,<br>The {{appName}} Team</p>
  </div>
</body>
</html>
`;
  }

  private generateVerificationTemplate(): string {
    return `<!-- SUBJECT: Verify Your Email Address -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Email Verification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #4F46E5;">Verify Your Email</h1>
    <p>Please verify your email address by clicking the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{verificationUrl}}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
    </div>
    <p>If you didn't create an account, you can safely ignore this email.</p>
    <p>Best regards,<br>The {{appName}} Team</p>
  </div>
</body>
</html>
`;
  }

  private generatePackageJson(config: EmailServiceConfig): string {
    const provider = config.provider || 'sendgrid';
    const dependencies: Record<string, string> = {
      express: '^4.18.2',
      cors: '^2.8.5',
      helmet: '^7.1.0',
      zod: '^3.22.4',
      '@prisma/client': '^5.7.1',
    };

    if (provider === 'sendgrid') {
      dependencies['@sendgrid/mail'] = '^7.7.0';
    } else if (provider === 'ses') {
      dependencies['@aws-sdk/client-ses'] = '^3.470.0';
    } else if (provider === 'smtp') {
      dependencies['nodemailer'] = '^6.9.7';
    }

    if (config.enableTemplates) {
      dependencies['handlebars'] = '^4.7.8';
    }

    return JSON.stringify({
      name: 'email-service',
      version: '1.0.0',
      description: 'Email Service with Templates',
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
        ...(provider === 'smtp' && { '@types/nodemailer': '^6.4.14' }),
        ...(config.enableTemplates && { '@types/handlebars': '^4.1.0' }),
        typescript: '^5.3.3',
        'ts-node-dev': '^2.0.0',
        jest: '^29.7.0',
        '@types/jest': '^29.5.11',
        'ts-jest': '^29.1.1',
        prisma: '^5.7.1',
      },
    }, null, 2);
  }

  private generateEnvExample(config: EmailServiceConfig): string {
    const provider = config.provider || 'sendgrid';
    let env = `PORT=${config.port || 3003}\nNODE_ENV=development\n\nDATABASE_URL=postgresql://user:password@localhost:5432/email_db\n\nEMAIL_FROM=noreply@example.com\n`;

    if (provider === 'sendgrid') {
      env += '\nSENDGRID_API_KEY=your_sendgrid_api_key\n';
    } else if (provider === 'ses') {
      env += '\nAWS_REGION=us-east-1\nAWS_ACCESS_KEY_ID=your_access_key\nAWS_SECRET_ACCESS_KEY=your_secret_key\n';
    } else if (provider === 'smtp') {
      env += '\nSMTP_HOST=smtp.example.com\nSMTP_PORT=587\nSMTP_SECURE=false\nSMTP_USER=your_smtp_user\nSMTP_PASS=your_smtp_password\n';
    }

    if (config.enableVerification) {
      env += '\nAPP_URL=http://localhost:3000\n';
    }

    return env;
  }

  private generateReadme(config: EmailServiceConfig): string {
    const provider = config.provider || 'sendgrid';
    return `# Email Service

Email service with ${provider.toUpperCase()} integration${config.enableTemplates ? ' and template support' : ''}.

## Features

- Email sending via ${provider.toUpperCase()}
${config.enableTemplates ? '- HTML email templates with Handlebars\n' : ''}- Transactional email tracking
${config.enableVerification ? '- Email verification\n' : ''}- Email status monitoring

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

- \`POST /api/email/send\` - Send email
${config.enableTemplates ? '- `POST /api/email/send-template` - Send template email\n' : ''}${config.enableVerification ? '- `POST /api/email/verify` - Send verification email\n- `GET /api/email/verify/:token` - Verify email token\n' : ''}- \`GET /api/email/:id\` - Get email status
- \`GET /api/email\` - List sent emails

## Testing

\`\`\`bash
npm test
\`\`\`
${config.enableTemplates ? `
## Email Templates

Templates are located in the \`templates/\` directory and use Handlebars syntax.

Available templates:
- \`welcome.html\` - Welcome email
- \`password-reset.html\` - Password reset email
- \`verification.html\` - Email verification

To create a new template, add an HTML file with a subject comment:
\`\`\`html
<!-- SUBJECT: Your Subject Here -->
<!DOCTYPE html>
<html>
  <!-- Your template content -->
</html>
\`\`\`
` : ''}
`;
  }
}
