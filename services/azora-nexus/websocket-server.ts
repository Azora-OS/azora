// 🌐 Azora Nexus WebSocket Server - Ubuntu Real-Time Communication
import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { nexus, EventTypes } from './event-bus';
import { cache } from '../database/redis-client';

export function initializeWebSocket(httpServer: HttpServer) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  });

  // Initialize event bus with WebSocket
  nexus.initialize(io);

  io.on('connection', (socket) => {
    console.log(`🌐 Client connected: ${socket.id}`);

    // Authenticate and join user room
    socket.on('authenticate', async (data: { userId: string; token: string }) => {
      try {
        // Verify token (simplified - add proper JWT verification)
        const user = await cache.get(`user:${data.userId}`);
        if (user) {
          socket.join(`user:${data.userId}`);
          socket.data.userId = data.userId;
          
          await nexus.publish({
            type: EventTypes.USER_LOGIN,
            payload: { userId: data.userId, socketId: socket.id },
            source: 'websocket-server',
            timestamp: Date.now()
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Authentication failed' });
      }
    });

    // Subscribe to specific events
    socket.on('subscribe', (eventType: string) => {
      socket.join(`event:${eventType}`);
    });

    // Unsubscribe from events
    socket.on('unsubscribe', (eventType: string) => {
      socket.leave(`event:${eventType}`);
    });

    // Publish events from client
    socket.on('publish', async (event: { type: string; payload: any }) => {
      if (socket.data.userId) {
        await nexus.publish({
          ...event,
          source: 'client',
          userId: socket.data.userId,
          timestamp: Date.now()
        });
      }
    });

    // Get event history
    socket.on('getHistory', (data: { eventType?: string; limit?: number }) => {
      const history = nexus.getHistory(data.eventType, data.limit);
      socket.emit('history', history);
    });

    // Heartbeat
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    socket.on('disconnect', () => {
      console.log(`🌐 Client disconnected: ${socket.id}`);
    });
  });

  console.log('🌐 Azora Nexus WebSocket Server initialized - Ubuntu real-time active');
  return io;
}

export default initializeWebSocket;
