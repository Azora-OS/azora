import * as path from 'path';
import { FileChange } from '../ChangesetManager';

export interface AuthServiceConfig {
  name: string;
  port?: number;
  jwtSecret?: string;
  enableOAuth?: boolean;
  enableMFA?: boolean;
  passwordResetExpiry?: number; // in hours
  sessionDuration?: number; // in hours
}

export class AuthServiceComponent {
  /**
   * Generate complete JWT authentication system
   */
  generateAuthService(config: AuthServiceConfig, outputDir: string): FileChange[] {
    const changes: FileChange[] = [];
    const serviceName = 'auth-service';
    const serviceDir = path.join(outputDir, 'services', serviceName);

    // Main service file
    changes.push({
      path: path.join(serviceDir, 'src', 'index.ts'),
      type: 'create',
      content: this.generateIndexFile(config),
    });

    // Controllers
    changes.push({
      path: path.join(serviceDir, 'src', 'controllers', 'auth.controller.ts'),
      type: 'create',
      content: this.generateAuthController(config),
    });

    // Services
    changes.push({
      path: path.join(serviceDir, 'src', 'services', 'auth.service.ts'),
      type: 'create',
      content: this.generateAuthServiceFile(config),
    });

    changes.push({
      path: path.join(serviceDir, 'src', 'services', 'token.service.ts'),
      type: 'create',
      content: this.generateTokenService(config),
    });

    changes.push({
      path: path.join(serviceDir, 'src', 'services', 'session.service.ts'),
      type: 'create',
      content: this.generateSessionService(config),
    });

    // Repository
    changes.push({
      path: path.join(serviceDir, 'src', 'repositories', 'user.repository.ts'),
      type: 'create',
      content: this.generateUserRepository(),
    });

    // Middleware
    changes.push({
      path: path.join(serviceDir, 'src', 'middleware', 'auth.middleware.ts'),
      type: 'create',
      content: this.generateAuthMiddleware(),
    });

    // Types
    changes.push({
      path: path.join(serviceDir, 'src', 'types', 'index.ts'),
      type: 'create',
      content: this.generateTypes(config),
    });

    // Validation schemas
    changes.push({
      path: path.join(serviceDir, 'src', 'validation', 'auth.schemas.ts'),
      type: 'create',
      content: this.generateValidationSchemas(),
    });

    // Prisma schema
    changes.push({
      path: path.join(serviceDir, 'prisma', 'schema.prisma'),
      type: 'create',
      content: this.generatePrismaSchema(config),
    });

    // Utilities
    changes.push({
      path: path.join(serviceDir, 'src', 'utils', 'password.ts'),
      type: 'create',
      content: this.generatePasswordUtils(),
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

  private generateIndexFile(config: AuthServiceConfig): string {
    const port = config.port || 3001;
    return `import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AuthController } from './controllers/auth.controller';
import { errorHandler } from './middleware/error-handler';

const app: Application = express();
const PORT = process.env.PORT || ${port};

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'auth-service' });
});

// Routes
const authController = new AuthController();
app.use('/api/auth', authController.router);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(\`Auth service running on port \${PORT}\`);
});

export default app;
`;
  }

  private generateAuthController(config: AuthServiceConfig): string {
    return `import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { validate } from '../middleware/validation';
import { AuthSchemas } from '../validation/auth.schemas';
import { authMiddleware } from '../middleware/auth.middleware';

export class AuthController {
  public router: Router;
  private authService: AuthService;

  constructor() {
    this.router = Router();
    this.authService = new AuthService();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Registration
    this.router.post('/register', validate(AuthSchemas.register), this.register.bind(this));
    
    // Login
    this.router.post('/login', validate(AuthSchemas.login), this.login.bind(this));
    
    // Logout
    this.router.post('/logout', authMiddleware, this.logout.bind(this));
    
    // Refresh token
    this.router.post('/refresh', this.refreshToken.bind(this));
    
    // Password reset request
    this.router.post('/password-reset/request', validate(AuthSchemas.passwordResetRequest), this.requestPasswordReset.bind(this));
    
    // Password reset confirm
    this.router.post('/password-reset/confirm', validate(AuthSchemas.passwordResetConfirm), this.confirmPasswordReset.bind(this));
    
    // Get current user
    this.router.get('/me', authMiddleware, this.getCurrentUser.bind(this));
    
    // Update password
    this.router.put('/password', authMiddleware, validate(AuthSchemas.updatePassword), this.updatePassword.bind(this));
${config.enableMFA ? `
    // MFA endpoints
    this.router.post('/mfa/enable', authMiddleware, this.enableMFA.bind(this));
    this.router.post('/mfa/verify', authMiddleware, validate(AuthSchemas.verifyMFA), this.verifyMFA.bind(this));
    this.router.post('/mfa/disable', authMiddleware, this.disableMFA.bind(this));
` : ''}
  }

  private async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  private async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.authService.login(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  private async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        await this.authService.logout(token);
      }
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  private async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await this.authService.refreshToken(refreshToken);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  private async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.authService.requestPasswordReset(req.body.email);
      res.json({ success: true, message: 'Password reset email sent' });
    } catch (error) {
      next(error);
    }
  }

  private async confirmPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.authService.confirmPasswordReset(req.body.token, req.body.newPassword);
      res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
      next(error);
    }
  }

  private async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.authService.getUserById(req.user!.userId);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  private async updatePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.authService.updatePassword(req.user!.userId, req.body.currentPassword, req.body.newPassword);
      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  }
${config.enableMFA ? `
  private async enableMFA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.authService.enableMFA(req.user!.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  private async verifyMFA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.authService.verifyMFA(req.user!.userId, req.body.code);
      res.json({ success: true, message: 'MFA verified successfully' });
    } catch (error) {
      next(error);
    }
  }

  private async disableMFA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.authService.disableMFA(req.user!.userId);
      res.json({ success: true, message: 'MFA disabled successfully' });
    } catch (error) {
      next(error);
    }
  }
` : ''}
}
`;
  }

