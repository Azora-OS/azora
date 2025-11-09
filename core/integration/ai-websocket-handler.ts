/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

AI WEBSOCKET HANDLER
Real-time AI recommendations and Elara tutoring via WebSocket
*/

import { Server as SocketIOServer, Socket } from 'socket.io';
import { aiHub } from './ai-integration-hub';

export class AIWebSocketHandler {
  private io: SocketIOServer;
  private activeConnections: Map<string, Socket> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupHandlers();
  }

  private setupHandlers() {
    this.io.on('connection', (socket: Socket) => {
      const userId = (socket.handshake.query.userId as string) || socket.id;
      this.activeConnections.set(userId, socket);

      // Elara AI Tutor Events
      socket.on('elara:ask', async (data) => {
        await this.handleElaraQuestion(socket, userId, data);
      });

      socket.on('elara:lesson', async (data) => {
        await this.handleLessonRequest(socket, userId, data);
      });

      // Constitutional AI Events
      socket.on('constitutional:validate', async (data) => {
        await this.handleConstitutionalValidation(socket, userId, data);
      });

      // Guardian Oracle Events
      socket.on('guardian:verify', async (data) => {
        await this.handleGuardianVerification(socket, userId, data);
      });

      // Real-time Recommendations
      socket.on('recommendations:get', async (data) => {
        await this.handleRecommendationsRequest(socket, userId, data);
      });

      // Start real-time recommendation stream
      this.startRecommendationStream(socket, userId);

      socket.on('disconnect', () => {
        this.activeConnections.delete(userId);
      });
    });
  }

  private async handleElaraQuestion(socket: Socket, userId: string, data: any) {
    try {
      const response = await aiHub.elara.provideTutoring(data.question, data.context);
      
      socket.emit('elara:response', {
        answer: response,
        confidence: 0.94,
        timestamp: new Date().toISOString()
      });

      // Send follow-up recommendations
      const recs = await aiHub.recommendations.getPersonalizedRecommendations(userId, data);
      socket.emit('recommendations:update', recs.priority);
    } catch (error) {
      socket.emit('elara:error', { error: 'Failed to process question' });
    }
  }

  private async handleLessonRequest(socket: Socket, userId: string, data: any) {
    try {
      const result = await aiHub.processLearningRequest({
        studentId: userId,
        studentProfile: data.profile,
        topic: data.topic
      });

      socket.emit('elara:lesson', result);
    } catch (error) {
      socket.emit('elara:error', { error: 'Failed to generate lesson' });
    }
  }

  private async handleConstitutionalValidation(socket: Socket, userId: string, data: any) {
    try {
      const validation = await aiHub.constitutional.governDecision(data.action, { userId });
      
      socket.emit('constitutional:result', {
        approved: validation.approved,
        reason: validation.reason,
        alternatives: validation.alternatives,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      socket.emit('constitutional:error', { error: 'Validation failed' });
    }
  }

  private async handleGuardianVerification(socket: Socket, userId: string, data: any) {
    try {
      const verification = await aiHub.constitutional.guardianCourt.verifyContent({
        content: data.content,
        category: data.category,
        submittedBy: userId
      });

      socket.emit('guardian:result', verification);
    } catch (error) {
      socket.emit('guardian:error', { error: 'Verification failed' });
    }
  }

  private async handleRecommendationsRequest(socket: Socket, userId: string, data: any) {
    try {
      const recommendations = await aiHub.recommendations.getPersonalizedRecommendations(
        userId,
        data.context
      );

      socket.emit('recommendations:result', recommendations);
    } catch (error) {
      socket.emit('recommendations:error', { error: 'Failed to get recommendations' });
    }
  }

  private startRecommendationStream(socket: Socket, userId: string) {
    const interval = setInterval(async () => {
      if (!this.activeConnections.has(userId)) {
        clearInterval(interval);
        return;
      }

      try {
        const insights = await aiHub.getRealTimeInsights(userId, {
          timestamp: new Date()
        });

        socket.emit('ai:insights', insights);
      } catch (error) {
        // Silent fail
      }
    }, 30000); // Every 30 seconds

    socket.on('disconnect', () => clearInterval(interval));
  }

  // Broadcast to all connected users
  async broadcastAIUpdate(event: string, data: any) {
    this.io.emit(event, data);
  }

  // Send to specific user
  async sendToUser(userId: string, event: string, data: any) {
    const socket = this.activeConnections.get(userId);
    if (socket) {
      socket.emit(event, data);
    }
  }
}

export let aiWebSocketHandler: AIWebSocketHandler;

export const initializeAIWebSocket = (io: SocketIOServer) => {
  aiWebSocketHandler = new AIWebSocketHandler(io);
  return aiWebSocketHandler;
};
