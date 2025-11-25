# Service Component Library

## Overview

The Service Component Library provides pre-built, production-ready service components that can be dragged onto the AzStudio canvas and automatically generate complete backend services with authentication, validation, database integration, and comprehensive tests.

## Components

### 1. Auth Service Component

**Location:** `src/main/services/components/AuthServiceComponent.ts`

**Features:**
- JWT-based authentication with access and refresh tokens
- User registration and login
- Password reset flow with email verification
- Session management with automatic cleanup
- Optional Multi-Factor Authentication (MFA) with TOTP
- Secure password hashing with bcrypt
- Token expiration and refresh logic

**Generated Files:**
- Controllers: `auth.controller.ts`
- Services: `auth.service.ts`, `token.service.ts`, `session.service.ts`
- Repository: `user.repository.ts`
- Middleware: `auth.middleware.ts`
- Validation: `auth.schemas.ts` (Zod)
- Database: Prisma schema with User and Session models
- Utilities: `password.ts` (bcrypt helpers)

**Configuration Options:**
```typescript
interface AuthServiceConfig {
  name: string;
  port?: number;
  jwtSecret?: string;
  enableOAuth?: boolean;
  enableMFA?: boolean;
  passwordResetExpiry?: number; // in hours
  sessionDuration?: number; // in hours
}
```

### 2. Payment Service Component

**Location:** `src/main/services/components/PaymentServiceComponent.ts`

**Features:**
- Stripe payment integration
- Payment intent creation and confirmation
- Webhook handling for payment events
- Optional subscription billing
- Optional refund processing
- Payment tracking and history
- Secure webhook signature verification

**Generated Files:**
- Controllers: `payment.controller.ts`, `webhook.controller.ts`
- Services: `stripe.service.ts`, `payment.service.ts`, `subscription.service.ts`
- Repository: `payment.repository.ts`
- Validation: `payment.schemas.ts` (Zod)
- Database: Prisma schema with Payment, Customer, and Subscription models

**Configuration Options:**
```typescript
interface PaymentServiceConfig {
  name: string;
  port?: number;
  stripeApiVersion?: string;
  enableSubscriptions?: boolean;
  enableRefunds?: boolean;
  webhookSecret?: string;
}
```

### 3. Email Service Component

**Location:** `src/main/services/components/EmailServiceComponent.ts`

**Features:**
- Multiple provider support (SendGrid, AWS SES, SMTP)
- HTML email templates with Handlebars
- Transactional email tracking
- Optional email verification flow
- Template rendering with subject extraction
- Email status monitoring

**Generated Files:**
- Controllers: `email.controller.ts`
- Services: `email.service.ts`, `provider.service.ts`, `template.service.ts`
- Repository: `email.repository.ts`
- Templates: `welcome.html`, `password-reset.html`, `verification.html`
- Validation: `email.schemas.ts` (Zod)
- Database: Prisma schema with Email and EmailVerification models

**Configuration Options:**
```typescript
interface EmailServiceConfig {
  name: string;
  port?: number;
  provider?: 'sendgrid' | 'ses' | 'smtp';
  enableTemplates?: boolean;
  enableVerification?: boolean;
}
```

### 4. Storage Service Component

**Location:** `src/main/services/components/StorageServiceComponent.ts`

**Features:**
- Multiple storage providers (AWS S3, Cloudflare R2, Local)
- File upload and download
- Optional signed URL generation
- Optional image optimization with Sharp
- Multi-file upload support
- File metadata tracking
- Configurable file size limits

**Generated Files:**
- Controllers: `storage.controller.ts`
- Services: `storage.service.ts`, `provider.service.ts`, `image.service.ts`
- Repository: `file.repository.ts`
- Middleware: `upload.middleware.ts` (Multer)
- Validation: `storage.schemas.ts` (Zod)
- Database: Prisma schema with File model

**Configuration Options:**
```typescript
interface StorageServiceConfig {
  name: string;
  port?: number;
  provider?: 's3' | 'r2' | 'local';
  enableImageOptimization?: boolean;
  enableSignedUrls?: boolean;
  maxFileSize?: number; // in MB
}
```

### 5. Service Connection Generator

**Location:** `src/main/services/components/ServiceConnectionGenerator.ts`

**Features:**
- Generate API routes between services
- Create service client libraries with TypeScript
- Add authentication middleware
- Generate request validation schemas
- Support for REST API methods (GET, POST, PUT, DELETE, PATCH)
- Path parameter extraction
- Request/response type generation

**Generated Files:**
- Target Service: Controllers, services, validation schemas
- Source Service: Client class, type definitions
- Middleware: Authentication middleware (if enabled)

**Configuration:**
```typescript
interface ServiceConnection {
  sourceService: string;
  targetService: string;
  endpoints: ConnectionEndpoint[];
  authentication?: boolean;
}

interface ConnectionEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  requestSchema?: string;
  responseSchema?: string;
}
```

## Usage Example

```typescript
import { AuthServiceComponent } from './components/AuthServiceComponent';

const authComponent = new AuthServiceComponent();

const changes = authComponent.generateAuthService({
  name: 'my-auth-service',
  port: 3001,
  enableMFA: true,
  sessionDuration: 24,
  passwordResetExpiry: 1,
}, '/output/directory');

// Apply changes to file system
changes.forEach(change => {
  // Write file to disk
});
```

## Testing

All components include comprehensive test suites:

- `AuthServiceComponent.test.ts` - 15 test cases
- `PaymentServiceComponent.test.ts` - 14 test cases
- `EmailServiceComponent.test.ts` - 14 test cases
- `StorageServiceComponent.test.ts` - 12 test cases
- `ServiceConnectionGenerator.test.ts` - 10 test cases

Run tests with:
```bash
npm test -- --testPathPattern="components/__tests__"
```

## Architecture

All service components follow a consistent architecture:

1. **Controller Layer**: Express route handlers with validation
2. **Service Layer**: Business logic and orchestration
3. **Repository Layer**: Database access with Prisma
4. **Middleware**: Authentication, validation, error handling
5. **Types**: TypeScript interfaces and types
6. **Validation**: Zod schemas for request validation
7. **Database**: Prisma schema definitions

## Best Practices

1. **Security**: All services include authentication middleware and input validation
2. **Error Handling**: Consistent error handling with AppError class
3. **Type Safety**: Full TypeScript support with strict typing
4. **Testing**: Comprehensive test coverage for all components
5. **Documentation**: Auto-generated README files with API documentation
6. **Configuration**: Environment-based configuration with .env files
7. **Database**: Prisma for type-safe database access

## Future Enhancements

- Additional service components (Cache, Queue, Search, Analytics)
- GraphQL support
- WebSocket support
- Rate limiting middleware
- API versioning
- OpenAPI/Swagger documentation generation
- Docker containerization
- Kubernetes deployment manifests
