# 🔐 Auth Service

**Version**: 1.0.0  
**Port**: 4001  
**Status**: ✅ Production Ready

## Overview

Authentication service providing user registration, login, JWT token management, and profile operations for Azora OS.

## Features

- ✅ User registration with email/password
- ✅ Secure login with JWT tokens
- ✅ Password hashing (bcrypt, 12 rounds)
- ✅ Profile management (get/update)
- ✅ Role-based access control
- ✅ Rate limiting (100 req/15min)
- ✅ Security headers (Helmet)

## API Endpoints

### Public Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /health` - Health check

### Protected Endpoints (Require JWT)
- `GET /api/auth/profile` - Get user profile
- `PATCH /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - Logout user

## Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@host:5432/azora
JWT_SECRET=your-secret-min-32-characters
PORT=4001
NODE_ENV=production
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## Testing

```bash
npm test
```

**Test Coverage**: 83.33% (8/8 tests passing)

## Dependencies

- express - Web framework
- bcryptjs - Password hashing
- jsonwebtoken - JWT tokens
- @prisma/client - Database ORM
- helmet - Security headers
- express-rate-limit - Rate limiting

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens expire after 7 days
- Rate limiting: 100 requests per 15 minutes
- Security headers via Helmet
- Input validation on all endpoints

## Deployment

See `/production/DEPLOYMENT-GUIDE.md` for deployment instructions.

## License

Proprietary - Azora ES (Pty) Ltd
