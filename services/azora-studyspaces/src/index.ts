import express, { Request, Response } from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { StudySpacesService } from './studyspaces';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4300;
const CLASSROOM_URL = process.env.CLASSROOM_SERVICE_URL || 'http://localhost:4200';
const SAPIENS_URL = process.env.SAPIENS_SERVICE_URL || 'http://localhost:4100';
const MINT_URL = process.env.MINT_SERVICE_URL || 'http://localhost:4001';

const studySpaces = new StudySpacesService({
  classroomServiceUrl: CLASSROOM_URL,
  sapiensServiceUrl: SAPIENS_URL,
  mintServiceUrl: MINT_URL,
  port: PORT as number
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'azora-studyspaces', port: PORT });
});

// Create study room
app.post('/rooms', async (req: Request, res: Response) => {
  try {
    const { name, description, createdBy, creatorName, subject, type, courseId } = req.body;
    const room = await studySpaces.createRoom(name, description, createdBy, creatorName, subject, type, courseId);
    res.json(room);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get room
app.get('/rooms/:roomId', (req: Request, res: Response) => {
  const room = studySpaces.getRoom(req.params.roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json(room);
});

// List rooms
app.get('/rooms', (req: Request, res: Response) => {
  const { type, subject, status } = req.query;
  const rooms = studySpaces.listRooms({
    type: type as any,
    subject: subject as string,
    status: status as any
  });
  res.json(rooms);
});

// Join room
app.post('/rooms/:roomId/join', async (req: Request, res: Response) => {
  try {
    const { userId, userName } = req.body;
    const result = await studySpaces.joinRoom(req.params.roomId, userId, userName);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Leave room
app.post('/rooms/:roomId/leave', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    await studySpaces.leaveRoom(req.params.roomId, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Start live lecture
app.post('/rooms/:roomId/lecture', async (req: Request, res: Response) => {
  try {
    const { instructorId, title, description } = req.body;
    const sessionId = await studySpaces.startLiveLecture(req.params.roomId, instructorId, title, description);
    res.json({ sessionId });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Create collaborative note
app.post('/rooms/:roomId/notes', async (req: Request, res: Response) => {
  try {
    const { userId, userName, title, content } = req.body;
    const note = await studySpaces.createCollaborativeNote(req.params.roomId, userId, userName, title, content);
    res.json(note);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update note
app.put('/notes/:noteId', async (req: Request, res: Response) => {
  try {
    const { userId, userName, content } = req.body;
    const note = await studySpaces.updateNote(req.params.noteId, userId, userName, content);
    res.json(note);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get room notes
app.get('/rooms/:roomId/notes', (req: Request, res: Response) => {
  const notes = studySpaces.getRoomNotes(req.params.roomId);
  res.json(notes);
});

// Create assignment
app.post('/rooms/:roomId/assignments', async (req: Request, res: Response) => {
  try {
    const { createdBy, title, description, dueDate, totalPoints } = req.body;
    const assignment = await studySpaces.createAssignment(
      req.params.roomId,
      createdBy,
      title,
      description,
      new Date(dueDate),
      totalPoints
    );
    res.json(assignment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Submit assignment
app.post('/assignments/:assignmentId/submit', async (req: Request, res: Response) => {
  try {
    const { studentId, studentName, content, fileUrl } = req.body;
    const submission = await studySpaces.submitAssignment(req.params.assignmentId, studentId, studentName, content, fileUrl);
    res.json(submission);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Grade submission
app.post('/submissions/:submissionId/grade', async (req: Request, res: Response) => {
  try {
    const { grade, feedback, pokBonus } = req.body;
    const submission = await studySpaces.gradeSubmission(req.params.submissionId, grade, feedback, pokBonus);
    res.json(submission);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Start AI tutor session
app.post('/rooms/:roomId/ai-tutor', async (req: Request, res: Response) => {
  try {
    const { userId, userName, topic } = req.body;
    const session = await studySpaces.startAITutorSession(req.params.roomId, userId, userName, topic);
    res.json(session);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Send AI message
app.post('/ai-sessions/:sessionId/message', async (req: Request, res: Response) => {
  try {
    const { userId, message } = req.body;
    const response = await studySpaces.sendAIMessage(req.params.sessionId, userId, message);
    res.json(response);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get AI sessions
app.get('/rooms/:roomId/ai-sessions', (req: Request, res: Response) => {
  const sessions = studySpaces.getRoomAISessions(req.params.roomId);
  res.json(sessions);
});

// Create peer learning group
app.post('/rooms/:roomId/peer-groups', async (req: Request, res: Response) => {
  try {
    const { name, creatorId, topic, memberIds } = req.body;
    const group = await studySpaces.createPeerGroup(req.params.roomId, name, creatorId, topic, memberIds);
    res.json(group);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get peer groups
app.get('/rooms/:roomId/peer-groups', (req: Request, res: Response) => {
  const groups = studySpaces.getRoomPeerGroups(req.params.roomId);
  res.json(groups);
});

// Get user POK rewards
app.get('/users/:userId/pok-rewards', (req: Request, res: Response) => {
  const rewards = studySpaces.getUserPOKRewards(req.params.userId);
  res.json(rewards);
});

// WebSocket connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', async ({ roomId, userId, userName }) => {
    socket.join(roomId);
    try {
      const result = await studySpaces.joinRoom(roomId, userId, userName);
      io.to(roomId).emit('participant-joined', result.participant);
    } catch (error: any) {
      socket.emit('error', error.message);
    }
  });

  socket.on('leave-room', async ({ roomId, userId }) => {
    socket.leave(roomId);
    try {
      await studySpaces.leaveRoom(roomId, userId);
      io.to(roomId).emit('participant-left', { userId });
    } catch (error: any) {
      socket.emit('error', error.message);
    }
  });

  socket.on('chat-message', ({ roomId, userId, userName, message }) => {
    io.to(roomId).emit('chat-message', { userId, userName, message, timestamp: new Date() });
  });

  socket.on('whiteboard-draw', ({ roomId, stroke }) => {
    socket.to(roomId).emit('whiteboard-draw', stroke);
  });

  socket.on('screen-share-start', ({ roomId, userId, userName }) => {
    io.to(roomId).emit('screen-share-started', { userId, userName });
  });

  socket.on('screen-share-stop', ({ roomId, userId }) => {
    io.to(roomId).emit('screen-share-stopped', { userId });
  });

  socket.on('note-update', ({ roomId, noteId, content }) => {
    socket.to(roomId).emit('note-updated', { noteId, content });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Event listeners
studySpaces.on('room-created', (room) => {
  console.log('Room created:', room.id);
});

studySpaces.on('participant-joined', ({ room, participant }) => {
  io.to(room.id).emit('participant-joined', participant);
});

studySpaces.on('participant-left', ({ room, participant }) => {
  io.to(room.id).emit('participant-left', participant);
});

studySpaces.on('note-created', (note) => {
  io.to(note.roomId).emit('note-created', note);
});

studySpaces.on('note-updated', (note) => {
  io.to(note.roomId).emit('note-updated', note);
});

studySpaces.on('assignment-created', (assignment) => {
  io.to(assignment.roomId).emit('assignment-created', assignment);
});

studySpaces.on('assignment-submitted', (submission) => {
  console.log('Assignment submitted:', submission.id);
});

studySpaces.on('pok-awarded', (reward) => {
  console.log('POK awarded:', reward.amount, 'to', reward.userId);
});

server.listen(PORT, () => {
  console.log(`🎓 Azora StudySpaces running on port ${PORT}`);
  console.log(`📚 Features: Virtual Rooms, Live Lectures, AI Tutor, Collaborative Notes`);
  console.log(`⛏️  Proof-of-Knowledge rewards enabled`);
});

export default app;
