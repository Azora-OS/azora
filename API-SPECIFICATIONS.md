# 🔌 Azora Platform - Complete API Specifications

## Base Configuration

```
Base URL: https://api.azora.world/v1
Authentication: Bearer Token (JWT)
Content-Type: application/json
Rate Limit: 1000 requests/hour per user
```

---

## 📚 Core API Endpoints

### 1. Authentication Endpoints

#### Register User
```
POST /auth/register
Content-Type: application/json

Request:
{
  "email": "user@azora.world",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT"
}

Response (201):
{
  "id": "user_123",
  "email": "user@azora.world",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT",
  "createdAt": "2025-01-15T10:30:00Z",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "user@azora.world",
  "password": "SecurePassword123!"
}

Response (200):
{
  "id": "user_123",
  "email": "user@azora.world",
  "role": "STUDENT",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}
```

#### Refresh Token
```
POST /auth/refresh-token
Content-Type: application/json

Request:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}
```

#### Logout
```
POST /auth/logout
Authorization: Bearer {token}

Response (200):
{
  "message": "Logged out successfully"
}
```

---

### 2. User Endpoints

#### Get User Profile
```
GET /users/:id
Authorization: Bearer {token}

Response (200):
{
  "id": "user_123",
  "email": "user@azora.world",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT",
  "profile": {
    "bio": "Passionate learner",
    "avatar": "https://cdn.azora.world/avatars/user_123.jpg",
    "location": "Johannesburg, South Africa",
    "timezone": "Africa/Johannesburg"
  },
  "stats": {
    "coursesEnrolled": 5,
    "coursesCompleted": 2,
    "tokensEarned": 1500,
    "joinedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Update User Profile
```
PUT /users/:id
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio",
  "timezone": "Africa/Johannesburg"
}

Response (200):
{
  "id": "user_123",
  "email": "user@azora.world",
  "firstName": "John",
  "lastName": "Doe",
  "profile": {
    "bio": "Updated bio",
    "timezone": "Africa/Johannesburg"
  },
  "updatedAt": "2025-01-15T11:00:00Z"
}
```

#### Upload Avatar
```
POST /users/:id/avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data

Request:
{
  "file": <image_file>
}

Response (200):
{
  "url": "https://cdn.azora.world/avatars/user_123.jpg",
  "uploadedAt": "2025-01-15T11:00:00Z"
}
```

---

### 3. Course Endpoints

#### List Courses
```
GET /courses?category=Computer%20Science&level=BEGINNER&page=1&limit=20
Authorization: Bearer {token}

