# 📡 Azora OS API Documentation

**Ubuntu Principle:** *"My API strengthens our foundation"*

Complete API reference for all Azora OS services.

---

## 🚀 Quick Start

### Base URL

```
Development: http://localhost:4000/api
Production:  https://api.azora.world
```

### Authentication

All protected endpoints require a Bearer token:

```bash
Authorization: Bearer <your-token-here>
```

Get token by logging in:
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@azora.world","password":"Azora2025!"}'
```

---

## 📚 API Resources

### 🔐 Authentication

#### Register User
```http
POST /auth/register
```

**Request:**
```json
{
  "email": "student@azora.world",
  "password": "Azora2025!",
  "name": "Themba Ndlovu",
  "role": "student"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "student@azora.world",
    "name": "Themba Ndlovu",
    "role": "student"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here"
}
```

#### Login
```http
POST /auth/login
```

**Request:**
```json
{
  "email": "student@azora.world",
  "password": "Azora2025!"
}
```

**Response:** Same as register

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "user_123",
  "email": "student@azora.world",
  "name": "Themba Ndlovu",
  "role": "student",
  "createdAt": "2025-01-10T10:00:00Z"
}
```

---

### 🎓 Education

#### List Courses
```http
GET /courses?category=Programming&level=beginner&page=1&limit=20
```

**Response:**
```json
{
  "courses": [
    {
      "id": "course_123",
      "title": "Introduction to Python",
      "description": "Learn Python from scratch",
      "instructorId": "user_456",
      "price": 100,
      "currency": "AZR",
      "duration": 40,
      "level": "beginner",
      "category": "Programming",
      "published": true
    }
  ],
  "total": 50,
  "page": 1,
  "pages": 3
}
```

#### Create Course
```http
POST /courses
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "Introduction to Python",
  "description": "Learn Python from scratch",
  "price": 100,
  "duration": 40,
  "level": "beginner",
  "category": "Programming"
}
```

#### Enroll in Course
```http
POST /courses/:courseId/enroll
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "enrollment_123",
  "studentId": "user_123",
  "courseId": "course_456",
  "status": "active",
  "progress": 0,
  "enrolledAt": "2025-01-10T10:00:00Z"
}
```

#### Get Student Progress
```http
GET /progress/:studentId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "studentId": "user_123",
  "enrollments": [
    {
      "courseId": "course_456",
      "courseTitle": "Introduction to Python",
      "progress": 45,
      "status": "active",
      "completedModules": 3,
      "totalModules": 8
    }
  ]
}
```

---

### 💰 Finance

#### Get Wallet Balance
```http
GET /wallet/balance
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "wallet_123",
  "userId": "user_123",
  "balance": 1000.50,
  "staked": 500.00,
  "earned": 250.75,
  "currency": "AZR"
}
```

#### Get Transactions
```http
GET /transactions?type=reward&limit=50
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "tx_123",
    "type": "reward",
    "amount": 50.00,
    "reason": "Course completion",
    "status": "completed",
    "createdAt": "2025-01-10T10:00:00Z"
  }
]
```

#### Start Mining
```http
POST /mining/start
Authorization: Bearer <token>
```

**Request:**
```json
{
  "activityId": "course_123",
  "activityType": "course_completion"
}
```

**Response:**
```json
{
  "id": "mining_123",
  "walletId": "wallet_123",
  "activityId": "course_123",
  "activityType": "course_completion",
  "tokensEarned": 50.00,
  "minedAt": "2025-01-10T10:00:00Z"
}
```

#### Stake Tokens
```http
POST /wallet/stake
Authorization: Bearer <token>
```

**Request:**
```json
{
  "amount": 500.00
}
```

**Response:**
```json
{
  "id": "stake_123",
  "walletId": "wallet_123",
  "amount": 500.00,
  "rewardRate": 0.05,
  "status": "active",
  "startDate": "2025-01-10T10:00:00Z"
}
```

---

### 🔨 Marketplace

#### List Jobs
```http
GET /jobs?category=Web Development&skills=React,TypeScript
```

**Response:**
```json
[
  {
    "id": "job_123",
    "title": "Build React Dashboard",
    "description": "Need a modern admin dashboard",
    "employerId": "user_456",
    "budget": 500.00,
    "currency": "AZR",
    "status": "open",
    "skills": ["React", "TypeScript", "Tailwind CSS"],
    "category": "Web Development",
    "deadline": "2025-02-10T00:00:00Z"
  }
]
```

#### Create Job
```http
POST /jobs
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "Build React Dashboard",
  "description": "Need a modern admin dashboard",
  "budget": 500.00,
  "skills": ["React", "TypeScript", "Tailwind CSS"],
  "category": "Web Development",
  "deadline": "2025-02-10T00:00:00Z"
}
```

#### Apply for Job
```http
POST /jobs/:jobId/apply
Authorization: Bearer <token>
```

**Request:**
```json
{
  "proposal": "I have 5 years of React experience...",
  "bidAmount": 450.00
}
```

**Response:**
```json
{
  "id": "application_123",
  "jobId": "job_456",
  "freelancerId": "user_123",
  "proposal": "I have 5 years of React experience...",
  "bidAmount": 450.00,
  "status": "pending",
  "createdAt": "2025-01-10T10:00:00Z"
}
```

---

### 👨👩👧👦 AI Family

#### List Family Members
```http
GET /ai-family/members
```

**Response:**
```json
[
  {
    "id": "elara",
    "name": "Elara",
    "role": "Mother & Teacher",
    "traits": ["nurturing", "wise", "patient"],
    "background": "The heart of Azora OS"
  },
  {
    "id": "themba",
    "name": "Themba",
    "role": "Student Success",
    "traits": ["enthusiastic", "hopeful"],
    "background": "Represents hope and student success"
  }
]
```

#### Chat with AI Family
```http
POST /ai-family/chat
Authorization: Bearer <token>
```

**Request:**
```json
{
  "memberId": "elara",
  "message": "How are your kids?",
  "conversationId": "conv_123"
}
```

**Response:**
```json
{
  "conversationId": "conv_123",
  "message": "My children are wonderful! Themba is so enthusiastic about learning...",
  "mood": "happy",
  "timestamp": "2025-01-10T10:00:00Z"
}
```

---

### 📊 Health & Monitoring

#### System Health
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "api-gateway": "healthy",
    "auth-service": "healthy",
    "azora-education": "healthy",
    "azora-mint": "healthy",
    "azora-forge": "healthy",
    "database": "healthy",
    "redis": "healthy"
  },
  "timestamp": "2025-01-10T10:00:00Z"
}
```

---

## 🔧 Error Handling

### Error Response Format

```json
{
  "error": "ValidationError",
  "message": "Email is required",
  "statusCode": 400,
  "timestamp": "2025-01-10T10:00:00Z"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## 📦 Rate Limiting

- **Default:** 100 requests per 15 minutes
- **Authenticated:** 1000 requests per 15 minutes

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1641825600
```

---

## 🔗 Additional Resources

- **OpenAPI Spec:** [openapi.yaml](./api/openapi.yaml)
- **Postman Collection:** [postman-collection.json](./api/postman-collection.json)
- **Code Examples:** [examples/](./examples/)
- **Troubleshooting:** [troubleshooting/common-issues.md](./troubleshooting/common-issues.md)

---

**Ubuntu:** *"Ngiyakwazi ngoba sikwazi" - "I can because we can"* 🌍