  private generateAuthServiceFile(config: AuthServiceConfig): string {
    return `import { UserRepository } from '../repositories/user.repository';
import { TokenService } from './token.service';
import { SessionService } from './session.service';
import { hashPassword, verifyPassword } from '../utils/password';
import { AppError } from '../middleware/error-handler';
import { User, RegisterInput, LoginInput, AuthResponse } from '../types';
${config.enableMFA ? "import * as speakeasy from 'speakeasy';\nimport * as QRCode from 'qrcode';" : ''}

export class AuthService {
  private userRepository: UserRepository;
  private tokenService: TokenService;
  private sessionService: SessionService;

  constructor() {
    this.userRepository = new UserRepository();
    this.tokenService = new TokenService();
    this.sessionService = new SessionService();
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new AppError(400, 'User already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(input.password);

    // Create user
    const user = await this.userRepository.create({
      email: input.email,
      password: hashedPassword,
      name: input.name,
    });

    // Generate tokens
    const { accessToken, refreshToken } = this.tokenService.generateTokens({
      userId: user.id,
      email: user.email,
    });

    // Create session
    await this.sessionService.createSession(user.id, refreshToken);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    // Find user
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Verify password
    const isValid = await verifyPassword(input.password, user.password);
    if (!isValid) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = this.tokenService.generateTokens({
      userId: user.id,
      email: user.email,
    });

    // Create session
    await this.sessionService.createSession(user.id, refreshToken);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async logout(token: string): Promise<void> {
    await this.sessionService.deleteSessionByToken(token);
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Verify refresh token
    const payload = this.tokenService.verifyRefreshToken(refreshToken);

    // Check if session exists
    const session = await this.sessionService.getSessionByToken(refreshToken);
    if (!session) {
      throw new AppError(401, 'Invalid refresh token');
    }

    // Generate new tokens
    const tokens = this.tokenService.generateTokens({
      userId: payload.userId,
      email: payload.email,
    });

    // Update session
    await this.sessionService.updateSession(session.id, tokens.refreshToken);

    return tokens;
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return;
    }

    const resetToken = this.tokenService.generatePasswordResetToken(user.id);
    await this.userRepository.savePasswordResetToken(user.id, resetToken);

    // TODO: Send email with reset token
    console.log(\`Password reset token for \${email}: \${resetToken}\`);
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    const userId = this.tokenService.verifyPasswordResetToken(token);
    
    const user = await this.userRepository.findById(userId);
    if (!user || user.passwordResetToken !== token) {
      throw new AppError(400, 'Invalid or expired reset token');
    }

    const hashedPassword = await hashPassword(newPassword);
    await this.userRepository.updatePassword(userId, hashedPassword);
    await this.userRepository.clearPasswordResetToken(userId);
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const isValid = await verifyPassword(currentPassword, user.password);
    if (!isValid) {
      throw new AppError(401, 'Current password is incorrect');
    }

    const hashedPassword = await hashPassword(newPassword);
    await this.userRepository.updatePassword(userId, hashedPassword);
  }

  async getUserById(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    return this.sanitizeUser(user);
  }
${config.enableMFA ? `
  async enableMFA(userId: string): Promise<{ secret: string; qrCode: string }> {
    const secret = speakeasy.generateSecret({
      name: 'AzStudio Auth',
      length: 32,
    });

    await this.userRepository.saveMFASecret(userId, secret.base32);

    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode,
    };
  }

