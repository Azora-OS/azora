const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 📚 AZORA STUDY SPACES - COLLABORATIVE LEARNING PLATFORM
console.log('🌟 Azora Study Spaces - Initializing...');

// In-memory storage for real-time features
const activeSpaces = new Map();
const activeSessions = new Map();
const connectedUsers = new Map();

// 🤝 COLLABORATION ENGINE
class CollaborationEngine {
  constructor() {
    this.studyRooms = new Map();
    this.whiteboards = new Map();
  }

  createStudyRoom(spaceId, userId) {
    const roomId = `room_${spaceId}_${Date.now()}`;
    const room = {
      id: roomId,
      spaceId,
      creator: userId,
      participants: [userId],
      whiteboard: {
        elements: [],
        version: 0
      },
      chat: [],
      createdAt: new Date().toISOString()
    };
    
    this.studyRooms.set(roomId, room);
    return room;
  }

  joinRoom(roomId, userId) {
    const room = this.studyRooms.get(roomId);
    if (room && !room.participants.includes(userId)) {
      room.participants.push(userId);
      return true;
    }
    return false;
  }

  leaveRoom(roomId, userId) {
    const room = this.studyRooms.get(roomId);
    if (room) {
      room.participants = room.participants.filter(id => id !== userId);
      if (room.participants.length === 0) {
        this.studyRooms.delete(roomId);
      }
      return true;
    }
    return false;
  }

  updateWhiteboard(roomId, elements) {
    const room = this.studyRooms.get(roomId);
    if (room) {
      room.whiteboard.elements = elements;
      room.whiteboard.version++;
      return room.whiteboard;
    }
    return null;
  }

  addChatMessage(roomId, userId, message) {
    const room = this.studyRooms.get(roomId);
    if (room) {
      const chatMessage = {
        id: `msg_${Date.now()}`,
        userId,
        message,
        timestamp: new Date().toISOString()
      };
      room.chat.push(chatMessage);
      return chatMessage;
    }
    return null;
  }
}

const collaboration = new CollaborationEngine();

// 🎯 FOCUS TRACKING ENGINE
class FocusTracker {
  constructor() {
    this.sessions = new Map();
  }

  startFocusSession(userId, spaceId, duration = 25) {
    const sessionId = `focus_${Date.now()}`;
    const session = {
      id: sessionId,
      userId,
      spaceId,
      duration: duration * 60 * 1000, // Convert to milliseconds
      startTime: Date.now(),
      endTime: Date.now() + (duration * 60 * 1000),
      breaks: [],
      completed: false
    };
    
    this.sessions.set(sessionId, session);
    
    // Auto-complete session after duration
    setTimeout(() => {
      this.completeFocusSession(sessionId);
    }, session.duration);
    
    return session;
  }

  takeFocusBreak(sessionId, breakDuration = 5) {
    const session = this.sessions.get(sessionId);
    if (session && !session.completed) {
      const breakObj = {
        startTime: Date.now(),
        duration: breakDuration * 60 * 1000
      };
      session.breaks.push(breakObj);
      return breakObj;
    }
    return null;
  }

  completeFocusSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.completed = true;
      session.actualEndTime = Date.now();
      return session;
    }
    return null;
  }

  getFocusStats(userId) {
    const userSessions = Array.from(this.sessions.values())
      .filter(session => session.userId === userId);
    
    const totalSessions = userSessions.length;
    const completedSessions = userSessions.filter(s => s.completed).length;
    const totalFocusTime = userSessions.reduce((total, session) => {
      if (session.completed) {
        return total + (session.actualEndTime - session.startTime);
      }
      return total;
    }, 0);
    
    return {
      totalSessions,
      completedSessions,
      completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
      totalFocusTime: Math.floor(totalFocusTime / 1000 / 60), // Convert to minutes
      averageSessionLength: completedSessions > 0 ? Math.floor(totalFocusTime / completedSessions / 1000 / 60) : 0
    };
  }
}

const focusTracker = new FocusTracker();

// 🎯 API ROUTES

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'azora-studyspaces',
    ubuntu: 'I study because we learn together',
    activeSpaces: activeSpaces.size,
    activeSessions: activeSessions.size,
    connectedUsers: connectedUsers.size,
    timestamp: new Date().toISOString()
  });
});

// Create Study Room
app.post('/api/spaces/:spaceId/rooms', (req, res) => {
  try {
    const { spaceId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const room = collaboration.createStudyRoom(spaceId, userId);
    
    res.json({
      success: true,
      message: 'Study room created successfully',
      data: room
    });
  } catch (error) {
    console.error('Error creating study room:', error);
    res.status(500).json({ error: 'Failed to create study room' });
  }
});

// Join Study Room
app.post('/api/rooms/:roomId/join', (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;
    
    const success = collaboration.joinRoom(roomId, userId);
    
    if (success) {
      const room = collaboration.studyRooms.get(roomId);
      res.json({
        success: true,
        message: 'Joined study room successfully',
        data: room
      });
    } else {
      res.status(404).json({ error: 'Room not found or already joined' });
    }
  } catch (error) {
    console.error('Error joining study room:', error);
    res.status(500).json({ error: 'Failed to join study room' });
  }
});

