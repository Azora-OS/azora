# Elara Incubator Platform - API Documentation

## Overview

Complete API documentation for the Elara Incubator Platform backend services.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

## Business Endpoints

### Create Business
```
POST /businesses
Content-Type: application/json

{
  "businessName": "My Business",
  "businessType": "e-commerce",
  "templateId": "template-1"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "business-123",
    "businessName": "My Business",
    "businessType": "e-commerce",
    "status": "draft",
    "userOwnership": 90,
    "citadelFundShare": 10,
    "createdAt": "2024-11-19T10:00:00Z"
  }
}
```

### Get Business
```
GET /businesses/:businessId

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

### List Businesses
```
GET /businesses?page=1&pageSize=10

Response: 200 OK
{
  "success": true,
  "data": {
    "data": [...],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Revenue Endpoints

### Record Revenue Transaction
```
POST /revenue/:businessId/transactions
Content-Type: application/json

{
  "amount": 1000,
  "currency": "USD",
  "source": "online_sales",
  "receivedAt": "2024-11-19T10:00:00Z"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "transaction-123",
    "businessId": "business-123",
    "amount": 1000,
    "currency": "USD",
    "source": "online_sales",
    "status": "completed",
    "createdAt": "2024-11-19T10:00:00Z"
  }
}
```

### Get Revenue Breakdown
```
GET /revenue/:businessId/breakdown?startDate=2024-01-01&endDate=2024-12-31

Response: 200 OK
{
  "success": true,
  "data": {
    "totalRevenue": 10000,
    "businessOwnerShare": 9000,
    "citadelFundShare": 1000,
    "currency": "USD",
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-12-31"
    }
  }
}
```

### Get Revenue Statistics
```
GET /revenue/:businessId/statistics?startDate=2024-01-01&endDate=2024-12-31

Response: 200 OK
{
  "success": true,
  "data": {
    "totalRevenue": 10000,
    "transactionCount": 50,
    "averageTransaction": 200,
    "largestTransaction": 1000,
    "smallestTransaction": 50,
    "businessOwnerTotal": 9000,
    "citadelFundTotal": 1000,
    "currency": "USD"
  }
}
```

## Payment Endpoints

### Create Payment
```
POST /payments
Content-Type: application/json

{
  "businessId": "business-123",
  "amount": 450,
  "type": "revenue",
  "paymentMethod": "stripe"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "payment-123",
    "businessId": "business-123",
    "amount": 450,
    "type": "revenue",
    "status": "pending",
    "transactionId": "pi_123456",
    "createdAt": "2024-11-19T10:00:00Z"
  }
}
```

### Confirm Payment
```
POST /payments/:paymentId/confirm
Content-Type: application/json

{
  "paymentMethodId": "pm_123456"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "payment-123",
    "status": "completed",
    "completedAt": "2024-11-19T10:05:00Z"
  }
}
```

### Get Payment History
```
GET /payments/business/:businessId/history

Response: 200 OK
{
  "success": true,
  "data": {
    "payments": [...],
    "totalAmount": 4500,
    "totalCount": 10,
    "averageAmount": 450,
    "statusBreakdown": {
      "pending": 0,
      "processing": 0,
      "completed": 10,
      "failed": 0
    }
  }
}
```

## Legal Document Endpoints

### Get Business Documents
```
GET /legal/business/:businessId/documents

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "doc-123",
      "businessId": "business-123",
      "type": "registration",
      "status": "draft",
      "createdAt": "2024-11-19T10:00:00Z"
    }
  ]
}
```

### Sign Document
```
POST /legal/documents/:documentId/sign
Content-Type: application/json

{
  "signatureHash": "hash-123",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "doc-123",
    "status": "signed",
    "signedAt": "2024-11-19T10:05:00Z",
    "signatureHash": "hash-123"
  }
}
```

## Citadel Fund Endpoints

### Get Fund Balance
```
GET /fund/balance

Response: 200 OK
{
  "success": true,
  "data": {
    "balance": 50000,
    "totalContributions": 100000,
    "totalDistributions": 50000,
    "lastDistributionDate": "2024-11-15T10:00:00Z",
    "nextDistributionDate": "2024-12-15T10:00:00Z"
  }
}
```

### Get Fund Statistics
```
GET /fund/statistics

Response: 200 OK
{
  "success": true,
  "data": {
    "balance": 50000,
    "totalContributions": 100000,
    "totalDistributions": 50000,
    "activeBusinesses": 25,
    "averageContributionPerBusiness": 4000
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Rate Limiting

- **Limit**: 1000 requests per hour per user
- **Headers**: 
  - `X-RateLimit-Limit`: 1000
  - `X-RateLimit-Remaining`: 999
  - `X-RateLimit-Reset`: 1234567890

## Pagination

All list endpoints support pagination:

- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 10, max: 100)

## Filtering

Supported filters vary by endpoint:

- `startDate`: Filter by start date (ISO 8601)
- `endDate`: Filter by end date (ISO 8601)
- `status`: Filter by status
- `type`: Filter by type

## Sorting

Supported sort parameters:

- `sortBy`: Field to sort by
- `sortOrder`: 'asc' or 'desc' (default: 'desc')

## Webhooks

### Payment Completed
```
POST /webhooks/payment-completed
{
  "event": "payment.completed",
  "paymentId": "payment-123",
  "amount": 450,
  "timestamp": "2024-11-19T10:00:00Z"
}
```

### Revenue Recorded
```
POST /webhooks/revenue-recorded
{
  "event": "revenue.recorded",
  "transactionId": "transaction-123",
  "amount": 1000,
  "businessId": "business-123",
  "timestamp": "2024-11-19T10:00:00Z"
}
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Create business
const business = await api.post('/businesses', {
  businessName: 'My Business',
  businessType: 'e-commerce',
  templateId: 'template-1'
});

// Get revenue breakdown
const breakdown = await api.get(`/revenue/${business.data.data.id}/breakdown`);
```

### Python
```python
import requests

headers = {
    'Authorization': f'Bearer {token}'
}

# Create business
response = requests.post(
    'http://localhost:3000/api/businesses',
    json={
        'businessName': 'My Business',
        'businessType': 'e-commerce',
        'templateId': 'template-1'
    },
    headers=headers
)

business = response.json()['data']
```

---

**Last Updated**: 2024-11-19
**Version**: 1.0