Response (200):
{
  "data": [
    {
      "id": "cs101",
      "title": "Introduction to Computer Science",
      "description": "Comprehensive introduction to programming...",
      "category": "Computer Science",
      "level": "BEGINNER",
      "duration": 720,
      "price": 299,
      "currency": "ZAR",
      "rating": 4.8,
      "enrollmentCount": 1250,
      "instructor": {
        "id": "user_educator_001",
        "name": "Dr. Sarah Lee"
      },
      "thumbnail": "https://cdn.azora.world/courses/cs101.jpg"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### Get Course Details
```
GET /courses/:id
Authorization: Bearer {token}

Response (200):
{
  "id": "cs101",
  "title": "Introduction to Computer Science",
  "description": "Comprehensive introduction to programming...",
  "category": "Computer Science",
  "level": "BEGINNER",
  "duration": 720,
  "price": 299,
  "currency": "ZAR",
  "rating": 4.8,
  "enrollmentCount": 1250,
  "instructor": {
    "id": "user_educator_001",
    "name": "Dr. Sarah Lee",
    "bio": "Computer Science PhD with 10+ years teaching experience"
  },
  "modules": [
    {
      "id": "cs101-m1",
      "title": "Programming Fundamentals",
      "order": 1,
      "lessons": [
        {
          "id": "lesson_1",
          "title": "Variables and Data Types",
          "duration": 45,
          "type": "video"
        }
      ]
    }
  ],
  "reviews": [
    {
      "id": "review_1",
      "userId": "user_123",
      "userName": "John Doe",
      "rating": 5,
      "comment": "Excellent course!",
      "createdAt": "2025-01-10T10:30:00Z"
    }
  ],
  "skills": ["Programming", "Problem Solving", "Algorithm Design"]
}
```

#### Create Course (Educator)
```
POST /courses
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "title": "Advanced Python Programming",
  "description": "Master advanced Python concepts...",
  "category": "Computer Science",
  "level": "ADVANCED",
  "duration": 900,
  "price": 599,
  "currency": "ZAR"
}

Response (201):
{
  "id": "py301",
  "title": "Advanced Python Programming",
  "status": "DRAFT",
  "createdAt": "2025-01-15T11:00:00Z"
}
```

#### Update Course (Educator)
```
PUT /courses/:id
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "title": "Advanced Python Programming",
  "description": "Updated description...",
  "price": 649
}

Response (200):
{
  "id": "py301",
  "title": "Advanced Python Programming",
  "price": 649,
  "updatedAt": "2025-01-15T11:30:00Z"
}
```

#### Publish Course (Educator)
```
PUT /courses/:id/publish
Authorization: Bearer {token}

Response (200):
{
  "id": "py301",
  "status": "PUBLISHED",
  "publishedAt": "2025-01-15T11:30:00Z"
}
```

#### Add Course Review
```
POST /courses/:id/reviews
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "rating": 5,
  "comment": "Excellent course! Highly recommended."
}

Response (201):
{
  "id": "review_123",
  "courseId": "cs101",
  "userId": "user_123",
  "rating": 5,
  "comment": "Excellent course! Highly recommended.",
  "createdAt": "2025-01-15T11:30:00Z"
}
```

---

### 4. Enrollment Endpoints

#### Enroll in Course
```
POST /enrollments
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "courseId": "cs101"
}

Response (201):
{
  "id": "enrollment_123",
  "userId": "user_123",
  "courseId": "cs101",
  "status": "ACTIVE",
  "progress": 0,
  "enrolledAt": "2025-01-15T11:30:00Z"
}
```

#### Get Enrollment Details
```
GET /enrollments/:id
Authorization: Bearer {token}

Response (200):
{
  "id": "enrollment_123",
  "userId": "user_123",
  "courseId": "cs101",
  "courseName": "Introduction to Computer Science",
  "status": "ACTIVE",
  "progress": 35,
  "enrolledAt": "2025-01-15T11:30:00Z",
  "completedAt": null,
  "lessons": [
    {
      "id": "lesson_1",
      "title": "Variables and Data Types",
      "completed": true,
      "completedAt": "2025-01-15T12:00:00Z"
    }
  ]
}
```

#### Get User Enrollments
```
GET /users/:id/enrollments
Authorization: Bearer {token}

Response (200):
{
  "data": [
    {
      "id": "enrollment_123",
      "courseId": "cs101",
      "courseName": "Introduction to Computer Science",
      "status": "ACTIVE",
      "progress": 35,
      "enrolledAt": "2025-01-15T11:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

#### Update Lesson Progress
```
PUT /enrollments/:id/lessons/:lessonId
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "completed": true,
  "timeSpent": 45
}

Response (200):
{
  "lessonId": "lesson_1",
  "completed": true,
  "completedAt": "2025-01-15T12:00:00Z",
  "timeSpent": 45
}
```

#### Complete Course
```
POST /enrollments/:id/complete
Authorization: Bearer {token}

Response (200):
{
  "id": "enrollment_123",
  "status": "COMPLETED",
  "completedAt": "2025-01-15T15:00:00Z",
  "certificate": {
    "id": "cert_123",
    "url": "https://cdn.azora.world/certificates/cert_123.pdf",
    "verificationHash": "abc123def456..."
  }
}
```

---

### 5. Payment Endpoints

#### Create Payment
```
POST /payments
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "courseId": "cs101",
  "amount": 299,
  "currency": "ZAR",
  "paymentMethodId": "pm_1234567890"
}

Response (201):
{
  "id": "payment_123",
  "userId": "user_123",
  "courseId": "cs101",
  "amount": 299,
  "currency": "ZAR",
  "status": "PENDING",
  "stripePaymentIntentId": "pi_1234567890",
  "createdAt": "2025-01-15T12:00:00Z"
}
```

#### Get Payment Status
```
GET /payments/:id
Authorization: Bearer {token}

Response (200):
{
  "id": "payment_123",
  "userId": "user_123",
  "courseId": "cs101",
  "amount": 299,
  "currency": "ZAR",
  "status": "COMPLETED",
  "receipt": {
    "id": "receipt_123",
    "invoiceNumber": "INV-2025-001",
    "url": "https://cdn.azora.world/receipts/receipt_123.pdf"
  },
  "completedAt": "2025-01-15T12:05:00Z"
}
```

#### Refund Payment
```
POST /payments/:id/refund
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "reason": "Course not suitable"
}

Response (200):
{
  "id": "refund_123",
  "paymentId": "payment_123",
  "amount": 299,
  "currency": "ZAR",
  "status": "PENDING",
  "reason": "Course not suitable",
  "createdAt": "2025-01-15T12:10:00Z"
}
```

#### Get Payment History
```
GET /users/:id/payments
Authorization: Bearer {token}

