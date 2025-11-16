# Enterprise Service

Manages enterprise licensing, white-label features, usage tracking, and support for Azora OS.

## Overview

The enterprise service provides:
- Enterprise license management and activation
- White-label customization (branding, domains, SSO)
- Usage tracking and limit enforcement
- Support ticket management with SLA tracking
- Enterprise analytics and reporting

## Architecture

### Components

1. **EnterpriseLicenseService** - License management
   - Create and manage licenses
   - Activate and validate licenses
   - Renew and cancel licenses
   - Track license expiry

2. **WhiteLabelService** - Customization
   - Custom branding (colors, logos)
   - Custom domain support
   - SSO integration
   - API access configuration

3. **UsageTrackingService** - Usage monitoring
   - Track active users, courses, API calls
   - Monitor storage usage
   - Check limit compliance
   - Generate usage reports

4. **EnterpriseSupportService** - Support management
   - Create and manage support tickets
   - SLA tracking and compliance
   - Priority routing
   - Support statistics

## Database Schema

### Enterprise Licenses Table
```sql
CREATE TABLE enterprise_licenses (
  id TEXT PRIMARY KEY,
  organizationId TEXT UNIQUE NOT NULL,
  organizationName TEXT NOT NULL,
  tier EnterpriseTier NOT NULL,
  status EnterpriseStatus DEFAULT 'ACTIVE',
  licenseKey TEXT UNIQUE NOT NULL,
  maxUsers INTEGER NOT NULL,
  maxCourses INTEGER,
  maxApiCalls INTEGER,
  startDate TIMESTAMP NOT NULL,
  expiryDate TIMESTAMP NOT NULL,
  autoRenew BOOLEAN DEFAULT true,
  customDomain TEXT,
  whiteLabel BOOLEAN DEFAULT false,
  ssoEnabled BOOLEAN DEFAULT false,
  apiAccessEnabled BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Enterprise Organizations Table
```sql
CREATE TABLE enterprise_organizations (
  id TEXT PRIMARY KEY,
  licenseId TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  industry TEXT,
  country TEXT,
  city TEXT,
  address TEXT,
  adminUserId TEXT,
  contactName TEXT,
  contactEmail TEXT,
  contactPhone TEXT,
  metadata JSONB DEFAULT '{}',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Enterprise Usage Tracking Table
```sql
CREATE TABLE enterprise_usage_tracking (
  id TEXT PRIMARY KEY,
  licenseId TEXT NOT NULL,
  date TIMESTAMP DEFAULT NOW(),
  activeUsers INTEGER DEFAULT 0,
  coursesCreated INTEGER DEFAULT 0,
  apiCallsUsed INTEGER DEFAULT 0,
  storageUsed DOUBLE PRECISION DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);
```

### Enterprise Support Tickets Table
```sql
CREATE TABLE enterprise_support_tickets (
  id TEXT PRIMARY KEY,
  licenseId TEXT NOT NULL,
  ticketNumber TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority SupportPriority DEFAULT 'NORMAL',
  status SupportTicketStatus DEFAULT 'OPEN',
  assignedTo TEXT,
  createdBy TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  resolvedAt TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);
```

### Enterprise Customizations Table
```sql
CREATE TABLE enterprise_customizations (
  id TEXT PRIMARY KEY,
  licenseId TEXT NOT NULL,
  type CustomizationType NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(licenseId, type, key)
);
```

## Usage

### Create Enterprise License

```typescript
import { EnterpriseLicenseService } from '@/services/enterprise';

const licenseService = new EnterpriseLicenseService();
const license = await licenseService.createLicense({
  organizationName: 'Acme Corp',
  organizationEmail: 'admin@acme.com',
  tier: 'PROFESSIONAL',
  maxUsers: 500,
  maxCourses: 100,
  maxApiCalls: 100000,
  startDate: new Date(),
  expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
});
```

### Enable White-Label

```typescript
import { WhiteLabelService } from '@/services/enterprise';

const whitelabelService = new WhiteLabelService();
await whitelabelService.enableWhiteLabel(licenseId);
await whitelabelService.setCustomDomain(licenseId, 'learning.acme.com');
await whitelabelService.setBranding(licenseId, {
  primaryColor: '#FF6B6B',
  logoUrl: 'https://acme.com/logo.png',
  companyName: 'Acme Learning',
});
```

### Track Usage

```typescript
import { UsageTrackingService } from '@/services/enterprise';

const usageService = new UsageTrackingService();
await usageService.trackUsage(licenseId, {
  activeUsers: 250,
  coursesCreated: 45,
  apiCallsUsed: 50000,
  storageUsed: 100,
});

const report = await usageService.getUsageReport(licenseId, startDate, endDate);
```

### Create Support Ticket

```typescript
import { EnterpriseSupportService } from '@/services/enterprise';

const supportService = new EnterpriseSupportService();
const ticket = await supportService.createTicket({
  licenseId,
  title: 'SSO Integration Issue',
  description: 'Users unable to login via SSO',
  priority: 'HIGH',
  createdBy: 'admin@acme.com',
});
```

## Enterprise Tiers

### Starter
- Up to 100 users
- 10 courses
- 10,000 API calls/month
- Email support
- Basic customization

### Professional
- Up to 500 users
- 100 courses
- 100,000 API calls/month
- Priority support (4h response)
- Full white-label
- SSO integration

### Enterprise
- Unlimited users
- Unlimited courses
- Unlimited API calls
- Dedicated support (1h response)
- Full customization
- Custom integrations

### Custom
- Custom limits
- Custom pricing
- Custom features
- Dedicated account manager

## License Status

- **ACTIVE**: License is valid and active
- **SUSPENDED**: License is temporarily suspended
- **EXPIRED**: License has expired
- **CANCELLED**: License has been cancelled

## Support Priority & SLA

| Priority | Response Time | Status |
|----------|---------------|--------|
| LOW | 48 hours | Community |
| NORMAL | 24 hours | Standard |
| HIGH | 4 hours | Priority |
| CRITICAL | 1 hour | Emergency |

## Customization Types

- **BRANDING**: Logo, colors, company name
- **DOMAIN**: Custom domain configuration
- **SSO**: Single sign-on configuration
- **API**: API access configuration
- **FEATURE**: Feature toggles
- **INTEGRATION**: Third-party integrations

## API Endpoints

### Create License

```bash
POST /api/enterprise/licenses/create
Content-Type: application/json
Authorization: Bearer <token>

{
  "organizationName": "Acme Corp",
  "organizationEmail": "admin@acme.com",
  "tier": "PROFESSIONAL",
  "maxUsers": 500,
  "maxCourses": 100,
  "startDate": "2024-01-01T00:00:00Z",
  "expiryDate": "2025-01-01T00:00:00Z"
}
```

### Activate License

```bash
POST /api/enterprise/licenses/activate
Content-Type: application/json
Authorization: Bearer <token>

{
  "licenseKey": "AZORA-..."
}
```

### Get License

```bash
GET /api/enterprise/licenses/{licenseId}
Authorization: Bearer <token>
```

### Track Usage

```bash
POST /api/enterprise/usage/track
Content-Type: application/json
Authorization: Bearer <token>

{
  "licenseId": "...",
  "activeUsers": 250,
  "coursesCreated": 45,
  "apiCallsUsed": 50000,
  "storageUsed": 100
}
```

### Create Support Ticket

```bash
POST /api/enterprise/support/tickets
Content-Type: application/json
Authorization: Bearer <token>

{
  "licenseId": "...",
  "title": "SSO Integration Issue",
  "description": "Users unable to login via SSO",
  "priority": "HIGH"
}
```

## Features

### License Management
- Create and manage licenses
- Automatic renewal
- Expiry tracking
- License validation

### White-Label
- Custom branding
- Custom domains
- SSO integration
- API access

### Usage Monitoring
- Real-time usage tracking
- Limit enforcement
- Usage alerts
- Usage reports

### Support
- Ticket management
- SLA tracking
- Priority routing
- Support statistics

## Integration Points

1. **Payment Service**: License billing
2. **Subscription Service**: Feature access
3. **User Service**: User management
4. **Logging**: All operations logged

## Performance Considerations

- Indexes on frequently queried fields
- Pagination for large result sets
- Caching for license data
- Batch operations for usage tracking

## Security Considerations

- License key validation
- Organization verification
- Usage limit enforcement
- Audit logging
- Data encryption

## Testing

Run tests with:
```bash
npm test -- services/enterprise
```

Test coverage includes:
- License creation and validation
- White-label customization
- Usage tracking
- Support ticket management
- SLA compliance

## Future Enhancements

- [ ] Advanced analytics dashboard
- [ ] Custom reporting
- [ ] Automated billing
- [ ] Multi-tenant support
- [ ] Advanced SSO options
- [ ] Custom integrations
- [ ] Dedicated infrastructure
- [ ] Premium support tiers
