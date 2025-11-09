# 📡 Azora OS API Reference

**Complete API documentation for the Constitutional AI Operating System**

---

## 🚀 Getting Started

### Base URL
```
Production:  https://api.azora.world
Development: http://localhost:4000
```

### Authentication
All API requests require authentication via JWT tokens:

```http
Authorization: Bearer <your_jwt_token>
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

---

## 🔐 Authentication API

### Login
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
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "student"
    }
  }
}
```

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "student"
}
```

### OAuth Login
```http
GET /api/auth/oauth/google
GET /api/auth/oauth/github
GET /api/auth/oauth/apple
```

---

## 👤 User Management API

### Get Current User
```http
GET /api/users/me
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "bio": "Updated bio",
  "avatar": "https://example.com/avatar.jpg"
}
```

### Delete Account
```http
DELETE /api/users/me
Authorization: Bearer <token>
```

---

## 🎓 Education API

### Get Courses
```http
GET /api/courses?page=1&limit=10&category=programming
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "course_id",
        "title": "Introduction to AI",
        "description": "Learn AI fundamentals",
        "instructor": {
          "id": "instructor_id",
          "name": "Dr. Smith"
        },
        "price": 99.99,
        "currency": "AZR",
        "duration": "8 weeks",
        "level": "beginner",
        "rating": 4.8,
        "enrollments": 1250
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "pages": 15
    }
  }
}
```

### Get Course Details
```http
GET /api/courses/:courseId
Authorization: Bearer <token>
```

### Enroll in Course
```http
POST /api/enrollments
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseId": "course_id",
  "paymentMethod": "wallet"
}
```

### Get My Enrollments
```http
GET /api/enrollments/me
Authorization: Bearer <token>
```

### Submit Assignment
```http
POST /api/assignments/:assignmentId/submit
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <file_upload>,
  "notes": "Assignment submission notes"
}
```

---

## 💰 Financial API

### Get Wallet Balance
```http
GET /api/wallet
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "balances": {
      "AZR": "1250.50",
      "BTC": "0.00125",
      "ETH": "0.5",
      "ZAR": "18750.00"
    },
    "totalValueUSD": "2500.00"
  }
}
```

### Create Transaction
```http
POST /api/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "send",
  "currency": "AZR",
  "amount": "100.00",
  "recipient": "recipient_wallet_address",
  "memo": "Payment for course"
}
```

### Get Transaction History
```http
GET /api/transactions?page=1&limit=20&type=all
Authorization: Bearer <token>
```

### Start Mining
```http
POST /api/mining/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "duration": "24h",
  "power": "medium"
}
```

### Get Mining Status
```http
GET /api/mining/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isActive": true,
    "startTime": "2025-01-01T00:00:00Z",
    "endTime": "2025-01-02T00:00:00Z",
    "power": "medium",
    "earned": "12.50",
    "estimatedDaily": "15.00"
  }
}
```

---

## 🔨 Marketplace API

### Get Jobs
```http
GET /api/jobs?skills=javascript,react&location=remote&page=1
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job_id",
        "title": "React Developer",
        "description": "Build amazing UIs",
        "company": "Tech Corp",
        "location": "Remote",
        "type": "freelance",
        "budget": {
          "min": 500,
          "max": 1500,
          "currency": "AZR"
        },
        "skills": ["React", "JavaScript", "CSS"],
        "deadline": "2025-02-01T00:00:00Z",
        "postedAt": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

### Apply for Job
```http
POST /api/jobs/:jobId/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "coverLetter": "I'm interested in this position...",
  "proposedRate": 1000,
  "estimatedHours": 40,
  "portfolio": ["https://github.com/user/project"]
}
```

### Get My Applications
```http
GET /api/applications/me
Authorization: Bearer <token>
```

### Create Job Posting
```http
POST /api/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "React Developer Needed",
  "description": "We need a skilled React developer...",
  "budget": {
    "min": 500,
    "max": 1500,
    "currency": "AZR"
  },
  "skills": ["React", "JavaScript"],
  "deadline": "2025-02-01T00:00:00Z",
  "type": "freelance"
}
```

---

## 🤖 AI Services API

### Chat with AI Tutor
```http
POST /api/ai/tutor/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Explain quantum computing",
  "context": {
    "courseId": "course_id",
    "subject": "physics"
  }
}
```

### Generate Content
```http
POST /api/ai/content/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "quiz",
  "topic": "JavaScript fundamentals",
  "difficulty": "intermediate",
  "questions": 10
}
```

### Constitutional AI Check
```http
POST /api/ai/constitutional/check
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Content to check for compliance",
  "type": "course_material"
}
```

---

## 📊 Analytics API

### Get Dashboard Stats
```http
GET /api/analytics/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "coursesCompleted": 5,
      "totalEarnings": "250.00",
      "studyHours": 120,
      "certificates": 3
    },
    "financial": {
      "totalBalance": "1250.50",
      "miningEarnings": "75.25",
      "transactionCount": 45
    }
  }
}
```

### Get Learning Progress
```http
GET /api/analytics/learning/:courseId
Authorization: Bearer <token>
```

---

## 🔔 Notifications API

### Get Notifications
```http
GET /api/notifications?unread=true&page=1
Authorization: Bearer <token>
```

### Mark as Read
```http
PUT /api/notifications/:notificationId/read
Authorization: Bearer <token>
```

### Subscribe to Push Notifications
```http
POST /api/notifications/subscribe
Authorization: Bearer <token>
Content-Type: application/json

{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "key_here",
    "auth": "auth_key_here"
  }
}
```

---

## 📁 File Upload API

### Upload File
```http
POST /api/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <file_upload>,
  "type": "assignment|avatar|document",
  "metadata": {
    "courseId": "course_id",
    "assignmentId": "assignment_id"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "file_id",
    "url": "https://cdn.azora.com/files/file_id",
    "filename": "document.pdf",
    "size": 1024000,
    "type": "application/pdf"
  }
}
```

---

## 🏥 Health Check API

### System Health
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-01T12:00:00Z",
    "services": {
      "database": "healthy",
      "redis": "healthy",
      "ai_services": "healthy"
    },
    "version": "3.0.0"
  }
}
```

---

## 🚨 Error Handling

### Error Response Format
```json
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

### Common Error Codes
- `VALIDATION_ERROR` - Invalid input data
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

---

## 📊 Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 5 requests | 1 minute |
| General API | 100 requests | 1 minute |
| File Upload | 10 requests | 1 minute |
| AI Services | 20 requests | 1 minute |

---

## 🔧 SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @azora/sdk
```

```javascript
import { AzoraClient } from '@azora/sdk'

const client = new AzoraClient({
  apiKey: 'your_api_key',
  baseURL: 'https://api.azora.com'
})

// Get courses
const courses = await client.courses.list()

// Enroll in course
await client.enrollments.create({ courseId: 'course_id' })
```

### Python
```bash
pip install azora-sdk
```

```python
from azora import AzoraClient

client = AzoraClient(api_key='your_api_key')

# Get wallet balance
balance = client.wallet.get_balance()

# Start mining
client.mining.start(duration='24h', power='medium')
```

---

## 🧪 Testing

### Postman Collection
Download our [Postman Collection](./postman/azora-api.json) for easy API testing.

### Test Environment
```
Base URL: https://api-staging.azora.com
Test API Key: test_key_12345
```

---

## 📞 Support

- **Documentation**: [docs.azora.com](https://docs.azora.com)
- **Discord**: [discord.gg/azora](https://discord.gg/azora)
- **Email**: api-support@azora.com

---

**Happy coding! 🚀**