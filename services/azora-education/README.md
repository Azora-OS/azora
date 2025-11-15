# Azora Education Service

## Overview
The Azora Education Service provides comprehensive course management, student enrollment, and learning progress tracking capabilities. This service is part of the Azora OS educational platform and follows the Ubuntu philosophy of collaborative learning.

## Features
- **Course Management**: Create, update, and manage courses with modules
- **Student Registration**: Register and manage student profiles
- **Enrollment System**: Enroll students in courses with progress tracking
- **Learning Progress**: Track student progress through course modules
- **Assessment Management**: Create and manage assessments with submissions
- **Wallet System**: Student wallet management with transactions
- **RESTful API**: Well-documented API endpoints for integration

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Courses
- `POST /api/courses` - Create a new course
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Course Modules
- `POST /api/courses/:id/modules` - Add module to course
- `GET /api/courses/:id/modules` - Get course modules
- `PUT /api/modules/:id` - Update module
- `DELETE /api/modules/:id` - Delete module

### Students
- `POST /api/students` - Register a new student
- `GET /api/students/:id` - Get student profile
- `PUT /api/students/:id` - Update student profile

### Enrollments
- `POST /api/enrollments` - Enroll student in course
- `GET /api/enrollments` - Get all enrollments
- `GET /api/enrollments/:id` - Get enrollment by ID
- `PUT /api/enrollments/:id/progress` - Update enrollment progress
- `DELETE /api/enrollments/:id` - Drop enrollment

### Learning Progress
- `POST /api/progress` - Update learning progress
- `GET /api/progress/:studentId/:moduleId` - Get progress for student and module

### Student & Course Relationships
- `GET /api/students/:studentId/courses` - Get courses for student
- `GET /api/courses/:courseId/students` - Get students in course

### Assessments
- `POST /api/assessments` - Create assessment
- `POST /api/assessments/:id/submissions` - Submit assessment
- `GET /api/assessments/:id/submissions/:studentId` - Get assessment submission

### Wallets
- `POST /api/wallets` - Create wallet for student
- `GET /api/wallets/:studentId` - Get wallet for student

### Transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:walletId` - Get transactions for wallet

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
PORT=3010
SERVICE_NAME=azora-education
DATABASE_URL=postgresql://user:password@localhost:5432/azora
NODE_ENV=development
```

## Database Schema

The service uses the following models:

### Student Model
```prisma
model Student {
  id            String   @id @default(cuid())
  userId        String   @unique
  firstName     String
  lastName      String
  email         String   @unique
  dateOfBirth   DateTime?
  grade         String?
  country       String   @default("ZA")
  
  enrollments   Enrollment[]
  assessments   AssessmentSubmission[]
  progress      LearningProgress[]
  wallet        Wallet?
}
```

### Course Model
```prisma
model Course {
  id            String   @id @default(cuid())
  title         String
  description   String
  instructorId  String
  price         Float    @default(0)
  currency      String   @default("AZR")
  duration      Int      // in hours
  level         String   // beginner, intermediate, advanced
  category      String
  
  modules       Module[]
  enrollments   Enrollment[]
  
  published     Boolean  @default(false)
}
```

### Module Model
```prisma
model Module {
  id            String   @id @default(cuid())
  courseId      String
  course        Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  title         String
  description   String?
  order         Int
  content       Json     // lessons, videos, materials
  
  progress      LearningProgress[]
}
```

### Enrollment Model
```prisma
model Enrollment {
  id            String   @id @default(cuid())
  studentId     String
  student       Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  courseId      String
  course        Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  status        String   @default("active") // active, completed, dropped
  progress      Float    @default(0) // 0-100
  
  enrolledAt    DateTime @default(now())
  completedAt   DateTime?
}
```

### LearningProgress Model
```prisma
model LearningProgress {
  id            String   @id @default(cuid())
  studentId     String
  student       Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  moduleId      String
  module        Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  
  completed     Boolean  @default(false)
  timeSpent     Int      @default(0) // in minutes
  score         Float?   // 0-100
  
  startedAt     DateTime @default(now())
  completedAt   DateTime?
}
```

### AssessmentSubmission Model
```prisma
model AssessmentSubmission {
  id            String   @id @default(cuid())
  studentId     String
  student       Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  assessmentId  String
  
  answers       Json
  score         Float
  passed        Boolean
  feedback      String?
  
  submittedAt   DateTime @default(now())
}
```

### Wallet Model
```prisma
model Wallet {
  id            String   @id @default(cuid())
  studentId     String   @unique
  student       Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  balance       Float    @default(0)
  currency      String   @default("AZR")
  
  transactions  Transaction[]
}
```

### Transaction Model
```prisma
model Transaction {
  id            String   @id @default(cuid())
  walletId      String
  wallet        Wallet   @relation(fields: [walletId], references: [id], onDelete: Cascade)
  
  type          String   // payment, earning, refund
  amount        Float
  currency      String   @default("AZR")
  description   String
  reference     String?  // courseId, jobId, etc
  
  status        String   @default("completed")
  
  createdAt     DateTime @default(now())
}
```

## Example Usage

### Creating a Course
```json
POST /api/courses
{
  "title": "Introduction to JavaScript",
  "description": "Learn the fundamentals of JavaScript programming",
  "instructorId": "user_123",
  "price": 0,
  "level": "beginner",
  "category": "programming",
  "published": true
}
```

### Adding a Module to Course
```json
POST /api/courses/course_123/modules
{
  "title": "Variables and Data Types",
  "description": "Understanding JavaScript variables and data types",
  "order": 1,
  "content": {
    "lessons": [
      {
        "title": "Variables",
        "type": "video",
        "url": "https://example.com/variables.mp4"
      },
      {
        "title": "Data Types",
        "type": "article",
        "content": "JavaScript has several data types..."
      }
    ]
  }
}
```

### Registering a Student
```json
POST /api/students
{
  "userId": "user_456",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "country": "ZA"
}
```

### Enrolling a Student in a Course
```json
POST /api/enrollments
{
  "studentId": "student_456",
  "courseId": "course_123"
}
```

### Updating Learning Progress
```json
POST /api/progress
{
  "studentId": "student_456",
  "moduleId": "module_789",
  "completed": true,
  "timeSpent": 45,
  "score": 85.5
}
```

### Creating a Wallet for Student
```json
POST /api/wallets
{
  "studentId": "student_456",
  "balance": 100,
  "currency": "AZR"
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