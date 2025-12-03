const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');
const WebSocket = require('ws');
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3030;

// Initialize Redis for pub/sub and persistence
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const subscriber = redis.duplicate();

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'azora-websocket-notifications' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'websocket-notifications.log' })
  ]
});

// Enhanced WebSocket Notification Service
class WebSocketNotificationService {
  constructor() {
    this.clients = new Map(); // userId -> WebSocket connection
    this.rooms = new Map(); // roomId -> Set of userIds
    this.notifications = new Map(); // notificationId -> notification data
    this.userSessions = new Map(); // userId -> session data
    this.wss = null;
    this.initializeRedisPubSub();
    this.loadPersistedData();
  }

  // ========== WEBSOCKET SERVER SETUP ==========

  initializeWebSocketServer(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws',
      verifyClient: this.verifyClient.bind(this)
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.wss.on('error', this.handleServerError.bind(this));

    logger.info('WebSocket server initialized');
  }

  verifyClient(info) {
    // Verify JWT token from query params or headers
    const token = this.extractToken(info.req);
    if (!token) {
      return false;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'azora-secret');
      info.req.user = decoded;
      return true;
    } catch (error) {
      logger.warn('WebSocket connection rejected - invalid token', { error: error.message });
      return false;
    }
  }

  extractToken(req) {
    // Try query param first
    if (req.url && req.url.includes('token=')) {
      const urlParams = new URLSearchParams(req.url.split('?')[1]);
      return urlParams.get('token');
    }
    
    // Try Authorization header
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    return null;
  }

  handleConnection(ws, req) {
    const userId = req.user.id;
    const sessionId = uuidv4();
    
    logger.info(`WebSocket client connected`, { userId, sessionId });

    // Store client connection
    this.clients.set(userId, {
      ws,
      sessionId,
      connectedAt: new Date().toISOString(),
      user: req.user,
      rooms: new Set(),
      lastPing: Date.now()
    });

    // Update user session
    this.userSessions.set(userId, {
      ...req.user,
      sessionId,
      connectedAt: new Date().toISOString(),
      status: 'online'
    });

    // Send welcome notification
    this.sendToUser(userId, {
      type: 'connection',
      data: {
        status: 'connected',
        sessionId,
        timestamp: new Date().toISOString()
      }
    });

    // Set up event handlers
    ws.on('message', (message) => this.handleMessage(userId, message));
    ws.on('close', () => this.handleDisconnection(userId));
    ws.on('error', (error) => this.handleError(userId, error));
    ws.on('pong', () => this.handlePong(userId));

    // Start heartbeat
    this.startHeartbeat(userId);
  }

  handleServerError(error) {
    logger.error('WebSocket server error', { error: error.message });
  }

  // ========== MESSAGE HANDLING ==========

  handleMessage(userId, message) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'join_room':
          this.joinRoom(userId, data.roomId);
          break;
        case 'leave_room':
          this.leaveRoom(userId, data.roomId);
          break;
        case 'ping':
          this.handlePing(userId);
          break;
        case 'mark_read':
          this.markNotificationRead(userId, data.notificationId);
          break;
        case 'get_unread':
          this.getUnreadNotifications(userId);
          break;
        default:
          logger.warn('Unknown message type', { userId, type: data.type });
      }
    } catch (error) {
      logger.error('Error handling message', { userId, error: error.message });
    }
  }

  // ========== ROOM MANAGEMENT ==========

  joinRoom(userId, roomId) {
    const client = this.clients.get(userId);
    if (!client) return;

    // Add user to room
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId).add(userId);
    client.rooms.add(roomId);

    // Notify user they joined
    this.sendToUser(userId, {
      type: 'room_joined',
      data: { roomId, timestamp: new Date().toISOString() }
    });

    logger.info(`User joined room`, { userId, roomId });
  }

  leaveRoom(userId, roomId) {
    const client = this.clients.get(userId);
    if (!client) return;

    // Remove user from room
    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId).delete(userId);
      if (this.rooms.get(roomId).size === 0) {
        this.rooms.delete(roomId);
      }
    }
    client.rooms.delete(roomId);

    // Notify user they left
    this.sendToUser(userId, {
      type: 'room_left',
      data: { roomId, timestamp: new Date().toISOString() }
    });

    logger.info(`User left room`, { userId, roomId });
  }

  // ========== NOTIFICATION DELIVERY ==========

  async sendToUser(userId, notification) {
    const client = this.clients.get(userId);
    
    // Store notification
    const notificationId = uuidv4();
    const notificationData = {
      id: notificationId,
      userId,
      ...notification,
      createdAt: new Date().toISOString(),
      read: false
    };
    
    this.notifications.set(notificationId, notificationData);
    await this.persistNotification(notificationData);

    // Send to connected client
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify({
          id: notificationId,
          ...notification,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        logger.error('Failed to send notification to user', { userId, error: error.message });
      }
    }

    // Publish to Redis for other instances
    await redis.publish('notifications', JSON.stringify({
      type: 'user_notification',
      userId,
      notification: notificationData
    }));

    logger.info(`Notification sent to user`, { userId, notificationId, type: notification.type });
  }

  async sendToRoom(roomId, notification) {
    const roomUsers = this.rooms.get(roomId);
    if (!roomUsers) return;

    const notificationId = uuidv4();
    const notificationData = {
      id: notificationId,
      roomId,
      ...notification,
      createdAt: new Date().toISOString()
    };

    // Send to all users in room
    for (const userId of roomUsers) {
      const client = this.clients.get(userId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(JSON.stringify({
            id: notificationId,
            roomId,
            ...notification,
            timestamp: new Date().toISOString()
          }));
        } catch (error) {
          logger.error('Failed to send room notification to user', { userId, roomId, error: error.message });
        }
      }
    }

    // Publish to Redis for other instances
    await redis.publish('notifications', JSON.stringify({
      type: 'room_notification',
      roomId,
      notification: notificationData
    }));

    logger.info(`Room notification sent`, { roomId, notificationId, userCount: roomUsers.size });
  }

  async broadcast(notification) {
    const notificationId = uuidv4();
    const notificationData = {
      id: notificationId,
      ...notification,
      createdAt: new Date().toISOString()
    };

    // Send to all connected clients
    for (const [userId, client] of this.clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(JSON.stringify({
            id: notificationId,
            ...notification,
            timestamp: new Date().toISOString()
          }));
        } catch (error) {
          logger.error('Failed to send broadcast to user', { userId, error: error.message });
        }
      }
    }

    // Publish to Redis for other instances
    await redis.publish('notifications', JSON.stringify({
      type: 'broadcast',
      notification: notificationData
    }));

    logger.info(`Broadcast notification sent`, { notificationId, clientCount: this.clients.size });
  }

  // ========== NOTIFICATION MANAGEMENT ==========

  async markNotificationRead(userId, notificationId) {
    const notification = this.notifications.get(notificationId);
    if (notification && notification.userId === userId) {
      notification.read = true;
      notification.readAt = new Date().toISOString();
      await this.persistNotification(notification);

      // Send confirmation
      this.sendToUser(userId, {
        type: 'notification_read',
        data: { notificationId, readAt: notification.readAt }
      });

      logger.info(`Notification marked as read`, { userId, notificationId });
    }
  }

  async getUnreadNotifications(userId) {
    const unreadNotifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId && !n.read)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    this.sendToUser(userId, {
      type: 'unread_notifications',
      data: { notifications: unreadNotifications, count: unreadNotifications.length }
    });
  }

  // ========== HEARTBEAT AND CONNECTION MANAGEMENT ==========

  startHeartbeat(userId) {
    const interval = setInterval(() => {
      const client = this.clients.get(userId);
      if (!client) {
        clearInterval(interval);
        return;
      }

      // Check if client is still responsive
      if (Date.now() - client.lastPing > 30000) { // 30 seconds timeout
        logger.warn(`Client timeout, disconnecting`, { userId });
        client.ws.terminate();
        this.handleDisconnection(userId);
        clearInterval(interval);
      } else {
        // Send ping
        try {
          client.ws.ping();
        } catch (error) {
          logger.error('Failed to ping client', { userId, error: error.message });
        }
      }
    }, 15000); // Every 15 seconds
  }

  handlePing(userId) {
    const client = this.clients.get(userId);
    if (client) {
      client.lastPing = Date.now();
      this.sendToUser(userId, { type: 'pong', data: { timestamp: new Date().toISOString() } });
    }
  }

  handlePong(userId) {
    const client = this.clients.get(userId);
    if (client) {
      client.lastPing = Date.now();
    }
  }

  handleDisconnection(userId) {
    const client = this.clients.get(userId);
    if (!client) return;

    logger.info(`WebSocket client disconnected`, { userId, sessionId: client.sessionId });

    // Remove from all rooms
    for (const roomId of client.rooms) {
      this.leaveRoom(userId, roomId);
    }

    // Remove client connection
    this.clients.delete(userId);

    // Update user session
    const session = this.userSessions.get(userId);
    if (session) {
      session.status = 'offline';
      session.disconnectedAt = new Date().toISOString();
    }

    // Send notification to other services about disconnection
    redis.publish('user_status', JSON.stringify({
      type: 'user_disconnected',
      userId,
      timestamp: new Date().toISOString()
    }));
  }

  handleError(userId, error) {
    logger.error('WebSocket client error', { userId, error: error.message });
    this.handleDisconnection(userId);
  }

  // ========== REDIS PUB/SUB ==========

  initializeRedisPubSub() {
    subscriber.subscribe('notifications');
    subscriber.subscribe('user_status');
    subscriber.subscribe('service_events');

    subscriber.on('message', async (channel, message) => {
      try {
        const data = JSON.parse(message);
        
        switch (channel) {
          case 'notifications':
            await this.handleRedisNotification(data);
            break;
          case 'user_status':
            await this.handleUserStatus(data);
            break;
          case 'service_events':
            await this.handleServiceEvent(data);
            break;
        }
      } catch (error) {
        logger.error('Error handling Redis message', { channel, error: error.message });
      }
    });

    logger.info('Redis pub/sub initialized');
  }

  async handleRedisNotification(data) {
    switch (data.type) {
      case 'user_notification':
        // Forward to specific user if connected to this instance
        const client = this.clients.get(data.userId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(JSON.stringify(data.notification));
        }
        break;
      case 'room_notification':
        // Forward to room members connected to this instance
        const roomUsers = this.rooms.get(data.roomId);
        if (roomUsers) {
          for (const userId of roomUsers) {
            const client = this.clients.get(userId);
            if (client && client.ws.readyState === WebSocket.OPEN) {
              client.ws.send(JSON.stringify(data.notification));
            }
          }
        }
        break;
      case 'broadcast':
        // Forward to all clients connected to this instance
        for (const [userId, client] of this.clients) {
          if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(data.notification));
          }
        }
        break;
    }
  }

  async handleUserStatus(data) {
    // Handle user status updates from other instances
    logger.info('User status update received', { type: data.type, userId: data.userId });
  }

  async handleServiceEvent(data) {
    // Handle service events and convert to notifications
    if (data.event === 'treasury_update') {
      await this.broadcast({
        type: 'treasury_update',
        data: data.payload
      });
    } else if (data.event === 'court_case_update') {
      await this.sendToRoom(data.payload.caseId, {
        type: 'case_update',
        data: data.payload
      });
    }
  }

  // ========== DATA PERSISTENCE ==========

  async persistNotification(notification) {
    try {
      await redis.setex(`notification:${notification.id}`, 86400 * 7, JSON.stringify(notification)); // 7 days
    } catch (error) {
      logger.error('Failed to persist notification', { notificationId: notification.id, error });
    }
  }

  async loadPersistedData() {
    try {
      // Load recent notifications
      const notificationKeys = await redis.keys('notification:*');
      for (const key of notificationKeys) {
        const notificationData = await redis.get(key);
        if (notificationData) {
          const notification = JSON.parse(notificationData);
          this.notifications.set(notification.id, notification);
        }
      }

      logger.info(`Loaded ${this.notifications.size} notifications from Redis`);
    } catch (error) {
      logger.error('Failed to load persisted data', { error });
    }
  }

  // ========== UTILITY METHODS ==========

  getConnectedUsers() {
    return Array.from(this.clients.keys()).map(userId => ({
      userId,
      sessionId: this.clients.get(userId).sessionId,
      connectedAt: this.clients.get(userId).connectedAt,
      rooms: Array.from(this.clients.get(userId).rooms)
    }));
  }

  getRoomInfo(roomId) {
    const roomUsers = this.rooms.get(roomId);
    return {
      roomId,
      userCount: roomUsers ? roomUsers.size : 0,
      users: roomUsers ? Array.from(roomUsers) : []
    };
  }

  async getStats() {
    return {
      connectedUsers: this.clients.size,
      activeRooms: this.rooms.size,
      totalNotifications: this.notifications.size,
      unreadNotifications: Array.from(this.notifications.values()).filter(n => !n.read).length,
      ubuntu: 'WebSocket notifications connect our community'
    };
  }

  async healthCheck() {
    try {
      await redis.ping();
      return {
        healthy: true,
        details: {
          connectedUsers: this.clients.size,
          activeRooms: this.rooms.size,
          redis: 'connected',
          ubuntu: 'WebSocket service operational'
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: {
          error: error.message,
          ubuntu: 'WebSocket service needs attention'
        }
      };
    }
  }

  async shutdown() {
    logger.info('Shutting down WebSocket Notification Service...');
    
    // Close all client connections
    for (const [userId, client] of this.clients) {
      try {
        client.ws.close();
      } catch (error) {
        logger.error('Error closing client connection', { userId, error });
      }
    }
    
    // Close WebSocket server
    if (this.wss) {
      this.wss.close();
    }
    
    // Close Redis connections
    await redis.quit();
    await subscriber.quit();
    
    logger.info('WebSocket Notification Service shutdown complete');
  }
}