  async verifyMFA(userId: string, code: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.mfaSecret) {
      throw new AppError(400, 'MFA not enabled');
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: code,
    });

    if (!verified) {
      throw new AppError(401, 'Invalid MFA code');
    }

    await this.userRepository.enableMFA(userId);
  }

  async disableMFA(userId: string): Promise<void> {
    await this.userRepository.disableMFA(userId);
  }
` : ''}

  private sanitizeUser(user: User): Partial<User> {
    const { password, passwordResetToken, mfaSecret, ...sanitized } = user;
    return sanitized;
  }
}
`;
  }

  private generateTokenService(config: AuthServiceConfig): string {
    const sessionDuration = config.sessionDuration || 24;
    const resetExpiry = config.passwordResetExpiry || 1;
    
    return `import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/error-handler';

export interface TokenPayload {
  userId: string;
  email: string;
}

export class TokenService {
  private accessTokenSecret: string;
  private refreshTokenSecret: string;
  private resetTokenSecret: string;

  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'access-secret';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
    this.resetTokenSecret = process.env.JWT_RESET_SECRET || 'reset-secret';
  }

  generateTokens(payload: TokenPayload): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: '${sessionDuration}h',
    });

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.accessTokenSecret) as TokenPayload;
    } catch (error) {
      throw new AppError(401, 'Invalid or expired access token');
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.refreshTokenSecret) as TokenPayload;
    } catch (error) {
      throw new AppError(401, 'Invalid or expired refresh token');
    }
  }

  generatePasswordResetToken(userId: string): string {
    return jwt.sign({ userId }, this.resetTokenSecret, {
      expiresIn: '${resetExpiry}h',
    });
  }

  verifyPasswordResetToken(token: string): string {
    try {
      const payload = jwt.verify(token, this.resetTokenSecret) as { userId: string };
      return payload.userId;
    } catch (error) {
      throw new AppError(400, 'Invalid or expired reset token');
    }
  }
}
`;
  }

  private generateSessionService(config: AuthServiceConfig): string {
    return `import { PrismaClient } from '@prisma/client';
import { Session } from '../types';

const prisma = new PrismaClient();

export class SessionService {
  async createSession(userId: string, refreshToken: string): Promise<Session> {
    return prisma.session.create({
      data: {
        userId,
        refreshToken,
        expiresAt: new Date(Date.now() + ${(config.sessionDuration || 24) * 60 * 60 * 1000}),
      },
    });
  }

  async getSessionByToken(refreshToken: string): Promise<Session | null> {
    return prisma.session.findFirst({
      where: {
        refreshToken,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async updateSession(sessionId: string, newRefreshToken: string): Promise<Session> {
    return prisma.session.update({
      where: { id: sessionId },
      data: {
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + ${(config.sessionDuration || 24) * 60 * 60 * 1000}),
      },
    });
  }

  async deleteSessionByToken(refreshToken: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { refreshToken },
    });
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { userId },
    });
  }

  async cleanupExpiredSessions(): Promise<void> {
    await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
`;
  }

  private generateUserRepository(): string {
    return `import { PrismaClient } from '@prisma/client';
import { User, CreateUserInput } from '../types';

const prisma = new PrismaClient();

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: CreateUserInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async savePasswordResetToken(userId: string, token: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        passwordResetToken: token,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });
  }

  async clearPasswordResetToken(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
  }

  async saveMFASecret(userId: string, secret: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret },
    });
  }

  async enableMFA(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    });
  }

  async disableMFA(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
      },
    });
  }
}
`;
  }

  private generateAuthMiddleware(): string {
    return `import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service';
import { AppError } from './error-handler';
import { TokenPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

const tokenService = new TokenService();

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

    const payload = tokenService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const payload = tokenService.verifyAccessToken(token);
      req.user = payload;
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
`;
  }

  private generateTypes(config: AuthServiceConfig): string {
    return `export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
${config.enableMFA ? `  mfaEnabled: boolean;
  mfaSecret?: string | null;` : ''}
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface AuthResponse {
  user: Partial<User>;
  accessToken: string;
  refreshToken: string;
}

export interface Session {
  id: string;
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
}
`;
  }

  private generateValidationSchemas(): string {
    return `import { z } from 'zod';

export const AuthSchemas = {
  register: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      name: z.string().min(1, 'Name is required'),
    }),
  }),

  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(1, 'Password is required'),
    }),
  }),

  passwordResetRequest: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
    }),
  }),

  passwordResetConfirm: z.object({
    body: z.object({
      token: z.string().min(1, 'Token is required'),
      newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    }),
  }),

  updatePassword: z.object({
    body: z.object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    }),
  }),

  verifyMFA: z.object({
    body: z.object({
      code: z.string().length(6, 'MFA code must be 6 digits'),
    }),
  }),
};
`;
  }

  private generatePrismaSchema(config: AuthServiceConfig): string {
    return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  passwordResetToken   String?
  passwordResetExpires DateTime?
${config.enableMFA ? `  
  mfaEnabled Boolean  @default(false)
  mfaSecret  String?` : ''}
  
  sessions Session[]
  
  @@map("users")
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  refreshToken String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([refreshToken])
  @@map("sessions")
}
`;
  }

  private generatePasswordUtils(): string {
    return `import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
