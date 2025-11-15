# Auth Service

Enterprise authentication with MFA, OAuth, and JWT token management.

## Purpose
- User registration and login
- JWT token generation/validation
- Multi-factor authentication (MFA)
- OAuth integration (Google, GitHub)
- Password reset and recovery
- Session management

## Setup
```bash
npm install
npm run prisma:generate
```

## Environment Variables
See `.env.example` for required configuration.

## Scripts
- `npm run dev` - Development server
- `npm run start` - Production server
- `npm run test` - Run tests
- `npm run typecheck` - TypeScript validation

## API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/mfa/enable` - Enable MFA

## Security
- Bcrypt password hashing
- JWT with RS256 signing
- Rate limiting on auth endpoints
- CSRF protection
