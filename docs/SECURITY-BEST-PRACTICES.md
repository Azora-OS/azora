# 🔐 Azora OS - Security Best Practices

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Authentication & Authorization](#authentication--authorization)
3. [Input Validation](#input-validation)
4. [Data Protection](#data-protection)
5. [API Security](#api-security)
6. [Infrastructure Security](#infrastructure-security)
7. [Incident Response](#incident-response)

---

## Environment Variables

### ✅ DO

```typescript
// Use environment variables for all secrets
const apiKey = process.env.OPENAI_API_KEY;
const dbPassword = process.env.DATABASE_PASSWORD;

// Validate environment variables on startup
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

// Use .env.example as template
// Copy to .env and fill in values
// Add .env to .gitignore
```

### ❌ DON'T

```typescript
// Never hardcode secrets
const apiKey = 'sk-1234567890abcdef';
const dbPassword = 'admin123';

// Never commit .env to version control
// Never log sensitive information
console.log('API Key:', apiKey);
```

### Setup

```bash
# 1. Copy template
cp .env.example .env

# 2. Fill in your values
# Edit .env with your actual credentials

# 3. Verify .env is in .gitignore
echo ".env" >> .gitignore

# 4. Never commit .env
git add .gitignore
git commit -m "Add .env to gitignore"
```

---

## Authentication & Authorization

### JWT Implementation

```typescript
import jwt from 'jsonwebtoken';

// Generate token
export function generateToken(userId: string): string {
  return jwt.sign(
    { userId, iat: Date.now() },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );
}

// Verify token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Middleware
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

### Password Security

```typescript
import bcrypt from 'bcrypt';

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
  return bcrypt.hash(password, rounds);
}

// Verify password
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Validate password strength
export function validatePasswordStrength(password: string): boolean {
  const minLength = parseInt(process.env.PASSWORD_MIN_LENGTH || '12');
  const requireUppercase = process.env.PASSWORD_REQUIRE_UPPERCASE === 'true';
  const requireNumbers = process.env.PASSWORD_REQUIRE_NUMBERS === 'true';
  const requireSpecialChars = process.env.PASSWORD_REQUIRE_SPECIAL_CHARS === 'true';

  if (password.length < minLength) return false;
  if (requireUppercase && !/[A-Z]/.test(password)) return false;
  if (requireNumbers && !/[0-9]/.test(password)) return false;
  if (requireSpecialChars && !/[!@#$%^&*]/.test(password)) return false;

  return true;
}
```

### Never Trust Client Data

```typescript
// ❌ WRONG - Trusting client-provided user ID
app.get('/api/user/:id', (req, res) => {
  const userId = req.params.id; // Could be anyone!
  // ...
});

// ✅ CORRECT - Using authenticated user from token
app.get('/api/user/profile', authMiddleware, (req, res) => {
  const userId = req.user.userId; // From verified token
  // ...
});
```

---

## Input Validation

### Schema Validation with Zod

```typescript
import { z } from 'zod';

// Define schema
const searchSchema = z.object({
  query: z.string().min(1).max(500),
  country: z.string().optional(),
  language: z.string().optional(),
  type: z.enum(['semantic', 'keyword', 'hybrid']).optional(),
});

// Validate input
export function validateSearch(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = searchSchema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
}

// Use middleware
app.post('/api/sapiens/search', validateSearch, searchHandler);
```

### Sanitization

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize HTML
export function sanitizeHTML(input: string): string {
  return DOMPurify.sanitize(input);
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/['"]/g, ''); // Remove quotes
}
```

---

## Data Protection

### Encryption

```typescript
import crypto from 'crypto';

// Encrypt sensitive data
export function encryptData(data: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(key, 'hex'),
    iv
  );

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
}

// Decrypt sensitive data
export function decryptData(encrypted: string, key: string): string {
  const parts = encrypted.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(key, 'hex'),
    iv
  );

  let decrypted = decipher.update(parts[1], 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

### HTTPS Only

```typescript
// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### Data Retention

```typescript
// Implement data retention policies
export async function deleteOldData() {
  const retentionDays = parseInt(process.env.DATA_RETENTION_DAYS || '365');
  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  // Delete old records
  await db.collection('logs').deleteMany({
    createdAt: { $lt: cutoffDate },
  });
}

// Run daily
schedule.scheduleJob('0 0 * * *', deleteOldData);
```

---

## API Security

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

// General limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});

// Auth limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
```

### CORS Configuration

```typescript
import cors from 'cors';

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};

app.use(cors(corsOptions));
```

### Error Handling

```typescript
// Don't expose internal errors
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log full error internally
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
  });

  // Return generic error to client
  res.status(500).json({
    error: 'Internal server error',
    requestId: req.id,
  });
}
```

---

## Infrastructure Security

### Environment-Specific Configuration

```typescript
// Development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  // Enable detailed logging
}

// Production
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
  // Disable detailed logging
}
```

### Secrets Management

```typescript
// Use environment variables
const secrets = {
  jwtSecret: process.env.JWT_SECRET,
  dbPassword: process.env.DATABASE_PASSWORD,
  apiKey: process.env.OPENAI_API_KEY,
};

// Validate on startup
Object.entries(secrets).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required secret: ${key}`);
  }
});
```

---

## Incident Response

### Security Incident Checklist

1. **Detect**: Monitor for suspicious activity
2. **Contain**: Isolate affected systems
3. **Investigate**: Determine scope and impact
4. **Remediate**: Fix the vulnerability
5. **Recover**: Restore normal operations
6. **Review**: Post-incident analysis

### Logging Security Events

```typescript
export function logSecurityEvent(
  event: string,
  details: Record<string, any>
) {
  logger.warn('Security Event:', {
    event,
    timestamp: new Date(),
    ...details,
  });

  // Also send to security monitoring system
  sendToSecurityMonitoring({
    event,
    details,
    timestamp: new Date(),
  });
}

// Usage
logSecurityEvent('failed_login_attempt', {
  userId: user.id,
  ip: req.ip,
  attempts: failedAttempts,
});
```

---

## Security Checklist

- [ ] All secrets in environment variables
- [ ] `.env` in `.gitignore`
- [ ] Input validation on all endpoints
- [ ] Output sanitization
- [ ] HTTPS enforced in production
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers enabled
- [ ] Error handling doesn't expose internals
- [ ] Audit logging enabled
- [ ] Regular security updates
- [ ] Penetration testing scheduled
- [ ] Incident response plan documented
- [ ] Security training completed

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [CWE Top 25](https://cwe.mitre.org/top25/)

---

**Last Updated**: November 16, 2025  
**Status**: ACTIVE  
**Review Frequency**: Quarterly
