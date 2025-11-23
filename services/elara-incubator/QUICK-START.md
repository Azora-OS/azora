# Elara Incubator Platform - Quick Start Guide

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL 13+ (for production)

### Installation

```bash
# Navigate to service directory
cd services/elara-incubator

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

```env
PORT=3002
NODE_ENV=development
JWT_SECRET=your-secret-key
STRIPE_API_KEY=your-stripe-key
DATABASE_URL=postgresql://user:password@localhost:5432/elara
```

---

## Project Structure

```
src/
├── services/          # Business logic
├── routes/           # API endpoints
├── middleware/       # Auth, error handling
├── types/           # TypeScript interfaces
├── utils/           # Helpers, validators
└── index.ts         # Entry point
```

---

## Available Services

### Business Service
```typescript
import { businessService } from './services/business.service';

// Create business
const business = await businessService.createBusiness(userId, {
  businessName: 'My Business',
  businessType: 'e-commerce'
});

// Get wizard progress
const progress = await businessService.getWizardProgress(businessId, userId);

// Update wizard step
await businessService.updateWizardStep(businessId, stepId, userId, stepData);
```

### Revenue Service
```typescript
import { revenueService } from './services/revenue.service';

// Record transaction
const transaction = await revenueService.recordTransaction(businessId, {
  amount: 1000,
  source: 'sales',
  currency: 'USD'
});

// Get breakdown
const breakdown = await revenueService.getBreakdown(businessId, startDate, endDate);
```

### Payment Service
```typescript
import { paymentService } from './services/payment.service';

// Create payment
const payment = await paymentService.createPayment(businessId, userId, {
  amount: 500,
  type: 'revenue'
});

// Confirm payment
await paymentService.confirmPayment(paymentId, userId);
```

### Legal Service
```typescript
import { legalService } from './services/legal.service';

// Get templates
const templates = await legalService.getTemplates();

// Generate document
const document = await legalService.generateDocument(businessId, {
  templateId: templateId,
  data: { businessName: 'My Business' }
}, userId);

// Sign document
await legalService.signDocument(documentId, userId, {
  signatureHash: hash
}, ipAddress, userAgent);
```

### Fund Service
```typescript
import { fundService } from './services/fund.service';

// Get fund status
const fund = await fundService.getFundStatus();

// Add contribution
await fundService.addContribution(amount, 'business_revenue');

// Create distribution
const distribution = await fundService.createDistribution({
  amount: 1000,
  type: 'scholarship',
  description: 'Scholarship for student'
});
```

### Notification Service
```typescript
import { notificationService } from './services/notification.service';

// Create notification
await notificationService.createNotification(userId, {
  type: 'payment',
  title: 'Payment Received',
  message: 'Your payment has been processed'
});

// Get notifications
const notifications = await notificationService.getUserNotifications(userId);
```

### Audit Service
```typescript
import { auditService } from './services/audit.service';

// Log action
await auditService.logAction('payment_created', 'Payment created', userId, ipAddress);

// Get audit trail
const trail = await auditService.getUserAuditTrail(userId);