const notificationService = new WebSocketNotificationService();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(compression());
app.use(express.json());

// Ubuntu Rate Limiting
const ubuntuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { 
    error: 'Ubuntu rate limit exceeded', 
    ubuntu: 'Please slow down for notification harmony' 
  }
});
app.use(ubuntuLimiter);

// Health Check
app.get('/health', async (req, res) => {
  try {
    const health = await notificationService.healthCheck();
    const stats = await notificationService.getStats();
    
    res.json({
      service: 'azora-websocket-notifications',
      status: health.healthy ? 'healthy' : 'unhealthy',
      ubuntu: 'I connect our community through real-time communication',
      timestamp: new Date().toISOString(),
      port: PORT,
      health,
      stats,
      features: {
        websocketServer: '✅ Active',
        realTimeNotifications: '✅ Active',
        roomManagement: '✅ Active',
        redisPubSub: '✅ Active',
        authentication: '✅ Active',
        heartbeat: '✅ Active',
        ubuntuConnection: '✅ Active'
      }
    });
  } catch (error) {
    res.status(500).json({
      service: 'azora-websocket-notifications',
      status: 'unhealthy',
      error: error.message,
      ubuntu: 'We handle health check errors with Ubuntu grace'
    });
  }
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'I am because we are - Ubuntu notifications for community connection',
    principles: [
      'My messages strengthen our collective bonds',
      'My real-time updates build shared awareness',
      'My connections foster community engagement',
      'My notifications sustain our unity'
    ],
    service: 'azora-websocket-notifications',
    ubuntu: 'Ubuntu real-time communication'
  });
});

