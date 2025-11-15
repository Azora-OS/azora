# Azora Education

Comprehensive learning management with courses, enrollment, and progress tracking.

## Purpose
- Course catalog management
- Student enrollment
- Progress tracking
- Assessment and grading
- Certificate generation
- Learning analytics

## Setup
```bash
npm install
npm run prisma:generate
```

## Environment Variables
See `.env.example` for required configuration.

## Scripts
- `npm run dev` - Development server
- `npm run build` - Build TypeScript
- `npm run start` - Production server
- `npm run test` - Run tests
- `npm run typecheck` - TypeScript validation

## API Endpoints
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create course (instructor)
- `POST /api/courses/:id/enroll` - Enroll in course
- `GET /api/progress/:studentId` - Get student progress
- `POST /api/assessments/:id/submit` - Submit assessment
- `GET /api/certificates/:id` - Get certificate

## Database
PostgreSQL with Prisma ORM for course and enrollment data.
