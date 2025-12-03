# 🔌 Azora API Documentation
# Ubuntu Philosophy: "My security ensures our freedom"

## API Gateway
**Base URL**: `https://api.azora.world`

### Authentication
All API requests require authentication via JWT tokens:
```
Authorization: Bearer <jwt_token>
```

### Rate Limiting
- **Auth endpoints**: 5 requests per 15 minutes
- **API endpoints**: 100 requests per 15 minutes  
- **Payment endpoints**: 2 requests per minute

---

## 🔐 Authentication Service (`/api/auth`)

### POST /api/auth/login
Login user and return JWT tokens.

**Request:**
```json
{
  "email": "user@azora.world",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "id": "uuid",
    "email": "user@azora.world",
    "name": "Ubuntu User",
    "roles": ["user"],
    "permissions": ["read:profile"]
  }
}
```

### POST /api/auth/register
Register new user account.

**Request:**
```json
{
  "email": "newuser@azora.world",
  "password": "password123",
  "name": "New User"
}
```

### POST /api/auth/mfa/setup
Setup MFA for user account.

**Response:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "backupCodes": ["123456", "789012", "345678"]
}
```

### POST /api/auth/mfa/verify
Verify MFA code during login.

**Request:**
```json
{
  "sessionId": "session-uuid",
  "code": "123456"
}
```

---

## 💳 Payment Service (`/api/pay`)

### POST /api/pay/create-intent
Create payment intent for purchase.

**Request:**
```json
{
  "amount": 99.99,
  "currency": "usd",
  "metadata": {
    "productId": "prod-uuid"
  }
}
```

**Response:**
```json
{
  "clientSecret": "pi_123_secret_abc",
  "paymentIntentId": "pi_123"
}
```

### POST /api/pay/confirm
Confirm and process payment.

**Request:**
```json
{
  "paymentIntentId": "pi_123"
}
```

### GET /api/pay/history
Get payment history for authenticated user.

**Response:**
```json
{
  "payments": [
    {
      "id": "uuid",
      "amount": 99.99,
      "currency": "usd",
      "status": "completed",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## 📚 Education Service (`/api/education`)

### GET /api/education/courses
List available courses.

**Response:**
```json
{
  "courses": [
    {
      "id": "uuid",
      "title": "Ubuntu Philosophy 101",
      "description": "Learn the principles of Ubuntu",
      "price": 49.99,
      "duration": "4 weeks"
    }
  ]
}
```

### POST /api/education/enroll
Enroll in a course.

**Request:**
```json
{
  "courseId": "uuid"
}
```

---

## ⛓️ Blockchain Service (`/api/blockchain`)

### GET /api/blockchain/balance/:address
Get token balance for address.

**Response:**
```json
{
  "address": "0x...",
  "balance": "1000.5",
  "token": "AZORA"
}
```

### POST /api/blockchain/transfer
Transfer tokens to another address.

**Request:**
```json
{
  "to": "0x...",
  "amount": "100.0",
  "token": "AZORA"
}
```

---

## 🏛️ Constitutional AI (`/api/constitutional-ai`)

### POST /api/constitutional-ai/analyze
Analyze content against Ubuntu constitution.

**Request:**
```json
{
  "content": "This is community-focused content...",
  "context": "social_media_post"
}
```

**Response:**
```json
{
  "compliant": true,
  "score": 0.95,
  "principles": {
    "community": 0.98,
    "respect": 0.92,
    "collaboration": 0.94
  }
}
```

---

## 📊 Monitoring & Health

### GET /health
Service health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "stripe": "healthy"
  }
}
```

### GET /metrics
Prometheus metrics endpoint.

---

## 🔒 Security Headers
All responses include Ubuntu security headers:
```
X-Ubuntu-Philosophy: My security ensures our freedom
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

## 🚨 Error Responses

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "ubuntu": "My security ensures our freedom - Please authenticate first"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions",
  "required": "manage:users",
  "ubuntu": "My security ensures our freedom - Access denied"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "ubuntu": "My security ensures our freedom - Please respect rate limits",
  "retryAfter": 900
}
```

---

## 🧪 Testing

### Environment Variables
```bash
NODE_ENV=development
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=sk_test_...
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Test Scripts
```bash
# Run all tests
npm test

# Run API tests
npm run test:api

# Run integration tests
npm run test:integration
```

---

## 📝 SDK Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

class AzoraAPI {
  constructor(baseURL, apiKey) {
    this.client = axios.create({
      baseURL,
      headers: { Authorization: `Bearer ${apiKey}` }
    });
  }

  async login(email, password) {
    const response = await this.client.post('/api/auth/login', {
      email, password
    });
    return response.data;
  }

  async createPayment(amount, currency = 'usd') {
    const response = await this.client.post('/api/pay/create-intent', {
      amount, currency
    });
    return response.data;
  }
}
```

### Python
```python
import requests

class AzoraAPI:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.headers = {'Authorization': f'Bearer {api_key}'}
    
    def login(self, email, password):
        response = requests.post(
            f'{self.base_url}/api/auth/login',
            json={'email': email, 'password': password},
            headers=self.headers
        )
        return response.json()
```

---

## 🌍 Ubuntu Philosophy Integration

Every API response includes Ubuntu philosophy metadata to remind users of our shared values:
- "I can because we can" - Collective empowerment
- "My success enables your success" - Mutual growth  
- "My security ensures our freedom" - Community protection

---

*Last updated: 2025-12-03*

> NOTE: This API reference is authoritative for implemented endpoints, but some endpoints or parameters may be in-progress or use mock behavior (e.g., payment/funding or token minting). Please consult `docs/MASTER-TASKLIST-FOR-AGENTS.md` for outstanding tasks and production readiness criteria.
*Ubuntu: "I serve because we prosper together"*
