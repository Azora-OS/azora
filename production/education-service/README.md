# 🎓 Education Service

**Version**: 1.0.0  
**Port**: 4002  
**Status**: ✅ Production Ready

## Overview

Education service managing courses, enrollments, and student progress tracking for Azora OS learning platform.

## Features

- ✅ Course listing and details
- ✅ Course enrollment system
- ✅ Progress tracking (0-100%)
- ✅ Auto-completion at 100%
- ✅ Educator course creation
- ✅ Module management
- ✅ Rate limiting (200 req/15min)

## API Endpoints

### Public Endpoints
- `GET /api/courses` - List all published courses
- `GET /api/courses/:id` - Get course details
- `GET /health` - Health check

### Protected Endpoints (Require JWT)
- `POST /api/courses/:id/enroll` - Enroll in course
- `GET /api/enrollments` - List user enrollments
- `PATCH /api/enrollments/:id/progress` - Update progress
- `POST /api/courses` - Create course (educators only)

## Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@host:5432/azora
JWT_SECRET=your-secret-min-32-characters
PORT=4002
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

**Test Coverage**: 76.05% (8/8 tests passing)

## Dependencies

- express - Web framework
- @prisma/client - Database ORM
- jsonwebtoken - JWT verification
- helmet - Security headers
- express-rate-limit - Rate limiting

## Database Schema

### Course
- id, title, description, instructor
- duration, level, status
- price, currency

### Enrollment
- id, userId, courseId
- progress (0-100)
- status, enrolledAt, completedAt

## Business Logic

- Students can enroll in published courses
- Progress tracked from 0-100%
- Auto-completion when progress reaches 100%
- Educators can create and manage courses

## Deployment

See `/production/DEPLOYMENT-GUIDE.md` for deployment instructions.

## License

Proprietary - Azora ES (Pty) Ltd