// Start Focus Session
app.post('/api/focus/start', (req, res) => {
  try {
    const { userId, spaceId, duration } = req.body;
    
    if (!userId || !spaceId) {
      return res.status(400).json({ error: 'User ID and Space ID are required' });
    }
    
    const session = focusTracker.startFocusSession(userId, spaceId, duration);
    
    res.json({
      success: true,
      message: 'Focus session started',
      data: session
    });
  } catch (error) {
    console.error('Error starting focus session:', error);
    res.status(500).json({ error: 'Failed to start focus session' });
  }
});

// Take Focus Break
app.post('/api/focus/:sessionId/break', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { duration } = req.body;
    
    const breakObj = focusTracker.takeFocusBreak(sessionId, duration);
    
    if (breakObj) {
      res.json({
        success: true,
        message: 'Break started',
        data: breakObj
      });
    } else {
      res.status(404).json({ error: 'Session not found or already completed' });
    }
  } catch (error) {
    console.error('Error taking break:', error);
    res.status(500).json({ error: 'Failed to take break' });
  }
});

// Get Focus Stats
app.get('/api/focus/stats/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const stats = focusTracker.getFocusStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting focus stats:', error);
    res.status(500).json({ error: 'Failed to get focus stats' });
  }
});

// WebSocket for Real-time Collaboration
wss.on('connection', (ws, req) => {
  console.log('🔗 New study space connection');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'join_space':
          ws.spaceId = data.spaceId;
          ws.userId = data.userId;
          connectedUsers.set(ws.userId, ws);
          
          // Notify others in the space
          wss.clients.forEach(client => {
            if (client.spaceId === data.spaceId && client !== ws) {
              client.send(JSON.stringify({
                type: 'user_joined',
                userId: data.userId,
                message: 'A study buddy joined the space! 🤝'
              }));
            }
          });
          break;
          
        case 'whiteboard_update':
          // Broadcast whiteboard changes to room participants
          const updatedWhiteboard = collaboration.updateWhiteboard(data.roomId, data.elements);
          if (updatedWhiteboard) {
            wss.clients.forEach(client => {
              if (client.roomId === data.roomId && client !== ws) {
                client.send(JSON.stringify({
                  type: 'whiteboard_sync',
                  whiteboard: updatedWhiteboard
                }));
              }
            });
          }
          break;
          
        case 'chat_message':
          const chatMessage = collaboration.addChatMessage(data.roomId, ws.userId, data.message);
          if (chatMessage) {
            wss.clients.forEach(client => {
              if (client.roomId === data.roomId) {
                client.send(JSON.stringify({
                  type: 'new_chat_message',
                  message: chatMessage
                }));
              }
            });
          }
          break;
          
        case 'focus_update':
          // Broadcast focus session updates
          wss.clients.forEach(client => {
            if (client.spaceId === ws.spaceId && client !== ws) {
              client.send(JSON.stringify({
                type: 'peer_focus_update',
                userId: ws.userId,
                focusData: data.focusData
              }));
            }
          });
          break;
          
        case 'study_progress':
          // Share study progress with space members
          wss.clients.forEach(client => {
            if (client.spaceId === ws.spaceId && client !== ws) {
              client.send(JSON.stringify({
                type: 'peer_progress',
                userId: ws.userId,
                progress: data.progress
              }));
            }
          });
          break;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('📚 Study space connection closed');
    if (ws.userId) {
      connectedUsers.delete(ws.userId);
      
      // Notify others that user left
      wss.clients.forEach(client => {
        if (client.spaceId === ws.spaceId) {
          client.send(JSON.stringify({
            type: 'user_left',
            userId: ws.userId,
            message: 'A study buddy left the space'
          }));
        }
      });
    }
  });
});

const PORT = process.env.PORT || 3009;
server.listen(PORT, () => {
  console.log('🌟 Azora Study Spaces running on port', PORT);
  console.log('📚 Features: Virtual Rooms, Real-time Collaboration, Focus Tracking');
  console.log('🤝 Collaboration: Active');
  console.log('⏰ Focus Sessions: Enabled');
  console.log('💬 Real-time Chat: Active');
  console.log('🎨 Collaborative Whiteboard: Ready');
  console.log('🌍 Ubuntu Philosophy: "I study because we learn together"');
});