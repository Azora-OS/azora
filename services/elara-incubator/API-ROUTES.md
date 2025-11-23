# Elara Incubator Platform - API Routes Documentation

## Overview

This document describes all API routes implemented for the Elara Incubator Platform. The API is organized into four main route groups: Business, Payment, Legal, and Fund management.

## Base URL

```
http://localhost:3002/api/v1
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Route Groups

### 1. Business Routes (`/businesses`)

#### Create Business
- **POST** `/businesses`
- **Auth**: Required
- **Body**: 
  ```json
  {
    "businessName": "string",
    "businessType": "string",
    "templateId": "string (optional)"
  }
  ```
- **Response**: Created business object with 90/10 ownership split

#### Get All Businesses
- **GET** `/businesses`
- **Auth**: Required
- **Query**: `page`, `pageSize`
- **Response**: Paginated list of user's businesses

#### Get Business by ID
- **GET** `/businesses/:businessId`
- **Auth**: Required
- **Response**: Business details

#### Update Business
- **PUT** `/businesses/:businessId`
- **Auth**: Required
- **Body**: Business update fields
- **Response**: Updated business object

#### Get Wizard Progress
- **GET** `/businesses/:businessId/wizard`
- **Auth**: Required
- **Response**: Current wizard step and progress

#### Update Wizard Step
- **PUT** `/businesses/:businessId/wizard/:stepId`
- **Auth**: Required
- **Body**: Step data
- **Response**: Updated step status

#### Launch Business
- **POST** `/businesses/:businessId/launch`
- **Auth**: Required
- **Response**: Launched business with allocated shares

#### Get Business Templates
- **GET** `/businesses/templates/list`
- **Auth**: Not required
- **Response**: List of available templates (ride-sharing, tutoring, e-commerce, gig-platform, custom)

#### Get Template by ID
- **GET** `/businesses/templates/:templateId`
- **Auth**: Not required
- **Response**: Template details with requirements and resources

---

### 2. Payment Routes (`/payments`)

#### Record Revenue Transaction
- **POST** `/payments/revenue`
- **Auth**: Required (admin/manager)
- **Body**:
  ```json
  {
    "businessId": "uuid",
    "amount": "number",
    "currency": "string (optional, default: USD)",
    "source": "string",
    "receivedAt": "date (optional)"
  }
  ```
- **Response**: Transaction with automatic 10% Citadel Fund allocation

#### Get Revenue Transactions
- **GET** `/payments/revenue/:businessId`
- **Auth**: Required
- **Query**: `page`, `pageSize`
- **Response**: Paginated revenue transactions

#### Get Revenue Breakdown
- **GET** `/payments/revenue/:businessId/breakdown`
- **Auth**: Required
- **Query**: `startDate`, `endDate`
- **Response**: Revenue breakdown (total, owner share, fund share)

#### Create Payment
- **POST** `/payments`
- **Auth**: Required (admin/manager)
- **Body**:
  ```json
  {
    "businessId": "uuid",
    "amount": "number",
    "type": "revenue|refund|fund_distribution",
    "paymentMethod": "string (optional)"
  }
  ```
- **Response**: Created payment object

#### Get Payment by ID
- **GET** `/payments/:paymentId`
- **Auth**: Required
- **Response**: Payment details

#### Get Payment History
- **GET** `/payments/history/:businessId`
- **Auth**: Required
- **Query**: `page`, `pageSize`
- **Response**: Payment history with status breakdown

#### Update Payment Status
- **PUT** `/payments/:paymentId/status`
- **Auth**: Required (admin/manager)
- **Body**: `{ "status": "pending|processing|completed|failed" }`
- **Response**: Updated payment

#### Retry Failed Payment
- **POST** `/payments/:paymentId/retry`
- **Auth**: Required (admin/manager)
- **Response**: Retry initiated with new status

#### Get Payment Statistics
- **GET** `/payments/stats/summary`
- **Auth**: Required (admin/manager)
- **Query**: `startDate`, `endDate`
- **Response**: Payment statistics and metrics

---

### 3. Legal Routes (`/legal`)

#### Get All Legal Templates
- **GET** `/legal/templates`
- **Auth**: Not required
- **Response**: List of legal templates (registration, operating, revenue_share, ip, compliance)

#### Get Template by ID
- **GET** `/legal/templates/:templateId`
- **Auth**: Not required
- **Response**: Template content with placeholders

#### Generate Legal Document
- **POST** `/legal/documents/generate`
- **Auth**: Required
- **Body**:
  ```json
  {
    "businessId": "uuid",
    "templateId": "uuid",
    "data": { "businessName": "string", ... }
  }
  ```
- **Response**: Generated document in draft status

#### Get Document by ID
- **GET** `/legal/documents/:documentId`
- **Auth**: Required
- **Response**: Document details

#### Get Business Documents
- **GET** `/legal/documents/business/:businessId`
- **Auth**: Required
- **Query**: `page`, `pageSize`
- **Response**: Paginated documents for business

#### Sign Document
- **POST** `/legal/documents/:documentId/sign`
- **Auth**: Required
- **Body**: `{ "signatureHash": "string" }`
- **Response**: Signed document with audit trail

#### Get Document Audit Trail
- **GET** `/legal/documents/:documentId/audit`
- **Auth**: Required
- **Response**: Complete audit trail with timestamps and IP addresses

#### Download Document as PDF
- **GET** `/legal/documents/:documentId/download`
- **Auth**: Required
- **Response**: PDF file download

#### Update Document
- **PUT** `/legal/documents/:documentId`
- **Auth**: Required
- **Body**: Document update fields
- **Response**: Updated document

#### Archive Document
- **POST** `/legal/documents/:documentId/archive`
- **Auth**: Required (admin/manager)
- **Response**: Archived document

---

### 4. Fund Routes (`/fund`)

#### Get Citadel Fund Status
- **GET** `/fund/status`
- **Auth**: Not required
- **Response**: Fund balance, contributions, distributions, impact metrics

#### Get Fund Balance
- **GET** `/fund/balance`
- **Auth**: Not required
- **Response**: Current balance and last update

#### Get Fund Contributions
- **GET** `/fund/contributions`
- **Auth**: Not required
- **Query**: `page`, `pageSize`, `startDate`, `endDate`
- **Response**: Paginated contributions with summary

#### Get Fund Distributions
- **GET** `/fund/distributions`
- **Auth**: Not required
- **Query**: `page`, `pageSize`, `startDate`, `endDate`, `type`
- **Response**: Paginated distributions with breakdown by type

#### Create Fund Distribution
- **POST** `/fund/distributions`
- **Auth**: Required (admin/manager)
- **Body**:
  ```json
  {
    "amount": "number",
    "type": "scholarship|project|community",
    "description": "string"
  }
  ```
- **Response**: Created distribution in pending status

#### Get Distribution by ID
- **GET** `/fund/distributions/:distributionId`
- **Auth**: Not required
- **Response**: Distribution details

#### Update Distribution Status
- **PUT** `/fund/distributions/:distributionId/status`
- **Auth**: Required (admin/manager)
- **Body**: `{ "status": "pending|completed|failed" }`
- **Response**: Updated distribution

#### Get Fund Impact Metrics
- **GET** `/fund/impact/metrics`
- **Auth**: Not required
- **Query**: `startDate`, `endDate`
- **Response**: Scholarships awarded, projects funded, beneficiaries

#### Get Fund Analytics
- **GET** `/fund/analytics/summary`
- **Auth**: Required (admin/manager)
- **Query**: `startDate`, `endDate`
- **Response**: Trends, top contributors, top distributions

#### Get Fund Audit Trail
- **GET** `/fund/audit/trail`
- **Auth**: Required (admin/manager)
- **Query**: `page`, `pageSize`, `startDate`, `endDate`
- **Response**: Complete audit trail of fund operations

#### Trigger Fund Distribution
- **POST** `/fund/distributions/trigger`
- **Auth**: Required (admin only)
- **Response**: Distribution triggered with processing status

#### Get Fund Configuration
- **GET** `/fund/config`
- **Auth**: Required (admin/manager)
- **Response**: Fund settings (contribution %, distribution frequency, etc.)

#### Update Fund Configuration
- **PUT** `/fund/config`
- **Auth**: Required (admin only)
- **Body**: Configuration update fields
- **Response**: Updated configuration

---

## Middleware

### Authentication Middleware
- Validates JWT token from Authorization header
- Extracts user ID and role
- Passes to next middleware/route handler

### Authorization Middleware
- Enforces role-based access control
- Supported roles: `admin`, `manager`, `incubatee`, `viewer`
- Returns 403 Forbidden if user lacks required role

### Error Handler Middleware
- Catches validation errors
- Catches application errors
- Returns standardized error responses
- Logs unhandled errors

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "field": "fieldName (for validation errors)"
}
```

