# Azora Corporate Learning Service

The Azora Corporate Learning Service manages enterprise training programs, employee enrollments, and learning progress tracking.

## Features

- Training course management
- Employee enrollment processing
- Learning progress tracking
- Health monitoring

## Endpoints

- `GET /health` - Service health check
- `GET /api/courses` - Get training courses
- `POST /api/enrollments` - Enroll employee in course
- `GET /api/progress/:employeeId` - Get employee learning progress

## Environment Variables

- `PORT` - Service port (default: 3021)

## Getting Started

1. Install dependencies: `npm install`
2. Start the service: `npm start`
3. Check health: `npm run health`