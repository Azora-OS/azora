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
export declare class TelemetryClient {
    private config;
    private eventQueue;
    private flushTimer?;
    private sessionId;
    constructor(config: TelemetryConfig);
    /**
     * Track a component mount
     */
    trackComponentMount(componentName: string, props?: Record<string, any>, metadata?: Record<string, any>): void;
    /**
     * Track a component unmount
     */
    trackComponentUnmount(componentName: string, duration?: number): void;
    /**
     * Track a component interaction (click, hover, etc.)
     */
    trackComponentInteraction(componentName: string, interactionType: string, metadata?: Record<string, any>): void;
    /**
     * Track a component render (with duration)
     */
    trackComponentRender(componentName: string, duration: number, renderCount?: number): void;
    /**
     * Track a component error
     */
    trackComponentError(componentName: string, error: Error, metadata?: Record<string, any>): void;
    /**
     * Generic component tracking
     */
    private trackComponent;
    /**
     * Generic event tracking
     */
    track(event: TelemetryEvent): void;
    /**
     * Flush events to analytics service
     */
    flush(): Promise<void>;
    /**
     * Start flush timer
     */
    private startFlushTimer;
    /**
     * Stop flush timer
     */
    stopFlushTimer(): void;
    /**
     * Generate unique session ID
     */
    private generateSessionId;
    /**
     * Generate unique event ID
     */
    private generateEventId;
    /**
     * Get current page path
     */
    private getCurrentPath;
}
/**
 * Initialize global telemetry client
 */
export declare function initTelemetry(config: TelemetryConfig): TelemetryClient;
/**
 * Get global telemetry client
 */
export declare function getTelemetry(): TelemetryClient | null;
//# sourceMappingURL=client.d.ts.map