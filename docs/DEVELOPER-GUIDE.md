cbn76# 🚀 Azora OS Developer Guide

**The Complete Guide to Building the World's First Constitutional AI Operating System**

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [System Architecture](#-system-architecture)
3. [Development Environment](#-development-environment)
4. [Frontend Development](#-frontend-development)
5. [Backend Development](#-backend-development)
6. [API Documentation](#-api-documentation)
7. [Database Management](#-database-management)
8. [Testing](#-testing)
9. [Deployment](#-deployment)
10. [Troubleshooting](#-troubleshooting)

---

## ⚡ Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose
- Git

### 5-Minute Setup
```powershell
# 1. Clone and setup
git clone https://github.com/azora-os/azora-os.git
cd azora-os
npm install

# 2. Environment setup
copy .env.example .env
# Edit .env with your database credentials

# 3. Database setup
npm run db:setup
npm run db:migrate

# 4. Start development
npm run dev

# 5. Access applications
# API Gateway: http://localhost:4000
# Student Portal: http://localhost:3000
# Enterprise UI: http://localhost:3001
```

---

## 🏗️ System Architecture

### Supreme Organism Pattern
```
🧠 BRAIN (Education)     🫀 HEART (Finance)     💪 MUSCLES (Marketplace)
├── Azora Education      ├── Azora Mint         ├── Azora Forge
├── Learning Management  ├── Payment Gateway    ├── Career Services
└── Azora Sapiens       └── Mining Engine      └── Workspace

🔗 NERVOUS SYSTEM        🛡️ IMMUNE SYSTEM
├── Azora Nexus         ├── Azora Aegis
├── Event Bus           ├── Auth Service
└── API Gateway         └── Security Framework
```

### Service Communication
- **API Gateway**: Central routing hub (Port 4000)
- **Event Bus**: Async communication via Redis
- **Database**: PostgreSQL with service-specific schemas
- **Authentication**: JWT-based with refresh tokens

---

## 💻 Development Environment

### Project Structure
```
azora/
├── apps/                    # Frontend Applications
│   ├── student-portal/      # Student dashboard (Next.js)
│   ├── enterprise-ui/       # Business management (React)
│   ├── marketplace-ui/      # Service marketplace (React)
│   ├── pay-ui/             # Financial dashboard (React)
│   └── mobile/             # React Native app
├── services/               # Backend Microservices
│   ├── api-gateway/        # Central API router
│   ├── auth-service/       # Authentication
│   ├── azora-mint/         # Financial engine
│   ├── azora-lms/          # Learning management
│   └── azora-forge/        # Skills marketplace
├── packages/               # Shared Libraries
│   ├── ui/                 # UI components
│   ├── types/              # TypeScript definitions
│   └── lib/                # Utility functions
└── infrastructure/         # DevOps & Infrastructure
```

### Development Commands
```bash
# Start all services
npm run dev

# Start specific service
npm run dev:api-gateway
npm run dev:auth-service
npm run dev:student-portal

# Build for production
npm run build

# Run tests
npm test
npm run test:e2e

# Database operations
npm run db:migrate
npm run db:seed
npm run db:reset
```

---

## 🎨 Frontend Development

### Technology Stack
- **Framework**: React 18.3 + Next.js 16.0
- **Styling**: Tailwind CSS 3.3
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **UI Components**: Custom design system

### UI Component Library
```typescript
// Import from shared UI package
import { Button, Card, Input, Modal } from '@azora/ui'

// Example usage
<Card className="p-6">
  <Input 
    label="Email" 
    type="email" 
    validation={{ required: true }}
  />
  <Button variant="primary" size="lg">
    Submit
  </Button>
</Card>
```

### Application Structure
```
apps/student-portal/
├── app/                    # Next.js 13+ app directory
│   ├── dashboard/          # Dashboard pages
│   ├── courses/           # Course management
│   ├── wallet/            # Financial features
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities
└── styles/               # Global styles
```

### Key Features to Implement
1. **Authentication Flow**
   - Login/Register forms
   - OAuth integration (Google, GitHub, Apple)
   - JWT token management

2. **Dashboard Components**
   - Real-time data visualization
   - Responsive design
   - Dark/light mode support

3. **Financial UI**
   - Wallet balance display
   - Transaction history
   - Mining rewards tracking

---

## ⚙️ Backend Development

### Technology Stack
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js 5.1
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Cache**: Redis 7+
- **Message Queue**: Redis Bull

### Service Architecture
```typescript
// Standard service structure
services/example-service/
├── src/
│   ├── controllers/       # Request handlers
│   ├── services/         # Business logic
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── utils/            # Utilities
├── tests/                # Unit tests
├── Dockerfile           # Container config
└── package.json         # Dependencies
```

### API Development Pattern
```typescript
// Controller example
export class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const userData = userSchema.parse(req.body)
      const user = await userService.create(userData)
      res.status(201).json({ success: true, data: user })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  }
}

// Service example
export class UserService {
  async create(userData: CreateUserDto): Promise<User> {
    // Validate business rules
    await this.validateUserData(userData)
    
    // Create user
    const user = await prisma.user.create({
      data: userData
    })
    
    // Emit event
    eventBus.emit('user.created', user)
    
    return user
  }
}
```

### Database Schema Design
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES users(id),
  price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📡 API Documentation

### Authentication
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": { ... }
  }
}
```

### Core Endpoints

#### User Management
- `POST /api/users` - Create user
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update profile
- `DELETE /api/users/me` - Delete account

#### Education System
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course
- `GET /api/courses/:id` - Get course details
- `POST /api/enrollments` - Enroll in course

#### Financial System
- `GET /api/wallet` - Get wallet balance
- `POST /api/transactions` - Create transaction
- `GET /api/mining/status` - Mining status
- `POST /api/mining/start` - Start mining

### Error Handling
```typescript
// Standard error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

---

## 🗄️ Database Management

### Prisma Setup
```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  courses   Course[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Migration Commands
```bash
# Create migration
npx prisma migrate dev --name add_user_table

# Apply migrations
npx prisma migrate deploy

# Generate client
npx prisma generate

# Reset database
npx prisma migrate reset
```

### Seeding Data
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create demo users
  await prisma.user.createMany({
    data: [
      { email: 'student@azora.com', name: 'Demo Student' },
      { email: 'teacher@azora.com', name: 'Demo Teacher' }
    ]
  })
}

main()
```

---

## 🧪 Testing

### Testing Stack
- **Unit Tests**: Jest + Testing Library
- **Integration Tests**: Supertest
- **E2E Tests**: Playwright
- **Load Tests**: K6

### Test Structure
```typescript
// Unit test example
describe('UserService', () => {
  it('should create user successfully', async () => {
    const userData = { email: 'test@example.com', name: 'Test User' }
    const user = await userService.create(userData)
    
    expect(user.email).toBe(userData.email)
    expect(user.id).toBeDefined()
  })
})

// Integration test example
describe('POST /api/users', () => {
  it('should create user and return 201', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Test User' })
      .expect(201)
    
    expect(response.body.success).toBe(true)
  })
})
```

### Running Tests
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## 🚀 Deployment

### Local Development
```bash
# Start with Docker Compose
docker-compose up -d

# Or start services individually
npm run dev:api-gateway
npm run dev:auth-service
npm run dev:student-portal
```

### Production Deployment
```bash
# Build all services
npm run build

# Deploy to production
./deploy-production.sh

# Or use Docker
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Configuration
```bash
# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@localhost:5432/azora_prod
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_here
API_BASE_URL=https://api.azora.com
```

### Health Monitoring
```bash
# Check system health
curl http://localhost:9090/health

# View metrics
curl http://localhost:9090/metrics
```

---

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check PostgreSQL status
pg_isready -h localhost -p 5432

# Reset database
npm run db:reset
npm run db:migrate
npm run db:seed
```

#### Service Communication Issues
```bash
# Check Redis connection
redis-cli ping

# Restart API Gateway
npm run restart:api-gateway

# Check service logs
docker-compose logs api-gateway
```

#### Build Issues
```bash
# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run build
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=azora:* npm run dev

# Check specific service
DEBUG=azora:auth-service npm run dev:auth-service
```

### Performance Issues
```bash
# Check memory usage
node --inspect server.js

# Profile application
npm run profile

# Load test
npm run test:load
```

---

## 📚 Additional Resources

### Documentation Links
- [API Reference](./api/README.md)
- [Architecture Guide](./architecture/README.md)
- [Deployment Guide](./deployment/README.md)
- [Security Guidelines](./security/README.md)

### Development Tools
- [Azora IDE Extension](../tools/elara-vscode-extension/)
- [Code Generators](../tools/codex/)
- [Testing Utilities](../tools/dev/)

### Community
- [Discord Server](https://discord.gg/azora)
- [GitHub Discussions](https://github.com/azora-os/azora-os/discussions)
- [Developer Forum](https://forum.azora.com)

---

**Ready to build the future? Let's code! 🚀**