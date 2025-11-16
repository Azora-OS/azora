# API Reference

## Overview

Azora OS provides a comprehensive REST API for all platform functionality. This guide covers authentication, endpoints, and best practices.

**Base URL**: `https://api.azora.io/api/v1`  
**Authentication**: JWT Bearer Token  
**Response Format**: JSON  
**Rate Limit**: 1000 requests/hour per user

---

## Authentication

### Getting a Token

```bash
# Login with email/password
curl -X POST https://api.azora.io/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400
}
```

### Using the Token

```bash
# Include in Authorization header
curl -X GET https://api.azora.io/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### Token Refresh

```bash
# Refresh expired token
curl -X POST https://api.azora.io/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }'
```

---

## Authentication Endpoints

### POST /auth/login

Login with email and password.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 86400,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "roles": ["user"]
  }
}
```

### POST /auth/register

Create a new user account.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2023-11-15T10:00:00Z"
}
```

### POST /auth/logout

Logout current user.

**Response** (200):
```json
{
  "message": "Logged out successfully"
}
```

---

## User Endpoints

### GET /users/me

Get current user profile.

**Response** (200):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://...",
  "roles": ["user"],
  "createdAt": "2023-11-15T10:00:00Z"
}
```

### PUT /users/me

Update current user profile.

**Request**:
```json
{
  "name": "Jane Doe",
  "avatar": "https://..."
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Jane Doe",
  "avatar": "https://..."
}
```

### GET /users/:id

Get user by ID.

**Response** (200):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://..."
}
```

---

## Course Endpoints

### GET /courses

List all courses.

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `category`: Filter by category
- `level`: Filter by level (beginner, intermediate, advanced)
- `search`: Search by title

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Introduction to TypeScript",
      "description": "Learn TypeScript basics",
      "category": "programming",
      "level": "beginner",
      "instructor": {
        "id": "uuid",
        "name": "John Doe"
      },
      "enrollmentCount": 1234,
      "rating": 4.8,
      "createdAt": "2023-11-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### GET /courses/:id

Get course details.

**Response** (200):
```json
{
  "id": "uuid",
  "title": "Introduction to TypeScript",
  "description": "Learn TypeScript basics",
  "category": "programming",
  "level": "beginner",
  "instructor": {
    "id": "uuid",
    "name": "John Doe"
  },
  "lessons": [
    {
      "id": "uuid",
      "title": "Lesson 1: Basics",
      "duration": 30,
      "order": 1
    }
  ],
  "enrollmentCount": 1234,
  "rating": 4.8
}
```

### POST /courses

Create a new course (instructor only).

**Request**:
```json
{
  "title": "Advanced TypeScript",
  "description": "Master TypeScript",
  "category": "programming",
  "level": "advanced"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "title": "Advanced TypeScript",
  "description": "Master TypeScript",
  "category": "programming",
  "level": "advanced",
  "createdAt": "2023-11-15T10:00:00Z"
}
```

---

## Enrollment Endpoints

### POST /courses/:id/enroll

Enroll in a course.

**Response** (201):
```json
{
  "id": "uuid",
  "userId": "uuid",
  "courseId": "uuid",
  "progress": 0,
  "enrolledAt": "2023-11-15T10:00:00Z"
}
```

### GET /enrollments

Get user's enrollments.

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "course": {
        "id": "uuid",
        "title": "Introduction to TypeScript"
      },
      "progress": 45,
      "enrolledAt": "2023-11-15T10:00:00Z"
    }
  ]
}
```

### GET /enrollments/:id

Get enrollment details.

**Response** (200):
```json
{
  "id": "uuid",
  "userId": "uuid",
  "courseId": "uuid",
  "progress": 45,
  "completedLessons": 5,
  "totalLessons": 10,
  "enrolledAt": "2023-11-15T10:00:00Z"
}
```

---

## Assessment Endpoints

### GET /courses/:courseId/quizzes