Response (200):
{
  "data": [
    {
      "id": "payment_123",
      "courseId": "cs101",
      "courseName": "Introduction to Computer Science",
      "amount": 299,
      "currency": "ZAR",
      "status": "COMPLETED",
      "createdAt": "2025-01-15T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3
  }
}
```

---

### 6. Token Endpoints

#### Get Token Balance
```
GET /tokens/balance
Authorization: Bearer {token}

Response (200):
{
  "userId": "user_123",
  "balance": 1500.50,
  "currency": "AZR",
  "lastUpdated": "2025-01-15T12:00:00Z"
}
```

#### Get Token Transactions
```
GET /tokens/transactions?type=EARN&limit=20
Authorization: Bearer {token}

Response (200):
{
  "data": [
    {
      "id": "tx_123",
      "amount": 100,
      "type": "EARN",
      "reason": "Course Completion: CS101",
      "balanceAfter": 1500.50,
      "createdAt": "2025-01-15T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

#### Redeem Tokens
```
POST /tokens/redeem
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "amount": 100,
  "type": "FEATURE_UNLOCK",
  "featureId": "advanced_analytics"
}

Response (201):
{
  "id": "redemption_123",
  "userId": "user_123",
  "amount": 100,
  "type": "FEATURE_UNLOCK",
  "status": "COMPLETED",
  "balanceAfter": 1400.50,
  "createdAt": "2025-01-15T12:00:00Z"
}
```

#### Get Leaderboard
```
GET /tokens/leaderboard?type=GLOBAL&period=monthly&limit=100
Authorization: Bearer {token}

Response (200):
{
  "data": [
    {
      "rank": 1,
      "userId": "user_456",
      "userName": "Alice Johnson",
      "score": 5000,
      "tokensEarned": 2500
    },
    {
      "rank": 2,
      "userId": "user_123",
      "userName": "John Doe",
      "score": 4500,
      "tokensEarned": 1500
    }
  ],
  "period": "monthly",
  "type": "GLOBAL"
}
```

---

### 7. Subscription Endpoints

#### Get Subscription Tiers
```
GET /subscription-tiers
Authorization: Bearer {token}

Response (200):
{
  "data": [
    {
      "id": "tier_free",
      "tier": "FREE",
      "name": "Free Tier",
      "monthlyPrice": 0,
      "annualPrice": 0,
      "features": [
        "Access to free courses",
        "Basic learning tools",
        "Community support"
      ],
      "courseLimit": 5,
      "tokenMonthly": 0
    },
    {
      "id": "tier_pro",
      "tier": "PRO",
      "name": "Pro Tier",
      "monthlyPrice": 9900,
      "annualPrice": 99000,
      "features": [
        "Access to all courses",
        "Advanced learning tools",
        "Priority support",
        "100 AZR tokens monthly"
      ],
      "courseLimit": null,
      "tokenMonthly": 100
    }
  ]
}
```

#### Create Subscription
```
POST /subscriptions
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "tier": "PRO",
  "billingCycle": "monthly",
  "paymentMethodId": "pm_1234567890"
}

Response (201):
{
  "id": "subscription_123",
  "userId": "user_123",
  "tier": "PRO",
  "status": "ACTIVE",
  "currentPeriodStart": "2025-01-15T12:00:00Z",
  "currentPeriodEnd": "2025-02-15T12:00:00Z",
  "renewalDate": "2025-02-15T12:00:00Z",
  "createdAt": "2025-01-15T12:00:00Z"
}
```

#### Cancel Subscription
```
DELETE /subscriptions/:id
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "reason": "Too expensive"
}

Response (200):
{
  "id": "subscription_123",
  "status": "CANCELLED",
  "cancelledAt": "2025-01-15T12:00:00Z",
  "cancelReason": "Too expensive"
}
```

---

### 8. Job Endpoints

#### List Jobs
```
GET /jobs?category=Technology&location=Remote&page=1&limit=20
Authorization: Bearer {token}

Response (200):
{
  "data": [
    {
      "id": "job_001",
      "title": "Junior Python Developer",
      "company": "Tech Startup Inc",
      "location": "Johannesburg, South Africa",
      "remote": true,
      "salary": 25000,
      "currency": "ZAR",
      "status": "ACTIVE",
      "skills": ["Python", "SQL"],
      "matchScore": 0.85
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

#### Get Job Details
```
GET /jobs/:id
Authorization: Bearer {token}

Response (200):
{
  "id": "job_001",
  "title": "Junior Python Developer",
  "description": "Looking for a junior developer with Python experience...",
  "company": "Tech Startup Inc",
  "location": "Johannesburg, South Africa",
  "remote": true,
  "salary": 25000,
  "currency": "ZAR",
  "status": "ACTIVE",
  "skills": ["Python", "SQL"],
  "requirements": ["2+ years experience", "Strong problem solving"],
  "postedAt": "2025-01-10T10:00:00Z",
  "expiresAt": "2025-02-10T10:00:00Z"
}
```

#### Apply for Job
```
POST /jobs/:id/apply
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "coverLetter": "I am very interested in this position...",
  "resumeUrl": "https://cdn.azora.world/resumes/user_123.pdf"
}

Response (201):
{
  "id": "application_123",
  "jobId": "job_001",
  "userId": "user_123",
  "status": "PENDING",
  "matchScore": 0.85,
  "appliedAt": "2025-01-15T12:00:00Z"
}
```

#### Get Job Recommendations
```
GET /jobs/recommendations
Authorization: Bearer {token}

Response (200):
{
  "data": [
    {
      "id": "job_001",
      "title": "Junior Python Developer",
      "company": "Tech Startup Inc",
      "matchScore": 0.92,
      "matchReasons": [
        "You have Python skills",
        "You completed CS101 course",
        "Your location matches"
      ]
    }
  ]
}
```

---

### 9. Chat Endpoints

#### Create Chat Session
```
POST /chat/sessions
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "aiPersona": "ELARA",
  "title": "Python Programming Help"
}

Response (201):
{
  "id": "session_123",
  "userId": "user_123",
  "aiPersona": "ELARA",
  "title": "Python Programming Help",
  "createdAt": "2025-01-15T12:00:00Z"
}
```

#### Send Message
```
POST /chat/sessions/:id/messages
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "content": "How do I use list comprehensions in Python?"
}

Response (201):
{
  "id": "message_123",
  "sessionId": "session_123",
  "role": "user",
  "content": "How do I use list comprehensions in Python?",
  "createdAt": "2025-01-15T12:00:00Z"
}
```

#### Get Chat Messages
```
GET /chat/sessions/:id/messages
Authorization: Bearer {token}

Response (200):
{
  "data": [
    {
      "id": "message_123",
      "role": "user",
      "content": "How do I use list comprehensions in Python?",
      "createdAt": "2025-01-15T12:00:00Z"
    },
    {
      "id": "message_124",
      "role": "assistant",
      "content": "List comprehensions are a concise way to create lists...",
      "createdAt": "2025-01-15T12:00:05Z"
    }
  ]
}
```

---

### 10. Notification Endpoints

#### Get Notifications
```
GET /notifications?read=false&limit=20
Authorization: Bearer {token}

Response (200):
{
  "data": [
    {
      "id": "notif_123",
      "type": "COURSE_UPDATE",
      "title": "Course Updated",
      "message": "The course 'Introduction to Computer Science' has been updated",
      "read": false,
      "createdAt": "2025-01-15T12:00:00Z"
    }
  ],
  "unreadCount": 5
}
```

#### Mark Notification as Read
```
PUT /notifications/:id/read
Authorization: Bearer {token}

Response (200):
{
  "id": "notif_123",
  "read": true,
  "readAt": "2025-01-15T12:00:00Z"
}
```

#### Update Notification Preferences
```
PUT /notifications/preferences
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "emailNotifications": true,
  "pushNotifications": true,
  "courseUpdates": true,
  "paymentNotifications": true,
  "tokenRewards": true
}

