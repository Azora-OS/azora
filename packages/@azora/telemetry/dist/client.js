"use strict";
/**
 * Azora OS Telemetry Client
 * Tracks component usage, interactions, and performance
 * Pipes to services/analytics-service
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryClient = void 0;
exports.initTelemetry = initTelemetry;
exports.getTelemetry = getTelemetry;
/**
 * Telemetry Client
 * Batches events and sends to analytics service
 */
class TelemetryClient {
    constructor(config) {
        this.eventQueue = [];
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
    trackComponentMount(componentName, props, metadata) {
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
    trackComponentUnmount(componentName, duration) {
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
    trackComponentInteraction(componentName, interactionType, metadata) {
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
    trackComponentRender(componentName, duration, renderCount) {
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
    trackComponentError(componentName, error, metadata) {
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
    trackComponent(event) {
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
    track(event) {
        if (!this.config.enabled)
            return;
        const fullEvent = {
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
        if (this.eventQueue.length === 0)
            return;
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
        }
        catch (error) {
            console.error('[Telemetry] Error sending events:', error);
            // Re-queue events on error
            this.eventQueue.unshift(...eventsToSend);
        }
    }
    /**
     * Start flush timer
     */
    startFlushTimer() {
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
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Generate unique event ID
     */
    generateEventId() {
        return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get current page path
     */
    getCurrentPath() {
        if (typeof window !== 'undefined') {
            return window.location.pathname;
        }
        return '';
    }
}
exports.TelemetryClient = TelemetryClient;
/**
 * Global telemetry client instance
 */
let globalClient = null;
/**
 * Initialize global telemetry client
 */
function initTelemetry(config) {
    globalClient = new TelemetryClient(config);
    return globalClient;
}
/**
 * Get global telemetry client
 */
function getTelemetry() {
    return globalClient;
}
