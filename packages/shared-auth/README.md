# @azora/shared-auth

Enterprise-grade authentication and authorization middleware for Azora OS services.

## Installation

```bash
npm install @azora/shared-auth
```

## Usage

### Authentication Middleware

```javascript
const { authenticateToken } = require('@azora/shared-auth');

// Protect routes
app.get('/api/profile', authenticateToken, (req, res) => {
  // req.user contains decoded JWT payload
  res.json({ user: req.user });
});
```

### Role-Based Access Control

```javascript
const { authenticateToken, requireRole } = require('@azora/shared-auth');

// Only admins can access
app.delete('/api/users/:id', 
  authenticateToken, 
  requireRole('admin'), 
  deleteUser
);

// Multiple roles allowed
app.get('/api/courses', 
  authenticateToken, 
  requireRole('student', 'educator', 'admin'), 
  getCourses
);
```

### Permission-Based Access Control

```javascript
const { authenticateToken, requirePermission } = require('@azora/shared-auth');

app.post('/api/courses', 
  authenticateToken, 
  requirePermission('course:create'), 
  createCourse
);
```

### Rate Limiting

```javascript
const { rateLimiter } = require('@azora/shared-auth');

// Default: 100 requests per 15 minutes
app.use('/api/', rateLimiter());

// Custom limits
app.use('/api/auth/login', rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts'
}));
```

### Request Validation

```javascript
const { validateRequest } = require('@azora/shared-auth');
const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

app.post('/api/auth/login', 
  validateRequest(loginSchema), 
  login
);
```

## Permissions by Role

### Admin
- `user:*`, `payment:*`, `course:*`, `system:admin`

### Educator
- `course:create`, `course:read`, `course:update`
- `user:read`, `payment:read`

### Student
- `course:read`, `user:read`, `payment:create`

### Employer
- `job:*`, `user:read`

## Environment Variables

```bash
JWT_SECRET=your-secret-key
```

## Ubuntu Philosophy

*"My security ensures our freedom"*

This package embodies the Ubuntu principle by providing collective security through shared authentication infrastructure.