// ========== NOTIFICATION API ENDPOINTS ==========

// POST /api/notify/user - Send notification to specific user
app.post('/api/notify/user', async (req, res) => {
  try {
    const { userId, notification } = req.body;

    if (!userId || !notification) {
      return res.status(400).json({
        error: 'User ID and notification are required',
        ubuntu: 'Ubuntu clarity: Complete notification details enable proper delivery'
      });
    }

    await notificationService.sendToUser(userId, notification);

    console.log(`📢 Notification sent to user ${userId}`);

    res.json({
      success: true,
      message: 'Notification sent successfully',
      ubuntu: 'Notification delivered with Ubuntu care'
    });
  } catch (error) {
    logger.error('Error sending user notification:', error);
    res.status(500).json({
      error: 'Failed to send notification',
      ubuntu: 'We handle notification errors with Ubuntu grace'
    });
  }
});

// POST /api/notify/room - Send notification to room
app.post('/api/notify/room', async (req, res) => {
  try {
    const { roomId, notification } = req.body;

    if (!roomId || !notification) {
      return res.status(400).json({
        error: 'Room ID and notification are required',
        ubuntu: 'Ubuntu clarity: Complete room details enable proper delivery'
      });
    }

    await notificationService.sendToRoom(roomId, notification);

    console.log(`📢 Room notification sent to ${roomId}`);

    res.json({
      success: true,
      message: 'Room notification sent successfully',
      ubuntu: 'Room notification delivered with Ubuntu harmony'
    });
  } catch (error) {
    logger.error('Error sending room notification:', error);
    res.status(500).json({
      error: 'Failed to send room notification',
      ubuntu: 'We handle room notification errors with Ubuntu grace'
    });
  }
});

