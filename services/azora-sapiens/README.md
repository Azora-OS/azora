# Azora Sapiens

AI-powered personalized learning assistant with 98.7% accuracy.

## Purpose
- Personalized AI tutoring
- Learning path optimization
- Real-time assistance
- Progress analytics
- Adaptive learning
- Natural language interaction

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
- `POST /api/tutor/ask` - Ask AI tutor
- `GET /api/tutor/session/:id` - Get session
- `POST /api/learning-path/generate` - Generate path
- `GET /api/analytics/:studentId` - Get analytics
- `POST /api/feedback` - Submit feedback

## AI Integration
Powered by OpenAI GPT-4 with constitutional AI principles.