List quizzes for a course.

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Module 1 Quiz",
      "passingScore": 70,
      "timeLimit": 30,
      "questionCount": 10
    }
  ]
}
```

### POST /quizzes/:id/submit

Submit quiz answers.

**Request**:
```json
{
  "answers": [
    {
      "questionId": "uuid",
      "answer": "A"
    }
  ]
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "score": 85,
  "passed": true,
  "feedback": "Great job!",
  "submittedAt": "2023-11-15T10:00:00Z"
}
```

---

## AI Endpoints

### POST /ai/chat

Chat with AI assistant.

**Request**:
```json
{
  "message": "Explain TypeScript generics",
  "personality": "tutor",
  "context": {
    "courseId": "uuid",
    "lessonId": "uuid"
  }
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "message": "Generics allow you to...",
  "personality": "tutor",
  "timestamp": "2023-11-15T10:00:00Z"
}
```

### GET /ai/learning-path

Get personalized learning path.

**Response** (200):
```json
{
  "courses": [
    {
      "id": "uuid",
      "title": "Introduction to TypeScript",
      "reason": "Recommended based on your interests"
    }
  ],
  "estimatedDuration": 40,
  "difficulty": "beginner"
}
```

---

## Payment Endpoints

### POST /payments/create-intent

Create payment intent.

**Request**:
```json
{
  "amount": 9999,
  "currency": "USD",
  "description": "Course enrollment"
}
```

**Response** (200):
```json
{
  "clientSecret": "pi_...",
  "amount": 9999,
  "currency": "USD"
}
```

### GET /payments/history

Get payment history.

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "amount": 9999,
      "currency": "USD",
      "status": "succeeded",
      "createdAt": "2023-11-15T10:00:00Z"
    }
  ]
}
```

---

## Wallet Endpoints

### GET /wallet

Get wallet balance.

**Response** (200):
```json
{
  "id": "uuid",
  "balance": 50000,
  "currency": "USD",
  "blockchainAddress": "0x..."
}
```

### POST /wallet/withdraw

Request withdrawal.

**Request**:
```json
{
  "amount": 10000,
  "bankAccountId": "uuid"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "amount": 10000,
  "status": "pending",
  "createdAt": "2023-11-15T10:00:00Z"
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "reason": "Must be valid email"
    }
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| INVALID_REQUEST | 400 | Invalid request parameters |
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMITED | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |

---

## Rate Limiting

### Limits

- **Free tier**: 100 requests/hour
- **Pro tier**: 1000 requests/hour
- **Enterprise**: Unlimited

### Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1700000000
```

### Retry Logic

```bash
# If rate limited (429), retry after delay
if (response.status === 429) {
  const retryAfter = response.headers['Retry-After'];
  await sleep(retryAfter * 1000);
  // Retry request
}
```

---

## Pagination

### Query Parameters

```
?page=1&limit=20&sort=createdAt&order=desc
```

### Response Format

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

---

## Webhooks

### Supported Events

- `payment.succeeded`
- `payment.failed`
- `course.completed`
- `certificate.issued`
- `withdrawal.processed`

### Webhook Request

```json
{
  "id": "evt_...",
  "type": "payment.succeeded",
  "timestamp": "2023-11-15T10:00:00Z",
  "data": {
    "paymentId": "uuid",
    "amount": 9999,
    "status": "succeeded"
  }
}
```

### Webhook Response

```bash
# Must respond with 200 OK within 30 seconds
HTTP/1.1 200 OK
```

---

## SDKs

### JavaScript/TypeScript

```bash
npm install @azora/sdk
```

```typescript
import { AzoraClient } from '@azora/sdk';

const client = new AzoraClient({
  apiKey: 'your-api-key'
});

const courses = await client.courses.list();
```

### Python

```bash
pip install azora-sdk
```

```python
from azora import AzoraClient

client = AzoraClient(api_key='your-api-key')
courses = client.courses.list()
```

---

## Best Practices

1. **Use pagination** for large datasets
2. **Implement retry logic** for failed requests
3. **Cache responses** when appropriate
4. **Use webhooks** for real-time updates
5. **Handle errors gracefully**
6. **Monitor rate limits**
7. **Keep API keys secure**
8. **Use HTTPS** always