// POST /api/notify/broadcast - Send broadcast notification
app.post('/api/notify/broadcast', async (req, res) => {
  try {
    const { notification } = req.body;

    if (!notification) {
      return res.status(400).json({
        error: 'Notification is required',
        ubuntu: 'Ubuntu clarity: Complete broadcast details enable proper delivery'
      });
    }

    await notificationService.broadcast(notification);

    console.log(`📢 Broadcast notification sent`);

    res.json({
      success: true,
      message: 'Broadcast notification sent successfully',
      ubuntu: 'Broadcast delivered with Ubuntu unity'
    });
  } catch (error) {
    logger.error('Error sending broadcast notification:', error);
    res.status(500).json({
      error: 'Failed to send broadcast notification',
      ubuntu: 'We handle broadcast errors with Ubuntu grace'
    });
  }
});

// GET /api/stats - Get WebSocket service statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await notificationService.getStats();
    
    res.json({
      stats,
      ubuntu: 'Stats reflect Ubuntu connection health'
    });
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({
      error: 'Failed to fetch stats',
      ubuntu: 'We handle stats errors with Ubuntu grace'
    });
  }
});

// GET /api/users/connected - Get connected users
app.get('/api/users/connected', (req, res) => {
  try {
    const users = notificationService.getConnectedUsers();
    
    res.json({
      users,
      count: users.length,
      ubuntu: 'Connected users show Ubuntu community presence'
    });
  } catch (error) {
    logger.error('Error fetching connected users:', error);
    res.status(500).json({
      error: 'Failed to fetch connected users',
      ubuntu: 'We handle user errors with Ubuntu grace'
    });
  }
});