Response (200):
{
  "preferences": {
    "emailNotifications": true,
    "pushNotifications": true,
    "courseUpdates": true,
    "paymentNotifications": true,
    "tokenRewards": true
  },
  "updatedAt": "2025-01-15T12:00:00Z"
}
```

---

## 🔐 Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is invalid",
    "details": {
      "field": "email",
      "issue": "Email is already registered"
    },
    "timestamp": "2025-01-15T12:00:00Z",
    "requestId": "req_123456"
  }
}
```

### Common Error Codes
- `INVALID_REQUEST` (400): Invalid request parameters
- `UNAUTHORIZED` (401): Missing or invalid authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource already exists
- `RATE_LIMITED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

---

## 📊 Pagination

All list endpoints support pagination:
```
GET /courses?page=1&limit=20&sort=createdAt&order=desc

Response:
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 🔄 Webhooks

### Webhook Events
- `payment.completed`
- `payment.failed`
- `course.published`
- `enrollment.completed`
- `token.earned`
- `subscription.renewed`

### Webhook Payload
```json
{
  "id": "webhook_123",
  "event": "payment.completed",
  "timestamp": "2025-01-15T12:00:00Z",
  "data": {
    "paymentId": "payment_123",
    "userId": "user_123",
    "amount": 299,
    "currency": "ZAR"
  }
}
```

---

**Last Updated**: 2025
**API Version**: v1
**Status**: Production Ready