`;
  }

  private generatePackageJson(config: AuthServiceConfig): string {
    return JSON.stringify({
      name: 'auth-service',
      version: '1.0.0',
      description: 'JWT Authentication Service',
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
      dependencies: {
        express: '^4.18.2',
        cors: '^2.8.5',
        helmet: '^7.1.0',
        zod: '^3.22.4',
        '@prisma/client': '^5.7.1',
        jsonwebtoken: '^9.0.2',
        bcrypt: '^5.1.1',
        ...(config.enableMFA && {
          speakeasy: '^2.0.0',
          qrcode: '^1.5.3',
        }),
      },
      devDependencies: {
        '@types/express': '^4.17.21',
        '@types/cors': '^2.8.17',
        '@types/node': '^20.10.5',
        '@types/jsonwebtoken': '^9.0.5',
        '@types/bcrypt': '^5.0.2',
        typescript: '^5.3.3',
        'ts-node-dev': '^2.0.0',
        jest: '^29.7.0',
        '@types/jest': '^29.5.11',
        'ts-jest': '^29.1.1',
        prisma: '^5.7.1',
        ...(config.enableMFA && {
          '@types/speakeasy': '^2.0.10',
          '@types/qrcode': '^1.5.5',
        }),
      },
    }, null, 2);
  }

  private generateEnvExample(config: AuthServiceConfig): string {
    return `PORT=${config.port || 3001}
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

DATABASE_URL=postgresql://user:password@localhost:5432/auth_db

JWT_ACCESS_SECRET=${config.jwtSecret || 'your-access-secret-key'}
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_RESET_SECRET=your-reset-secret-key
`;
  }

  private generateReadme(config: AuthServiceConfig): string {
    return `# Auth Service

JWT-based authentication service with user registration, login, password reset, and session management.

## Features

- User registration and login
- JWT access and refresh tokens
- Password reset flow
- Session management
${config.enableMFA ? '- Multi-factor authentication (MFA)\n' : ''}- Secure password hashing with bcrypt

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

Copy \`.env.example\` to \`.env\` and configure:

- \`DATABASE_URL\`: PostgreSQL connection string
- \`JWT_ACCESS_SECRET\`: Secret for access tokens
- \`JWT_REFRESH_SECRET\`: Secret for refresh tokens
- \`JWT_RESET_SECRET\`: Secret for password reset tokens

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

### Authentication
- \`POST /api/auth/register\` - Register new user
- \`POST /api/auth/login\` - Login user
- \`POST /api/auth/logout\` - Logout user
- \`POST /api/auth/refresh\` - Refresh access token

### Password Management
- \`POST /api/auth/password-reset/request\` - Request password reset
- \`POST /api/auth/password-reset/confirm\` - Confirm password reset
- \`PUT /api/auth/password\` - Update password (authenticated)

### User
- \`GET /api/auth/me\` - Get current user (authenticated)
${config.enableMFA ? `
### MFA
- \`POST /api/auth/mfa/enable\` - Enable MFA (authenticated)
- \`POST /api/auth/mfa/verify\` - Verify MFA code (authenticated)
- \`POST /api/auth/mfa/disable\` - Disable MFA (authenticated)
` : ''}
## Testing

\`\`\`bash
npm test
\`\`\`
`;
  }
}