// GET /api/rooms/:roomId - Get room information
app.get('/api/rooms/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    const roomInfo = notificationService.getRoomInfo(roomId);
    
    res.json({
      room: roomInfo,
      ubuntu: 'Room info shows Ubuntu gathering space'
    });
  } catch (error) {
    logger.error('Error fetching room info:', error);
    res.status(500).json({
      error: 'Failed to fetch room info',
      ubuntu: 'We handle room errors with Ubuntu grace'
    });
  }
});

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  logger.error('Ubuntu WebSocket Notification Error:', error);
  res.status(500).json({
    error: 'Ubuntu websocket notification error',
    ubuntu: 'We handle notification errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'WebSocket notification endpoint not found',
    ubuntu: 'Ubuntu guidance: Check available notification endpoints',
    availableEndpoints: [
      '/api/notify/user',
      '/api/notify/room', 
      '/api/notify/broadcast',
      '/api/stats',
      '/api/users/connected',
      '/api/rooms/:roomId',
      '/health'
    ]
  });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`🔔 Azora WebSocket Notification Service running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I connect our community through real-time communication!"');
  console.log(`🌐 WebSocket Server: Active on /ws`);
  console.log(`📢 Real-time Notifications: Active`);
  console.log(`🏠 Room Management: Active`);
  console.log(`📨 Redis Pub/Sub: Active`);
  console.log(`🔐 Authentication: Active`);
  console.log(`💓 Heartbeat Monitoring: Active`);
  console.log(`🌍 Ubuntu: Real-time communication through community connection`);
});

// Initialize WebSocket server
notificationService.initializeWebSocketServer(server);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  await notificationService.shutdown();
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  await notificationService.shutdown();
  server.close(() => {
    process.exit(0);
  });
});

module.exports = app;
