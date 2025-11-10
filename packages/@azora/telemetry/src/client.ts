/**
 * Azora OS Telemetry Client
 * Tracks component usage, interactions, and performance
 * Pipes to services/analytics-service
 */

export interface TelemetryEvent {
  id?: string;
  type: string;
  timestamp?: Date;
  service: string;
  userId?: string;
  sessionId?: string;
  data: Record<string, any>;
}

export interface ComponentEvent {
  componentName: string;
  componentType: 'mount' | 'unmount' | 'interaction' | 'render' | 'error';
  props?: Record<string, any>;
  duration?: number;
  error?: string;
  path?: string;
  metadata?: Record<string, any>;
}

export interface TelemetryConfig {
  analyticsUrl?: string;
  service: string;
  enabled?: boolean;
  batchSize?: number;
  flushInterval?: number;
  debug?: boolean;
}

/**
 * Telemetry Client
 * Batches events and sends to analytics service
 */
export class TelemetryClient {
  private config: Required<TelemetryConfig>;
  private eventQueue: TelemetryEvent[] = [];
  private flushTimer?: NodeJS.Timeout;
  private sessionId: string;

  constructor(config: TelemetryConfig) {
    this.config = {
      analyticsUrl: config.analyticsUrl || 'http://localhost:8086',
      service: config.service,
      enabled: config.enabled !== false,
      batchSize: config.batchSize || 10,
      flushInterval: config.flushInterval || 5000,
      debug: config.debug || false,
    };

    this.sessionId = this.generateSessionId();
    
    if (this.config.enabled) {
      this.startFlushTimer();
    }

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  /**
   * Track a component mount
   */
  trackComponentMount(componentName: string, props?: Record<string, any>, metadata?: Record<string, any>) {
    this.trackComponent({
      componentName,
      componentType: 'mount',
      props,
      metadata,
      path: this.getCurrentPath(),
    });
  }

  /**
   * Track a component unmount
   */
  trackComponentUnmount(componentName: string, duration?: number) {
    this.trackComponent({
      componentName,
      componentType: 'unmount',
      duration,
      path: this.getCurrentPath(),
    });
  }

  /**
   * Track a component interaction (click, hover, etc.)
   */
  trackComponentInteraction(componentName: string, interactionType: string, metadata?: Record<string, any>) {
    this.trackComponent({
      componentName,
      componentType: 'interaction',
      metadata: {
        ...metadata,
        interactionType,
      },
      path: this.getCurrentPath(),
    });
  }

  /**
   * Track a component render (with duration)
   */
  trackComponentRender(componentName: string, duration: number, renderCount?: number) {
    this.trackComponent({
      componentName,
      componentType: 'render',
      duration,
      metadata: { renderCount },
      path: this.getCurrentPath(),
    });
  }

  /**
   * Track a component error
   */
  trackComponentError(componentName: string, error: Error, metadata?: Record<string, any>) {
    this.trackComponent({
      componentName,
      componentType: 'error',
      error: error.message,
      metadata: {
        ...metadata,
        stack: error.stack,
        name: error.name,
      },
      path: this.getCurrentPath(),
    });
  }

  /**
   * Generic component tracking
   */
  private trackComponent(event: ComponentEvent) {
    this.track({
      type: `component.${event.componentType}`,
      service: this.config.service,
      sessionId: this.sessionId,
      data: {
        component: event.componentName,
        props: event.props,
        duration: event.duration,
        error: event.error,
        path: event.path,
        ...event.metadata,
      },
    });
  }

  /**
   * Generic event tracking
   */
  track(event: TelemetryEvent) {
    if (!this.config.enabled) return;

    const fullEvent: TelemetryEvent = {
      ...event,
      id: event.id || this.generateEventId(),
      timestamp: event.timestamp || new Date(),
      sessionId: event.sessionId || this.sessionId,
    };

    if (this.config.debug) {
      console.log('[Telemetry]', fullEvent);
    }

    this.eventQueue.push(fullEvent);

    // Flush if batch size reached
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Flush events to analytics service
   */
  async flush() {
    if (this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const response = await fetch(`${this.config.analyticsUrl}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: eventsToSend,
          batch: true,
        }),
      });

      if (!response.ok) {
        console.error('[Telemetry] Failed to send events:', response.statusText);
        // Re-queue events on failure
        this.eventQueue.unshift(...eventsToSend);
      }
    } catch (error) {
      console.error('[Telemetry] Error sending events:', error);
      // Re-queue events on error
      this.eventQueue.unshift(...eventsToSend);
    }
  }

  /**
   * Start flush timer
   */
  private startFlushTimer() {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Stop flush timer
   */
  stopFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current page path
   */
  private getCurrentPath(): string {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '';
  }
}

/**
 * Global telemetry client instance
 */
let globalClient: TelemetryClient | null = null;

/**
 * Initialize global telemetry client
 */
export function initTelemetry(config: TelemetryConfig): TelemetryClient {
  globalClient = new TelemetryClient(config);
  return globalClient;
}

/**
 * Get global telemetry client
 */
export function getTelemetry(): TelemetryClient | null {
  return globalClient;
}
