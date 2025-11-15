# Azora Classroom Service

## Overview
The Azora Classroom Service enables live virtual classrooms with video lectures, screen sharing, and interactive whiteboards. This service is part of the Azora OS educational platform and follows the Ubuntu philosophy of collaborative learning.

## Features
- **Live Video Lectures**: Real-time video conferencing for classes
- **Screen Sharing**: Share screens for presentations and demonstrations
- **Interactive Whiteboard**: Collaborative drawing and note-taking
- **Classroom Management**: Schedule, start, and end classroom sessions
- **Real-time Messaging**: Chat functionality during classes
- **Socket.IO Integration**: Real-time communication between participants
- **RESTful API**: Well-documented API endpoints for integration

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Classroom Management
- `POST /api/classrooms` - Create a new classroom
- `GET /api/classrooms` - Get all classrooms
- `GET /api/classrooms/:id` - Get classroom by ID
- `PUT /api/classrooms/:id` - Update classroom
- `DELETE /api/classrooms/:id` - Delete classroom

### Enrollment
- `POST /api/classrooms/:id/enroll` - Enroll user in classroom
- `GET /api/classrooms/:id/enrollments` - Get classroom enrollments

### Session Management
- `POST /api/classrooms/:id/start` - Start classroom session
- `POST /api/classrooms/:id/end` - End classroom session

### Messaging
- `POST /api/classrooms/:id/messages` - Send message in classroom
- `GET /api/classrooms/:id/messages` - Get classroom messages

### User & Course Classrooms
- `GET /api/users/:userId/classrooms` - Get classrooms for user
- `GET /api/courses/:courseId/classrooms` - Get classrooms for course

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
PORT=3006
SERVICE_NAME=azora-classroom
DATABASE_URL=postgresql://user:password@localhost:5432/azora
NODE_ENV=development
```

## Database Schema

The service uses the following models:

### Classroom Model
```prisma
model Classroom {
  id          String   @id @default(uuid())
  title       String
  description String?
  instructorId String
  courseId    String?
  startTime   DateTime
  endTime     DateTime
  maxStudents Int      @default(30)
  status      ClassroomStatus @default(SCHEDULED)
  recordingUrl String?
  whiteboardData Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### ClassroomSession Model
```prisma
model ClassroomSession {
  id          String   @id @default(uuid())
  classroomId String
  sessionId   String   @unique
  startTime   DateTime @default(now())
  endTime     DateTime?
  recordingUrl String?
  attendance  Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### ClassroomEnrollment Model
```prisma
model ClassroomEnrollment {
  id          String   @id @default(uuid())
  classroomId String
  userId      String
  status      EnrollmentStatus @default(ENROLLED)
  joinedAt    DateTime @default(now())
  leftAt      DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### ClassroomMessage Model
```prisma
model ClassroomMessage {
  id          String   @id @default(uuid())
  classroomId String
  userId      String
  message     String
  messageType MessageType @default(TEXT)
  createdAt   DateTime @default(now())
}
```

## Socket.IO Events

The service supports real-time communication through Socket.IO:

### Client Events
- `joinClassroom` - Join a classroom room
- `leaveClassroom` - Leave a classroom room

### Server Events
- `classroomStarted` - Classroom session started
- `classroomEnded` - Classroom session ended
- `newMessage` - New message in classroom

## Example Usage

### Creating a Classroom
```json
POST /api/classrooms
{
  "title": "Introduction to JavaScript",
  "description": "Learn the basics of JavaScript programming",
  "instructorId": "user_123",
  "courseId": "course_456",
  "startTime": "2023-12-01T10:00:00Z",
  "endTime": "2023-12-01T11:30:00Z",
  "maxStudents": 50
}
```

### Enrolling a User
```json
POST /api/classrooms/classroom_123/enroll
{
  "userId": "student_789"
}
```

### Starting a Classroom Session
```json
POST /api/classrooms/classroom_123/start
{
  "sessionId": "session_abc"
}
```

### Sending a Message
```json
POST /api/classrooms/classroom_123/messages
{
  "userId": "user_123",
  "message": "Hello everyone!",
  "messageType": "TEXT"
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