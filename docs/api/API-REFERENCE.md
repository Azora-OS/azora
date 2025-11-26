# Azora API Reference

## Base URLs

- **Production**: `https://api.azora.world`
- **Staging**: `https://api-staging.azora.world`
- **Local**: `http://localhost:3000`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Get Access Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

## Core Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

### Courses

#### List Courses
```http
GET /api/education/courses?page=1&limit=20&category=programming
```

**Response:**
```json
{
  "courses": [
    {
      "id": "course_123",
      "title": "Introduction to Programming",
      "description": "Learn programming basics",
      "price": 49.99,
      "instructor": {
        "id": "user_456",
        "name": "Jane Smith"
      },
      "enrollmentCount": 1250
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

#### Get Course Details
```http
GET /api/education/courses/:courseId
```

#### Enroll in Course
```http
POST /api/education/courses/:courseId/enroll
Authorization: Bearer <access_token>
```

### Payments

#### Create Payment Intent
```http
POST /api/pay/payment-intent
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 4999,
  "currency": "usd",
  "courseId": "course_123"
}
```

**Response:**
```json
{
  "clientSecret": "pi_123_secret_456",
  "paymentIntentId": "pi_123"
}
```

#### Get Payment History
```http
GET /api/pay/payments?page=1&limit=10
Authorization: Bearer <access_token>
```

### User Profile

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <access_token>
```

#### Update Profile
```http
PATCH /api/auth/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "John Updated",
  "bio": "Software developer"
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "details": {}
  }
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## Rate Limiting

- **Authenticated**: 1000 requests per hour
- **Unauthenticated**: 100 requests per hour

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
```

## Pagination

List endpoints support pagination:

```http
GET /api/resource?page=1&limit=20
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## Webhooks

Subscribe to events via webhooks:

```http
POST /api/webhooks
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["payment.success", "course.enrolled"]
}
```

### Webhook Events

- `payment.success` - Payment completed
- `payment.failed` - Payment failed
- `course.enrolled` - User enrolled in course
- `course.completed` - User completed course

## SDKs

- **JavaScript/TypeScript**: `npm install @azora/sdk`
- **Python**: `pip install azora-sdk`

Example usage:
```typescript
import { AzoraClient } from '@azora/sdk';

const client = new AzoraClient({
  apiKey: 'your_api_key',
  environment: 'production'
});

const courses = await client.courses.list();
```
