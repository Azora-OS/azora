# 🔐 LAYER 3: AUTHENTICATION FOUNDATION - INTEGRATION GUIDE

**Package:** `@azora/shared-auth`  
**Status:** ✅ Ready for Integration

---

## 📦 INSTALLATION

```bash
# In your service/app package.json
{
  "dependencies": {
    "@azora/shared-auth": "workspace:*",
    "@azora/shared-database": "workspace:*"
  }
}
```

---

## 🚀 QUICK START

### 1. Environment Variables

```bash
# Required
JWT_SECRET=your-secret-key-min-32-chars
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379

# Optional
JWT_ACCESS_TOKEN_EXPIRY=3600  # 1 hour
JWT_REFRESH_TOKEN_EXPIRY=604800  # 7 days
SESSION_TTL=604800000  # 7 days in ms
```

### 2. Basic Usage

```typescript
import { authenticateSession, requireRole } from '@azora/shared-auth/middleware';
import { authService } from '@azora/shared-auth/service';

// Login
const result = await authService.login(
  { email, password: '***' },
  { userId, role: 'USER' },
  { ipAddress, userAgent }
);

// Protected route
app.get('/api/protected', authenticateSession, (req, res) => {
  // req.user is available
  res.json({ user: req.user });
});

// Role-based route
app.get('/api/admin', authenticateSession, requireRole('ADMIN'), (req, res) => {
  // Only admins can access
});
```

---

## 📚 API REFERENCE

### JWT Service

```typescript
import { jwtService } from '@azora/shared-auth/jwt';

// Generate tokens
const tokenPair = jwtService.generateTokenPair({
  userId: '123',
  email: 'user@example.com',
  role: 'USER',
});

// Validate token
const validation = jwtService.validateToken(token);
if (validation.valid) {
  console.log(validation.payload);
}
```

### Session Service

```typescript
import { sessionService } from '@azora/shared-auth/session';

// Create session
const session = await sessionService.createSession({
  userId: '123',
  email: 'user@example.com',
  role: 'USER',
});

// Validate session
const validation = await sessionService.validateSession(sessionId);

// Delete session
await sessionService.deleteSession(sessionId);
```

### Authentication Service

```typescript
import { authService } from '@azora/shared-auth/service';

// Login
const result = await authService.login(credentials, userData, metadata);

// Logout
await authService.logout(sessionId);

// Refresh tokens
const refreshResult = await authService.refreshTokens(sessionId, refreshToken);
```

### Middleware

```typescript
import {
  authenticateJWT,
  authenticateSession,
  requireRole,
  optionalAuth,
} from '@azora/shared-auth/middleware';

// JWT-only authentication
app.use('/api', authenticateJWT);

// Session-based authentication (recommended)
app.use('/api', authenticateSession);

// Role-based authorization
app.get('/admin', authenticateSession, requireRole('ADMIN'));

// Optional authentication
app.get('/public', optionalAuth);
```

---

## 🔄 AUTHENTICATION FLOW

1. **Login:**
   - User provides credentials
   - Validate credentials
   - Create session via `authService.login()`
   - Return access + refresh tokens

2. **Protected Routes:**
   - Client sends access token in `Authorization: Bearer <token>`
   - Middleware validates token and session
   - Request proceeds with `req.user` attached

3. **Token Refresh:**
   - Client sends refresh token
   - `authService.refreshTokens()` generates new tokens
   - Client updates tokens

4. **Logout:**
   - Client calls logout endpoint
   - `authService.logout()` deletes session
   - Tokens become invalid

---

## 🛡️ SECURITY BEST PRACTICES

1. **Always use HTTPS in production**
2. **Set strong JWT_SECRET** (min 32 characters)
3. **Use session-based auth** (not just JWT) for better control
4. **Implement rate limiting** on auth endpoints
5. **Log authentication events** for security monitoring
6. **Set appropriate token expiry times**
7. **Validate IP/user-agent** on sensitive operations

---

## 📝 EXAMPLE INTEGRATION

See `packages/shared-auth/examples/integration-example.ts` for a complete Express.js integration example.

---

**"Authentication foundation ready. Fast. Secure. Production-ready."**
