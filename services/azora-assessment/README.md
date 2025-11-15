# Azora Assessment Service

## Overview
The Azora Assessment Service is a comprehensive assessment and evaluation system that enables quiz creation, auto-grading, and performance analytics. This service is part of the Azora OS educational platform and follows the Ubuntu philosophy of collaborative learning.

## Features
- **Quiz Creation**: Create various types of assessments (quizzes, exams, assignments)
- **Auto-Grading**: Automatic grading of multiple-choice and true/false questions
- **Performance Analytics**: Detailed analytics on user performance and progress
- **Token Rewards**: Earn tokens for completing assessments successfully
- **RESTful API**: Well-documented API endpoints for integration

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Assessment Management
- `POST /api/assessments` - Create a new assessment
- `GET /api/assessments/:id` - Get assessment by ID
- `PUT /api/assessments/:id` - Update assessment
- `DELETE /api/assessments/:id` - Delete assessment

### Assessment Submission
- `POST /api/assessments/:id/submit` - Submit assessment answers
- `GET /api/assessments/:id/results` - Get assessment results

### User & Course Assessments
- `GET /api/users/:userId/assessments` - Get all assessments for a user
- `GET /api/courses/:courseId/assessments` - Get all assessments for a course

### Grading
- `POST /api/assessments/:id/grade` - Grade assessment manually

### Analytics
- `GET /api/analytics/user/:userId` - Get user assessment analytics

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start the service
npm start

# For development
npm run dev
```

## Environment Variables

Create a `.env` file with the following variables:

```env
PORT=3005
SERVICE_NAME=azora-assessment
DATABASE_URL=postgresql://user:password@localhost:5432/azora
NODE_ENV=development
```

## Database Schema

The service uses the following models from the main Prisma schema:

### Assessment Model
```prisma
model Assessment {
  id          String           @id @default(cuid())
  userId      String
  courseId    String?
  type        AssessmentType
  title       String
  questions   Json
  answers     Json?
  score       Float?
  maxScore    Float
  status      AssessmentStatus @default(NOT_STARTED)
  startedAt   DateTime?
  completedAt DateTime?
  createdAt   DateTime         @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("assessments")
}
```

## Question Types

The assessment service supports various question types:

1. **Multiple Choice**: Questions with predefined options
2. **True/False**: Boolean questions
3. **Text**: Open-ended questions requiring manual grading

## Example Assessment Structure

```json
{
  "userId": "user_123",
  "courseId": "course_456",
  "type": "QUIZ",
  "title": "Introduction to JavaScript",
  "questions": [
    {
      "type": "multiple-choice",
      "question": "What is the correct way to declare a variable in JavaScript?",
      "options": ["var", "let", "const", "All of the above"],
      "correctAnswer": 3,
      "points": 1
    },
    {
      "type": "true-false",
      "question": "JavaScript is a statically typed language.",
      "correctAnswer": false,
      "points": 1
    }
  ],
  "maxScore": 2
}
```

## Example Answer Submission

```json
{
  "userId": "user_123",
  "answers": [3, false]
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is proprietary to Azora ES (Pty) Ltd.

## Support

For support, please contact the Azora development team.