/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

REALTIME EVENTS
Event handlers for WebSocket real-time updates
*/

import { wsClient } from './websocket-client';

export class RealtimeEvents {
  initialize(userId: string, token: string): void {
    wsClient.connect(token);
    this.setupHandlers(userId);
  }

  private setupHandlers(userId: string): void {
    // Learning events
    wsClient.on('course:progress', (data) => {
      this.handleCourseProgress(data);
    });

    wsClient.on('assessment:completed', (data) => {
      this.handleAssessmentCompleted(data);
    });

    // Financial events
    wsClient.on('mining:reward', (data) => {
      this.handleMiningReward(data);
    });

    wsClient.on('transaction:completed', (data) => {
      this.handleTransaction(data);
    });

    // Marketplace events
    wsClient.on('job:matched', (data) => {
      this.handleJobMatch(data);
    });

    wsClient.on('application:status', (data) => {
      this.handleApplicationStatus(data);
    });

    // System events
    wsClient.on('notification', (data) => {
      this.handleNotification(data);
    });

    wsClient.on('system:update', (data) => {
      this.handleSystemUpdate(data);
    });
  }

  private handleCourseProgress(data: any): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('azora:course:progress', { detail: data }));
    }
  }

  private handleAssessmentCompleted(data: any): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('azora:assessment:completed', { detail: data }));
    }
  }

  private handleMiningReward(data: any): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('azora:mining:reward', { detail: data }));
    }
  }

  private handleTransaction(data: any): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('azora:transaction', { detail: data }));
    }
  }

  private handleJobMatch(data: any): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('azora:job:matched', { detail: data }));
    }
  }

  private handleApplicationStatus(data: any): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('azora:application:status', { detail: data }));
    }
  }

  private handleNotification(data: any): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('azora:notification', { detail: data }));
    }
  }

  private handleSystemUpdate(data: any): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('azora:system:update', { detail: data }));
    }
  }

  disconnect(): void {
    wsClient.disconnect();
  }
}

export const realtimeEvents = new RealtimeEvents();
