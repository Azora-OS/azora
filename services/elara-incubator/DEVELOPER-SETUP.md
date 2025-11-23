# Developer Setup Guide

## Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL 14+
- Git

## Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd elara-incubator
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create `.env` file in the root directory:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/elara_incubator

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=24h

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Elara AI
ELARA_AI_API_KEY=your-api-key
ELARA_AI_BASE_URL=https://api.elara.ai

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### 4. Database Setup

```bash
# Create database
createdb elara_incubator

# Run migrations
npm run migrate

# Seed data (optional)
npm run seed
```

### 5. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

## Project Structure

```
services/elara-incubator/
├── src/
│   ├── services/          # Business logic
│   ├── routes/            # API endpoints
│   ├── middleware/        # Express middleware
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   ├── integration/       # Service orchestration
│   └── __tests__/         # Test files
├── migrations/            # Database migrations
├── .env.example           # Environment template
├── package.json
└── tsconfig.json
```

## Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Building
npm run build            # Build TypeScript
npm run start            # Start production server

# Testing
npm run test             # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:e2e        # Run E2E tests

# Database
npm run migrate          # Run migrations
npm run migrate:create   # Create new migration
npm run seed             # Seed database

# Linting
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run typecheck        # Run TypeScript type check

# Documentation
npm run docs             # Generate API docs
```

## API Testing

### Using cURL

```bash
# Create business
curl -X POST http://localhost:3000/api/businesses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Business",
    "businessType": "e-commerce",
    "templateId": "template-1"
  }'

# Get business
curl -X GET http://localhost:3000/api/businesses/business-123 \
  -H "Authorization: Bearer <token>"
```

### Using Postman

1. Import the Postman collection from `docs/postman-collection.json`
2. Set environment variables:
   - `base_url`: http://localhost:3000/api
   - `token`: Your JWT token
3. Run requests from the collection

### Using REST Client (VS Code)

Create `test.http` file:

```http
@baseUrl = http://localhost:3000/api
@token = your-jwt-token

### Create Business
POST {{baseUrl}}/businesses
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "businessName": "Test Business",
  "businessType": "e-commerce",
  "templateId": "template-1"
}

### Get Business
GET {{baseUrl}}/businesses/business-123
Authorization: Bearer {{token}}
```

## Running Tests

### Unit Tests
```bash
npm run test -- src/__tests__/services
```

### Integration Tests
```bash
npm run test -- src/__tests__/integration
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test -- --coverage
```

## Debugging

### VS Code Debugging

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceFolder}/dist/index.js",
      "preLaunchTask": "npm: build",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

### Console Logging

```typescript
import { logger } from '../utils/logger';

logger.info('Message', { data });
logger.error('Error', error);
logger.debug('Debug info', { details });
```

## Database Management

### Create Migration

```bash
npm run migrate:create -- create_users_table
```

Edit the generated migration file in `migrations/`

### Run Migrations

```bash
npm run migrate
```

### Rollback Migrations

```bash
npm run migrate:rollback
```

### View Database

```bash
# Connect to PostgreSQL
psql elara_incubator

# List tables
\dt

# View table structure
\d businesses

# Exit
\q
```

## Performance Profiling

### Memory Profiling

```bash
node --inspect dist/index.js
```

Open `chrome://inspect` in Chrome DevTools

### CPU Profiling

```bash
node --prof dist/index.js
node --prof-process isolate-*.log > profile.txt
```

## Common Issues

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U postgres -d postgres

# Verify DATABASE_URL in .env
```

### Module Not Found
```bash
# Rebuild node_modules
rm -rf node_modules package-lock.json
npm install
```

## Code Style

### ESLint Configuration

```bash
npm run lint
npm run lint:fix
```

### Prettier Formatting

```bash
npm run format
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/my-feature

# Create pull request
# (on GitHub/GitLab)
```

## Deployment

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Environment Variables for Production

Update `.env` with production values:
- `NODE_ENV=production`
- `DATABASE_URL=<production-db-url>`
- `STRIPE_SECRET_KEY=<production-key>`
- `JWT_SECRET=<strong-secret>`

## Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

### Logs

```bash
# View logs
tail -f logs/app.log

# Filter logs
grep "ERROR" logs/app.log
```

## Support

For issues or questions:
1. Check the [API Documentation](./API-DOCUMENTATION.md)
2. Review [Performance Optimization Guide](./PERFORMANCE-OPTIMIZATION.md)
3. Check existing GitHub issues
4. Create a new issue with details

---

**Last Updated**: 2024-11-19
**Version**: 1.0
