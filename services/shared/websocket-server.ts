/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Real-Time WebSocket Server for Education Services
 * 
 * Enables real-time collaboration, messaging, and updates
 */

import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

export interface SocketUser {
  userId: string;
  studentNumber?: string;
  role: 'student' | 'instructor' | 'admin';
  socketId: string;
}

export class EducationWebSocketServer {
  private static instance: EducationWebSocketServer;
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, SocketUser> = new Map(); // userId -> user
  private courseRooms: Map<string, Set<string>> = new Map(); // courseId -> Set<userId>

  private constructor() {
  }

  public static getInstance(): EducationWebSocketServer {
    if (!EducationWebSocketServer.instance) {
      EducationWebSocketServer.instance = new EducationWebSocketServer();
    }
    return EducationWebSocketServer.instance;
  }

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer: HttpServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        methods: ['GET', 'POST'],
      },
      path: '/education-socket',
    });

    this.io.on('connection', (socket) => {
      console.log(`✅ WebSocket connected: ${socket.id}`);

      // User authentication
      socket.on('authenticate', (data: { userId: string; studentNumber?: string; role: string }) => {
        const user: SocketUser = {
          userId: data.userId,
          studentNumber: data.studentNumber,
          role: data.role as SocketUser['role'],
          socketId: socket.id,
        };
        this.connectedUsers.set(data.userId, user);
        socket.join(`user:${data.userId}`);
        socket.emit('authenticated', { success: true });
      });

      // Join course room
      socket.on('join-course', (courseId: string) => {
        socket.join(`course:${courseId}`);
        const userId = this.getUserIdFromSocket(socket.id);
        if (userId) {
          if (!this.courseRooms.has(courseId)) {
            this.courseRooms.set(courseId, new Set());
          }
          this.courseRooms.get(courseId)?.add(userId);
        }
        socket.emit('joined-course', { courseId });
      });

      // Leave course room
      socket.on('leave-course', (courseId: string) => {
        socket.leave(`course:${courseId}`);
        const userId = this.getUserIdFromSocket(socket.id);
        if (userId) {
          this.courseRooms.get(courseId)?.delete(userId);
        }
      });

      // Real-time messaging
      socket.on('send-message', (data: { receiverId: string; content: string }) => {
        this.io?.to(`user:${data.receiverId}`).emit('new-message', {
          senderId: this.getUserIdFromSocket(socket.id),
          content: data.content,
          timestamp: new Date(),
        });
      });

      // Forum updates
      socket.on('forum-update', (data: { forumId: string; type: string; data: any }) => {
        this.io?.to(`forum:${data.forumId}`).emit('forum-updated', data);
      });

      // Grade updates
      socket.on('grade-updated', (data: { studentId: string; gradeId: string }) => {
        socket.to(`user:${data.studentId}`).emit('grade-update', data);
      });

      // Video progress updates
      socket.on('video-progress', (data: { videoId: string; userId: string; progress: number }) => {
        socket.to(`video:${data.videoId}`).emit('video-progress-update', data);
      });

      // Disconnect
      socket.on('disconnect', () => {
        const userId = this.getUserIdFromSocket(socket.id);
        if (userId) {
          this.connectedUsers.delete(userId);
        }
        console.log(`❌ WebSocket disconnected: ${socket.id}`);
      });
    });

    console.log('✅ Education WebSocket server initialized');
  }

  /**
   * Get user ID from socket ID
   */
  private getUserIdFromSocket(socketId: string): string | undefined {
    for (const [userId, user] of this.connectedUsers.entries()) {
      if (user.socketId === socketId) {
        return userId;
      }
    }
    return undefined;
  }

  /**
   * Broadcast to course room
   */
  broadcastToCourse(courseId: string, event: string, data: any): void {
    this.io?.to(`course:${courseId}`).emit(event, data);
  }

  /**
   * Send to specific user
   */
  sendToUser(userId: string, event: string, data: any): void {
    this.io?.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Get IO instance
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }
}

export const educationWebSocket = EducationWebSocketServer.getInstance();
