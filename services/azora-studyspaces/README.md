# 🎓 Azora StudySpaces

**Virtual Study Rooms with Collaborative Learning & AI Integration**

## 🌟 Features

### ✅ Virtual Study Rooms
- Create public, private, or course-specific study rooms
- Real-time participant management
- Room capacity controls
- Status tracking (active/inactive/archived)

### ✅ Live Video Lectures
- Integration with Azora Classroom service
- Jitsi Meet support for video conferencing
- Screen sharing capabilities
- Recording and transcription

### ✅ Collaborative Note-Taking
- Real-time collaborative editing
- Version control and contributor tracking
- Multiple notes per room
- POK rewards for contributions

### ✅ AI Tutor Integration (Azora Sapiens)
- Start AI tutoring sessions within study rooms
- Topic-based learning assistance
- Message history tracking
- POK rewards for AI learning engagement

### ✅ Screen Sharing & Whiteboard
- WebSocket-based real-time drawing
- Collaborative whiteboard sessions
- Screen sharing notifications
- Multi-user collaboration

### ✅ Assignment Submission
- Create and manage assignments
- File and text submissions
- Grading with feedback
- POK rewards for submissions

### ✅ Peer Learning Groups
- Create study groups within rooms
- Topic-based organization
- Member management
- Shared POK pools

### ✅ Proof-of-Knowledge Rewards
- Automatic POK distribution for:
  - Room participation (+5 POK)
  - Note contributions (+10 POK creation, +5 POK edits)
  - Assignment submissions (+20 POK)
  - AI learning engagement (+2 POK per message)
  - Helping peers (variable)
- Integration with Azora Mint service
- Contribution score tracking

## 🚀 Quick Start

### Installation
```bash
cd services/azora-studyspaces
npm install
```

### Development
```bash
cp .env.example .env
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Docker
```bash
docker-compose up -d
```

## 📡 API Endpoints

### Rooms
- `POST /rooms` - Create study room
- `GET /rooms` - List rooms (with filters)
- `GET /rooms/:roomId` - Get room details
- `POST /rooms/:roomId/join` - Join room
- `POST /rooms/:roomId/leave` - Leave room

### Live Lectures
- `POST /rooms/:roomId/lecture` - Start live lecture

### Notes
- `POST /rooms/:roomId/notes` - Create note
- `PUT /notes/:noteId` - Update note
- `GET /rooms/:roomId/notes` - Get room notes

### Assignments
- `POST /rooms/:roomId/assignments` - Create assignment
- `POST /assignments/:assignmentId/submit` - Submit assignment
- `POST /submissions/:submissionId/grade` - Grade submission

### AI Tutor
- `POST /rooms/:roomId/ai-tutor` - Start AI session
- `POST /ai-sessions/:sessionId/message` - Send message
- `GET /rooms/:roomId/ai-sessions` - Get AI sessions

### Peer Groups
- `POST /rooms/:roomId/peer-groups` - Create peer group
- `GET /rooms/:roomId/peer-groups` - Get peer groups

### POK Rewards
- `GET /users/:userId/pok-rewards` - Get user rewards

## 🔌 WebSocket Events

### Client → Server
- `join-room` - Join study room
- `leave-room` - Leave study room
- `chat-message` - Send chat message
- `whiteboard-draw` - Draw on whiteboard
- `screen-share-start` - Start screen sharing
- `screen-share-stop` - Stop screen sharing
- `note-update` - Update note in real-time

### Server → Client
- `participant-joined` - User joined room
- `participant-left` - User left room
- `chat-message` - New chat message
- `whiteboard-draw` - Whiteboard update
- `screen-share-started` - Screen share started
- `screen-share-stopped` - Screen share stopped
- `note-created` - New note created
- `note-updated` - Note updated
- `assignment-created` - New assignment

## 🏗️ Architecture

```
azora-studyspaces/
├── src/
│   ├── types.ts          # TypeScript interfaces
│   ├── studyspaces.ts    # Core service logic
│   └── index.ts          # Express server & WebSocket
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🔗 Service Integration

### Azora Classroom (Port 4200)
- Live lecture sessions
- Video conferencing
- Recording and transcription

### Azora Sapiens (Port 4100)
- AI tutoring
- Personalized learning
- Chat responses

### Azora Mint (Port 4001)
- POK reward distribution
- Mining engine integration
- Wallet management

## 🎯 Ubuntu Philosophy

*"Ngiyakwazi ngoba sikwazi" - "I can because we can"*

StudySpaces embodies Ubuntu principles:
- **Collective Learning**: Knowledge shared multiplies
- **Peer Support**: Success through collaboration
- **AI Augmentation**: Technology serves community
- **Fair Rewards**: Contributions recognized with POK

## 📊 POK Reward Structure

| Activity | POK Reward | Reason |
|----------|-----------|---------|
| Join Room | +5 | participation |
| Create Note | +10 | contribution |
| Edit Note | +5 | contribution |
| Submit Assignment | +20 | assignment |
| AI Message | +2 | ai_learning |
| Help Peer | Variable | helping_peer |

## 🔐 Security

- Room access control (public/private/course)
- Participant role management (owner/moderator/member)
- Assignment submission validation
- POK reward verification

## 📈 Future Enhancements

- [ ] Video recording storage
- [ ] Advanced whiteboard tools
- [ ] Breakout rooms within study spaces
- [ ] Calendar integration
- [ ] Mobile app support
- [ ] Offline mode
- [ ] Analytics dashboard

## 🤝 Contributing

Follow Ubuntu principles in all contributions:
- Consider collective benefit
- Document for community
- Test thoroughly
- Secure implementation

## 📄 License

**Azora Proprietary License**  
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

---

**Port**: 4300  
**Status**: Production Ready ✅  
**Ubuntu**: Active 🌟
