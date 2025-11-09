/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { EventEmitter } from 'events'

// Basic constitutional metadata placeholder; extend when wiring governor fully
export interface ConstitutionalCheckResult {
  rule: string
  result: 'passed' | 'blocked' | 'warn'
  message?: string
}

export interface EventEnvelope<TPayload> {
  name: keyof EventMap
  payload: TPayload
  meta: {
    timestamp: number
    requestId: string
    constitutionalChecks?: ConstitutionalCheckResult[]
  }
}

// Event catalog typing
export interface EventMap {
  'brain.lesson.completed': {
    studentId: string
    lessonId: string
    score: number
    timestamp: number
  }
  'organ.health.updated': {
    organ: string
    status: 'healthy' | 'degraded' | 'unhealthy'
    healthScore: number
    details?: Record<string, any>
    timestamp: number
  }
  'system.ready': { timestamp: number }
  'system.shutdown': { timestamp: number }
}

// Simple in-memory replay buffer for debugging
class ReplayBuffer {
  private buffer: EventEnvelope<any>[] = []
  constructor(private capacity: number = 200) {}

  push(evt: EventEnvelope<any>) {
    if (this.buffer.length >= this.capacity) {
      this.buffer.shift()
    }
    this.buffer.push(evt)
  }

  getAll(): EventEnvelope<any>[] {
    return [...this.buffer]
  }
}

class TypedEventBus extends EventEmitter {
  private replay = new ReplayBuffer(200)

  emitTyped<K extends keyof EventMap>(name: K, payload: EventMap[K], meta?: Partial<EventEnvelope<EventMap[K]>['meta']>): boolean {
    const envelope: EventEnvelope<EventMap[K]> = {
      name,
      payload,
      meta: {
        timestamp: Date.now(),
        requestId: meta?.requestId || `req-${Math.random().toString(36).slice(2)}`,
        constitutionalChecks: meta?.constitutionalChecks,
      },
    }
    this.replay.push(envelope)
    return super.emit(name as string, envelope)
  }

  onTyped<K extends keyof EventMap>(name: K, listener: (envelope: EventEnvelope<EventMap[K]>) => void): this {
    return super.on(name as string, listener)
  }

  getReplay(): EventEnvelope<any>[] {
    return this.replay.getAll()
  }
}

// Singleton nervous system instance
export const nervousSystem = new TypedEventBus()
export type { EventMap }
