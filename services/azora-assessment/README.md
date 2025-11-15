# Azora Assessment

Intelligent testing and evaluation system with adaptive assessments.

## Purpose
- Assessment creation
- Adaptive testing
- Automated grading
- Performance analytics
- Certificate generation
- Skill validation

## Setup
```bash
npm install
```

## Environment Variables
See `.env.example` for required configuration.

## Scripts
- `npm run dev` - Development server
- `npm run start` - Production server
- `npm run test` - Run tests

## API Endpoints
- `POST /api/assessments` - Create assessment
- `GET /api/assessments/:id` - Get assessment
- `POST /api/assessments/:id/submit` - Submit answers
- `GET /api/results/:id` - Get results
- `POST /api/certificates/generate` - Generate certificate
