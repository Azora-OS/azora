# 🔐 Handoff to Q-Security

**From:** Q-Backend & Q-Infrastructure  
**To:** Q-Security  
**Date:** 2025  
**Priority:** 🔴 CRITICAL (Blocks Production)

---

## 🎯 Your Mission

Implement security hardening across all 10 Azora services to make them production-ready.

**Estimated Duration:** 4-6 hours  
**Phase:** 1 Day 4  
**Blockers:** None - ready to start immediately

---

## ✅ What's Ready for You

### 1. TypeScript Infrastructure ✅
- All 10 services have standardized tsconfig.json
- All @types packages installed
- Strict mode enabled
- Zero TypeScript errors

### 2. Package Standardization ✅
- All services have README.md
- All services have .env.example
- Standardized npm scripts
- Consistent project structure

### 3. GitHub Workflows ✅
- Security scanning workflow ready
- CI/CD pipeline configured
- Automated testing in place

---

## 📋 Your Tasks

### 1. CORS Configuration (All 10 Services)

**Services to update:**
- azora-mint
- api-gateway
- auth-service
- azora-education
- azora-forge
- azora-sapiens
- ai-family-service
- azora-assessment
- azora-pay
- health-monitor

**Implementation:**
```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Add to .env.example:**
```bash
CORS_ORIGIN=http://localhost:3000
```

---

### 2. Rate Limiting (All 10 Services)

**Install dependency:**
```bash
npm install express-rate-limit --save
```

**Implementation:**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

**Service-specific limits:**
- auth-service: 20 requests/15min (stricter)
- api-gateway: 200 requests/15min (higher)
- Other services: 100 requests/15min (default)

---

### 3. Helmet.js Security Headers (All 10 Services)

**Already installed** in most services, just need to enable:

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

### 4. CSRF Protection (Services with Forms)

**Services needing CSRF:**
- auth-service
- azora-education
- azora-forge
- azora-pay

**Install:**
```bash
npm install csurf cookie-parser --save
```

**Implementation:**
```typescript
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

app.use(cookieParser());
app.use(csrf({ cookie: true }));

// Add CSRF token to responses
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});
```

---

### 5. Input Validation Middleware

**Create:** `services/shared/middleware/validation.ts`

```typescript
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }
  };
};
```

**Example usage:**
```typescript
import { z } from 'zod';
import { validate } from '../middleware/validation';

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

app.post('/api/auth/login', validate(loginSchema), loginHandler);
```

---

### 6. Error Handling Standardization

**Create:** `services/shared/middleware/errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

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
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(500).json({
    status: 'error',
    message,
  });
};
```

**Usage in each service:**
```typescript
import { errorHandler } from './middleware/errorHandler';

// Add at the end of middleware chain
app.use(errorHandler);
```

---

### 7. Security Documentation

**Create 3 files:**

#### `docs/SECURITY-POLICY.md`
- Security best practices
- Vulnerability reporting
- Security update process
- Contact information

#### `docs/SECURITY-HEADERS.md`
- Helmet.js configuration
- CSP policies
- HSTS settings
- Security header explanations

#### `docs/SECURITY-CHECKLIST.md`
- Pre-deployment security checklist
- Security testing procedures
- Compliance requirements
- Audit procedures

---

## 🛠️ Tools & Resources

### Available to You:
- ✅ All services have TypeScript configured
- ✅ All services have .env.example
- ✅ All services have standardized structure
- ✅ Validation scripts available
- ✅ GitHub workflows for security scanning

### Dependencies Already Installed:
- helmet (most services)
- cors (most services)
- zod (root package)

### Need to Install:
- express-rate-limit (all services)
- csurf (4 services)
- cookie-parser (4 services)

---

## ✅ Success Criteria

Your work is complete when:

- [ ] CORS configured in all 10 services
- [ ] Rate limiting active on all endpoints
- [ ] Helmet.js headers enabled in all services
- [ ] CSRF protection in 4 services with forms
- [ ] Input validation middleware created and documented
- [ ] Error handling standardized across all services
- [ ] 3 security documentation files created
- [ ] All services pass security validation
- [ ] No security warnings in GitHub workflows

---

## 🧪 Testing Your Work

### 1. Test CORS:
```bash
curl -H "Origin: http://evil.com" http://localhost:4001/api/health
# Should be blocked
```

### 2. Test Rate Limiting:
```bash
# Make 101 requests quickly
for i in {1..101}; do curl http://localhost:4001/api/health; done
# Last request should be rate limited
```

### 3. Test Helmet Headers:
```bash
curl -I http://localhost:4001/api/health
# Should see security headers
```

### 4. Test Input Validation:
```bash
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid", "password": "123"}'
# Should return validation error
```

---

## 📊 Validation

**Run after completion:**
```bash
# Create validation script
node scripts/validate-security.js

# Check for security issues
npm audit

# Run security workflow
git push origin feature/security-hardening
```

---

## 🤝 Coordination

### Need Help From:
- **Q-Backend:** TypeScript/Node.js questions
- **Q-Infrastructure:** CI/CD integration questions
- **Q-Documentation:** Documentation review

### You'll Help:
- **Q-Testing:** Security test cases
- **Q-Documentation:** Security documentation review

---

## 📁 File Structure

```
services/
├── shared/
│   └── middleware/
│       ├── validation.ts (CREATE)
│       ├── errorHandler.ts (CREATE)
│       └── security.ts (CREATE)
├── azora-mint/
│   └── index.js (UPDATE - add security)
├── api-gateway/
│   └── index.js (UPDATE - add security)
└── ... (8 more services)

docs/
├── SECURITY-POLICY.md (CREATE)
├── SECURITY-HEADERS.md (CREATE)
└── SECURITY-CHECKLIST.md (CREATE)

scripts/
└── validate-security.js (CREATE)
```

---

## 💡 Pro Tips

1. **Start with shared middleware** - Create reusable security middleware first
2. **Test incrementally** - Test each service after adding security
3. **Use environment variables** - Make security settings configurable
4. **Document everything** - Clear docs help the team understand security
5. **Check existing code** - Some services may already have partial security

---

## 🚀 Ready to Start?

**You have everything you need:**
- ✅ Clear requirements
- ✅ Code examples
- ✅ Testing procedures
- ✅ Success criteria
- ✅ Validation tools

**Estimated timeline:**
- Shared middleware: 1 hour
- Service updates: 2-3 hours
- Documentation: 1 hour
- Testing & validation: 1 hour

**Total: 4-6 hours**

---

**Good luck, Q-Security! 🔐**  
**The team is counting on you to secure Azora OS!**

**Questions?** Check `.kiro/TEAM-STATUS-UPDATE.md` or ask in `#azora-security`