### Common Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

---

## Validation Rules

### Business Creation
- `businessName`: Required, non-empty string, max 255 characters
- `businessType`: Required, must be valid type (ride-sharing, tutoring, e-commerce, gig-platform, custom)
- `templateId`: Optional UUID

### Revenue Transaction
- `amount`: Required, positive number
- `source`: Required, non-empty string
- `currency`: Optional, valid currency code (USD, EUR, GBP, etc.)

### Payment
- `amount`: Required, positive number
- `type`: Required, one of: revenue, refund, fund_distribution

### Legal Document
- `templateId`: Required, valid UUID
- `data`: Required, object with template placeholders

### Fund Distribution
- `amount`: Required, positive number
- `type`: Required, one of: scholarship, project, community
- `description`: Required, non-empty string, max 1000 characters

---

## Implementation Notes

### Revenue Allocation
- All revenue transactions automatically allocate 10% to Citadel Fund
- 90% goes to business owner
- Allocation is recorded in separate transaction record

### Ownership Structure
- Business owner: 90% equity
- Citadel Fund: 10% equity
- Allocation happens at business launch

### Audit Trail
- All financial transactions logged with timestamp, user, and IP address
- Document signatures include cryptographic hash
- Fund operations tracked for compliance

### Pagination
- Default page size: 10
- Maximum page size: 100
- Returns total count and page information

---

## Future Implementation

The following endpoints are currently stubbed and require service layer implementation:

1. Business service integration
2. Revenue service integration
3. Payment processing (Stripe)
4. Legal document generation (PDF)
5. Fund distribution logic
6. Elara AI integration for mentorship
7. Constitutional AI validation
8. Notification service integration
9. Database persistence layer

---

**Last Updated**: 2024-11-19  
**Version**: 1.0.0
