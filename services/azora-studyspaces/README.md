# Azora Study Spaces Service

## Overview
The Azora Study Spaces Service provides virtual study rooms and collaborative spaces for students to work together on academic projects, share resources, and track progress. This service is part of the Azora OS educational platform and follows the Ubuntu philosophy of collaborative learning.

## Features
- **Study Space Management**: Create and manage virtual study rooms
- **Member Management**: Add and manage study space members with roles
- **Study Sessions**: Schedule and conduct virtual study sessions with real-time communication
- **Resource Sharing**: Upload and share study resources within spaces
- **Task Management**: Create and assign tasks with due dates and priorities
- **Messaging System**: Real-time messaging within study spaces
- **Progress Tracking**: Track individual and group study progress
- **Socket.IO Integration**: Real-time communication between participants
- **RESTful API**: Well-documented API endpoints for integration

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Study Spaces
- `POST /api/spaces` - Create a new study space
- `GET /api/spaces` - Get all study spaces
- `GET /api/spaces/:id` - Get study space by ID
- `PUT /api/spaces/:id` - Update study space
- `DELETE /api/spaces/:id` - Delete study space

### Study Space Members
- `POST /api/spaces/:id/members` - Add member to study space
- `GET /api/spaces/:id/members` - Get study space members
- `DELETE /api/spaces/:id/members/:userId` - Remove member from study space

### Study Sessions
- `POST /api/spaces/:id/sessions` - Create study session
- `GET /api/spaces/:id/sessions` - Get study space sessions
- `GET /api/sessions/:id` - Get session by ID
- `PUT /api/sessions/:id` - Update session
- `PUT /api/sessions/:id/start` - Start session
- `PUT /api/sessions/:id/end` - End session

### Session Participants
- `POST /api/sessions/:id/participants` - Add participant to session
- `GET /api/sessions/:id/participants` - Get session participants

### Study Resources
- `POST /api/spaces/:id/resources` - Upload resource to study space
- `GET /api/spaces/:id/resources` - Get study space resources
- `GET /api/resources/:id` - Get resource by ID
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource

### Study Tasks
- `POST /api/spaces/:id/tasks` - Create task in study space
- `GET /api/spaces/:id/tasks` - Get study space tasks
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `PUT /api/tasks/:id/complete` - Mark task as complete

### Messaging
- `POST /api/spaces/:id/messages` - Send message in study space
- `GET /api/spaces/:id/messages` - Get study space messages

### Progress Tracking
- `POST /api/spaces/:id/progress` - Update study progress
- `GET /api/spaces/:id/progress/:userId` - Get user progress in study space

### User-Specific Endpoints
- `GET /api/users/:userId/spaces` - Get study spaces for user
- `GET /api/users/:userId/sessions` - Get sessions for user

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
PORT=3009
SERVICE_NAME=azora-studyspaces
DATABASE_URL=postgresql://user:password@localhost:5432/azora
NODE_ENV=development
```

## Database Schema

The service uses the following models:

### StudySpace Model
```prisma
model StudySpace {
  id          String   @id @default(uuid())
  name        String
  description String?
  ownerId     String
  courseId    String?
  maxMembers  Int      @default(10)
  privacy     PrivacyLevel @default(PUBLIC)
  status      SpaceStatus @default(ACTIVE)
  tags        String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### StudySpaceMember Model
```prisma
model StudySpaceMember {
  id          String   @id @default(uuid())
  spaceId     String
  userId      String
  role        MemberRole @default(MEMBER)
  joinedAt    DateTime @default(now())
  leftAt      DateTime?
  status      MembershipStatus @default(ACTIVE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### StudySession Model
```prisma
model StudySession {
  id          String   @id @default(uuid())
  spaceId     String
  title       String
  description String?
  scheduledAt DateTime
  duration    Int      // in minutes
  hostId      String
  maxParticipants Int  @default(10)
  status      SessionStatus @default(SCHEDULED)
  recordingUrl String?
  tags        String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### StudyResource Model
```prisma
model StudyResource {
  id          String   @id @default(uuid())
  spaceId     String
  title       String
  description String?
  url         String?
  fileType    String?
  fileSize    Int?
  uploadedById String
  accessLevel AccessLevel @default(PUBLIC)
  tags        String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### StudyTask Model
```prisma
model StudyTask {
  id          String   @id @default(uuid())
  spaceId     String
  title       String
  description String?
  assignedTo  String?
  dueDate     DateTime?
  priority    TaskPriority @default(MEDIUM)
  status      TaskStatus @default(PENDING)
  completedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### StudyMessage Model
```prisma
model StudyMessage {
  id          String   @id @default(uuid())
  spaceId     String
  userId      String
  content     String
  messageType MessageType @default(TEXT)
  parentId    String?  // For threaded replies
  reactions   Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### StudyProgress Model
```prisma
model StudyProgress {
  id          String   @id @default(uuid())
  spaceId     String
  userId      String
  taskId      String?
  resourceId  String?
  progress    Int      @default(0) // 0-100
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Socket.IO Events

The service supports real-time communication through Socket.IO:

### Client Events
- `joinSpace` - Join a study space room
- `leaveSpace` - Leave a study space room

### Server Events
- `sessionStarted` - Study session started
- `sessionEnded` - Study session ended
- `newMessage` - New message in study space

## Example Usage

### Creating a Study Space
```json
POST /api/spaces
{
  "name": "Calculus Study Group",
  "description": "Group for studying Calculus II",
  "ownerId": "user_123",
  "courseId": "course_456",
  "maxMembers": 15,
  "privacy": "COURSE_ONLY",
  "tags": ["mathematics", "calculus", "derivatives"]
}
```

### Adding a Member
```json
POST /api/spaces/space_123/members
{
  "userId": "user_456",
  "role": "MEMBER"
}
```

### Creating a Study Session
```json
POST /api/spaces/space_123/sessions
{
  "title": "Chapter 5 Review Session",
  "description": "Reviewing derivatives and integrals",
  "scheduledAt": "2023-12-01T14:00:00Z",
  "duration": 90,
  "hostId": "user_123",
  "maxParticipants": 15
}
```

### Uploading a Resource
```json
POST /api/spaces/space_123/resources
{
  "title": "Derivative Rules Cheat Sheet",
  "description": "Quick reference for derivative rules",
  "url": "https://example.com/derivative-rules.pdf",
  "fileType": "application/pdf",
  "uploadedById": "user_123",
  "accessLevel": "SPACE_MEMBERS",
  "tags": ["cheat-sheet", "derivatives"]
}
```

### Creating a Task
```json
POST /api/spaces/space_123/tasks
{
  "title": "Complete Practice Problems",
  "description": "Finish problems 1-20 from Chapter 5",
  "assignedTo": "user_456",
  "dueDate": "2023-12-05T23:59:59Z",
  "priority": "HIGH"
}
```

### Sending a Message
```json
POST /api/spaces/space_123/messages
{
  "userId": "user_123",
  "content": "Don't forget about our session tomorrow!",
  "messageType": "TEXT"
}
```

### Updating Progress
```json
POST /api/spaces/space_123/progress
{
  "userId": "user_456",
  "taskId": "task_789",
  "progress": 75,
  "notes": "Almost finished with the problems"
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