// Generate compliance report
const report = await auditService.generateComplianceReport(startDate, endDate);
```

---

## API Endpoints

### Business Endpoints
```
POST   /api/v1/businesses
GET    /api/v1/businesses
GET    /api/v1/businesses/:businessId
PUT    /api/v1/businesses/:businessId
GET    /api/v1/businesses/:businessId/wizard
PUT    /api/v1/businesses/:businessId/wizard/:stepId
POST   /api/v1/businesses/:businessId/launch
GET    /api/v1/businesses/templates/list
```

### Payment Endpoints
```
POST   /api/v1/payments/revenue
GET    /api/v1/payments/revenue/:businessId
GET    /api/v1/payments/revenue/:businessId/breakdown
POST   /api/v1/payments
GET    /api/v1/payments/:paymentId
GET    /api/v1/payments/history/:businessId
PUT    /api/v1/payments/:paymentId/status
POST   /api/v1/payments/:paymentId/retry
```

### Legal Endpoints
```
GET    /api/v1/legal/templates
GET    /api/v1/legal/templates/:templateId
POST   /api/v1/legal/documents/generate
GET    /api/v1/legal/documents/:documentId
GET    /api/v1/legal/documents/business/:businessId
POST   /api/v1/legal/documents/:documentId/sign
GET    /api/v1/legal/documents/:documentId/audit
GET    /api/v1/legal/documents/:documentId/download
```

### Fund Endpoints
```
GET    /api/v1/fund/status
GET    /api/v1/fund/balance
GET    /api/v1/fund/contributions
GET    /api/v1/fund/distributions
POST   /api/v1/fund/distributions
GET    /api/v1/fund/distributions/:distributionId
PUT    /api/v1/fund/distributions/:distributionId/status
GET    /api/v1/fund/impact/metrics
GET    /api/v1/fund/analytics/summary
GET    /api/v1/fund/audit/trail
```

---

## Authentication

All endpoints (except public ones) require JWT token in Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3002/api/v1/businesses
```

### Roles
- `admin` - Full access
- `manager` - Business management
- `incubatee` - Own business access
- `viewer` - Read-only access

---

## Common Tasks

### Create a Business
```bash
curl -X POST http://localhost:3002/api/v1/businesses \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "My Startup",
    "businessType": "e-commerce"
  }'
```

### Record Revenue
```bash
curl -X POST http://localhost:3002/api/v1/payments/revenue \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "business-id",
    "amount": 1000,
    "source": "sales"
  }'
```

### Generate Legal Document
```bash
curl -X POST http://localhost:3002/api/v1/legal/documents/generate \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "business-id",
    "templateId": "template-id",
    "data": {
      "businessName": "My Business",
      "ownerName": "John Doe"
    }
  }'
```

### Sign Document
```bash
curl -X POST http://localhost:3002/api/v1/legal/documents/:documentId/sign \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "signatureHash": "hash-value"
  }'
```

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "field": "fieldName (for validation errors)"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Type check
npm run typecheck

# Database migrations
npm run db:migrate

# Database push
npm run db:push

# Seed database
npm run db:seed
```

---

## Debugging

### Enable Debug Logging
```bash
DEBUG=elara:* npm run dev
```

### Check Service Status
```bash
curl http://localhost:3002/health
```

### API Status
```bash
curl http://localhost:3002/api/v1/status
```

---

## Database

### Schema
The database schema is defined in `prisma/schema.prisma`

### Migrations
```bash
# Create migration
npm run db:migrate

# Push schema to database
npm run db:push

# Seed database
npm run db:seed
```

---

## Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test
```bash
npm test -- business.test.ts
```

### Watch Mode
```bash
npm run test:watch
```

---

## Deployment

### Build
```bash
npm run build
```

### Start
```bash
npm start
```

### Environment
Set appropriate environment variables for production:
- `NODE_ENV=production`
- `JWT_SECRET=secure-random-string`
- `DATABASE_URL=production-database-url`
- `STRIPE_API_KEY=production-stripe-key`

---

## Troubleshooting

### Port Already in Use
```bash
# Change port in .env
PORT=3003
```

### Database Connection Error
```bash
# Check DATABASE_URL in .env
# Ensure PostgreSQL is running
# Verify credentials
```

### JWT Token Invalid
```bash
# Ensure JWT_SECRET matches
# Check token expiration
# Verify token format
```

### Service Not Found
```bash
# Check service is imported in index.ts
# Verify service file exists
# Check TypeScript compilation
```

---

## Resources

- [API Documentation](./API-ROUTES.md)
- [Services Documentation](./SERVICES-IMPLEMENTATION.md)
- [Implementation Complete](./IMPLEMENTATION-COMPLETE.md)
- [Requirements](../.kiro/specs/elara-incubator/requirements.md)
- [Design](../.kiro/specs/elara-incubator/design.md)

---

## Support

For issues or questions:
1. Check the documentation
2. Review error messages
3. Check logs
4. Contact development team

---

**Last Updated**: November 19, 2024  
**Version**: 1.0.0
