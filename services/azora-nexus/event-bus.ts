// 🌐 Azora Nexus Event Bus - Ubuntu Real-Time Synchronization
import { EventEmitter } from 'events';
import { Server as SocketServer } from 'socket.io';
import { cache } from '../database/redis-client';

export interface AzoraEvent {
  type: string;
  payload: any;
  timestamp: number;
  source: string;
  userId?: string;
}

class AzoraNexusEventBus extends EventEmitter {
  private io?: SocketServer;
  private eventHistory: AzoraEvent[] = [];
  private maxHistory = 1000;

  initialize(io: SocketServer) {
    this.io = io;
    console.log('🌐 Azora Nexus Event Bus initialized - Ubuntu real-time active');
  }

  async publish(event: AzoraEvent) {
    const enrichedEvent = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      id: `${event.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    // Emit to local listeners
    this.emit(event.type, enrichedEvent);
    this.emit('*', enrichedEvent);

    // Broadcast via WebSocket
    if (this.io) {
      this.io.emit(event.type, enrichedEvent);
      if (event.userId) {
        this.io.to(`user:${event.userId}`).emit(event.type, enrichedEvent);
      }
    }

    // Cache event
    await cache.set(`event:${enrichedEvent.id}`, enrichedEvent, 3600);

    // Store in history
    this.eventHistory.push(enrichedEvent);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.shift();
    }

    return enrichedEvent;
  }

  subscribe(eventType: string, handler: (event: AzoraEvent) => void) {
    this.on(eventType, handler);
    return () => this.off(eventType, handler);
  }

  subscribeAll(handler: (event: AzoraEvent) => void) {
    this.on('*', handler);
    return () => this.off('*', handler);
  }

  getHistory(eventType?: string, limit = 100): AzoraEvent[] {
    const events = eventType 
      ? this.eventHistory.filter(e => e.type === eventType)
      : this.eventHistory;
    return events.slice(-limit);
  }
}

export const nexus = new AzoraNexusEventBus();

// Ubuntu Event Types
export const EventTypes = {
  // Education Events
  COURSE_ENROLLED: 'education.course.enrolled',
  LESSON_COMPLETED: 'education.lesson.completed',
  ASSESSMENT_SUBMITTED: 'education.assessment.submitted',
  CERTIFICATE_ISSUED: 'education.certificate.issued',
  
  // Financial Events
  WALLET_CREATED: 'finance.wallet.created',
  TRANSACTION_COMPLETED: 'finance.transaction.completed',
  MINING_REWARD: 'finance.mining.reward',
  UBI_DISTRIBUTED: 'finance.ubi.distributed',
  
  // Marketplace Events
  JOB_POSTED: 'marketplace.job.posted',
  APPLICATION_SUBMITTED: 'marketplace.application.submitted',
  CONTRACT_SIGNED: 'marketplace.contract.signed',
  PAYMENT_RELEASED: 'marketplace.payment.released',
  
  // System Events
  USER_REGISTERED: 'system.user.registered',
  USER_LOGIN: 'system.user.login',
  SYSTEM_ALERT: 'system.alert',
  HEALTH_CHECK: 'system.health'
};

export default nexus;
