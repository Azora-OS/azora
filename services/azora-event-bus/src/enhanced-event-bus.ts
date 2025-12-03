import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import Redis from 'ioredis';
import winston from 'winston';

export interface EventSchema {
  type: string;
  schema: Joi.ObjectSchema;
  version: string;
  description?: string;
}

export interface Event {
  id: string;
  type: string;
  version: string;
  payload: any;
  timestamp: string;
  source: string;
  correlationId?: string;
  causationId?: string;
  metadata?: Record<string, any>;
  retryCount?: number;
  maxRetries?: number;
}

export interface Subscription {
  id: string;
  serviceUrl: string;
  serviceId: string;
  events: Array<{
    type: string;
    version?: string;
    filter?: Record<string, any>;
  }>;
  createdAt: Date;
  lastActivity?: Date;
  status: 'active' | 'inactive' | 'suspended';
  deliveryOptions: {
    timeout: number;
    retries: number;
    retryDelay: number;
    deadLetterAfterRetries: boolean;
  };
}

export interface DeadLetterEvent extends Event {
  error: {
    message: string;
    stack?: string;
    code?: string;
    occurredAt: Date;
    retryCount: number;
    lastAttempt: Date;
  };
  subscriberInfo: {
    serviceUrl: string;
    serviceId: string;
  };
}

export interface EventBusMetrics {
  totalEventsPublished: number;
  totalEventsDelivered: number;
  totalEventsFailed: number;
  deadLetterQueueSize: number;
  activeSubscriptions: number;
  averageDeliveryTime: number;
  eventsPerSecond: number;
}

export class EnhancedEventBus {
  private subscribers: Map<string, Subscription> = new Map();
  private deadLetterQueue: DeadLetterEvent[] = [];
  private eventSchemas: Map<string, EventSchema> = new Map();
  private redis: Redis;
  private logger: winston.Logger;
  private metrics: EventBusMetrics;
  private deliveryTimes: number[] = [];
  private eventCounts: number[] = [];
  private lastMetricsReset = Date.now();

  constructor(redisUrl?: string) {
    this.redis = redisUrl ? new Redis(redisUrl) : new Redis();
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'event-bus.log' })
      ]
    });

    this.metrics = {
      totalEventsPublished: 0,
      totalEventsDelivered: 0,
      totalEventsFailed: 0,
      deadLetterQueueSize: 0,
      activeSubscriptions: 0,
      averageDeliveryTime: 0,
      eventsPerSecond: 0
    };

    this.initializeDefaultSchemas();
    this.setupRedisPersistence();
    this.startMetricsCollection();
  }

  // ========== SCHEMA MANAGEMENT ==========

  private initializeDefaultSchemas() {
    // User events
    this.registerSchema({
      type: 'user.created',
      version: '1.0.0',
      schema: Joi.object({
        userId: Joi.string().required(),
        email: Joi.string().email().required(),
        name: Joi.string().required(),
        role: Joi.string().valid('student', 'instructor', 'admin').required()
      }),
      description: 'User account created'
    });

    this.registerSchema({
      type: 'user.updated',
      version: '1.0.0',
      schema: Joi.object({
        userId: Joi.string().required(),
        changes: Joi.object().required(),
        updatedBy: Joi.string().required()
      }),
      description: 'User account updated'
    });

    // Course events
    this.registerSchema({
      type: 'course.created',
      version: '1.0.0',
      schema: Joi.object({
        courseId: Joi.string().required(),
        title: Joi.string().required(),
        description: Joi.string().required(),
        instructorId: Joi.string().required(),
        category: Joi.string().required(),
        price: Joi.number().min(0).required()
      }),
      description: 'Course created'
    });

    this.registerSchema({
      type: 'course.enrolled',
      version: '1.0.0',
      schema: Joi.object({
        courseId: Joi.string().required(),
        studentId: Joi.string().required(),
        enrolledAt: Joi.date().required(),
        paymentId: Joi.string().optional()
      }),
      description: 'Student enrolled in course'
    });

    // Payment events
    this.registerSchema({
      type: 'payment.completed',
      version: '1.0.0',
      schema: Joi.object({
        paymentId: Joi.string().required(),
        userId: Joi.string().required(),
        amount: Joi.number().positive().required(),
        currency: Joi.string().valid('USD', 'AZR', 'EUR').required(),
        method: Joi.string().valid('card', 'crypto', 'bank').required(),
        status: Joi.string().valid('completed', 'pending', 'failed').required()
      }),
      description: 'Payment completed'
    });

    // Job events
    this.registerSchema({
      type: 'job.applied',
      version: '1.0.0',
      schema: Joi.object({
        jobId: Joi.string().required(),
        applicantId: Joi.string().required(),
        appliedAt: Joi.date().required(),
        resumeUrl: Joi.string().uri().optional(),
        coverLetter: Joi.string().optional()
      }),
      description: 'Job application submitted'
    });

    // NFT events
    this.registerSchema({
      type: 'nft.minted',
      version: '1.0.0',
      schema: Joi.object({
        tokenId: Joi.string().required(),
        owner: Joi.string().required(),
        metadataUri: Joi.string().uri().required(),
        collectionId: Joi.string().optional(),
        mintedBy: Joi.string().required()
      }),
      description: 'NFT minted'
    });

    this.logger.info('Default event schemas initialized');
  }

  registerSchema(eventSchema: EventSchema) {
    const key = `${eventSchema.type}@${eventSchema.version}`;
    this.eventSchemas.set(key, eventSchema);
    this.logger.info(`Schema registered: ${key}`);
  }

  getSchema(type: string, version?: string): EventSchema | undefined {
    if (version) {
      return this.eventSchemas.get(`${type}@${version}`);
    }
    
    // Return latest version
    const schemas = Array.from(this.eventSchemas.entries())
      .filter(([key]) => key.startsWith(`${type}@`))
      .sort(([a], [b]) => b.localeCompare(a));
    
    return schemas.length > 0 ? schemas[0][1] : undefined;
  }

  validateEvent(event: Partial<Event>): { valid: boolean; errors?: string[] } {
    const schema = this.getSchema(event.type!, event.version);
    
    if (!schema) {
      return { valid: false, errors: [`No schema found for event type: ${event.type}@${event.version}`] };
    }

    const { error } = schema.schema.validate(event.payload);
    
    if (error) {
      return { 
        valid: false, 
        errors: error.details.map(detail => detail.message) 
      };
    }

    return { valid: true };
  }

  // ========== SUBSCRIPTION MANAGEMENT ==========

  subscribe(subscription: Omit<Subscription, 'id' | 'createdAt'>): string {
    const id = uuidv4();
    const fullSubscription: Subscription = {
      ...subscription,
      id,
      createdAt: new Date()
    };

    this.subscribers.set(id, fullSubscription);
    this.metrics.activeSubscriptions = this.subscribers.size;

    this.logger.info(`Service ${subscription.serviceId} subscribed to events:`, {
      events: subscription.events.map(e => e.type),
      serviceUrl: subscription.serviceUrl
    });

    // Persist to Redis
    this.persistSubscription(fullSubscription);

    return id;
  }

  unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscribers.get(subscriptionId);
    if (!subscription) {
      return false;
    }

    this.subscribers.delete(subscriptionId);
    this.metrics.activeSubscriptions = this.subscribers.size;

    this.logger.info(`Service ${subscription.serviceId} unsubscribed`);

    // Remove from Redis
    this.redis.del(`subscription:${subscriptionId}`);

    return true;
  }

  updateSubscription(subscriptionId: string, updates: Partial<Subscription>): boolean {
    const subscription = this.subscribers.get(subscriptionId);
    if (!subscription) {
      return false;
    }

    const updatedSubscription = { ...subscription, ...updates };
    this.subscribers.set(subscriptionId, updatedSubscription);

    this.logger.info(`Subscription ${subscriptionId} updated`);

    // Persist to Redis
    this.persistSubscription(updatedSubscription);

    return true;
  }

  getSubscriptions(serviceId?: string): Subscription[] {
    const subscriptions = Array.from(this.subscribers.values());
    
    if (serviceId) {
      return subscriptions.filter(s => s.serviceId === serviceId);
    }

    return subscriptions;
  }

  // ========== EVENT PUBLISHING ==========

  async publish(event: Omit<Event, 'id' | 'timestamp'>): Promise<{ success: boolean; deliveredCount: number; errors: string[] }> {
    const startTime = Date.now();
    const errors: string[] = [];
    let deliveredCount = 0;

    try {
      // Validate event
      const validation = this.validateEvent(event);
      if (!validation.valid) {
        throw new Error(`Event validation failed: ${validation.errors?.join(', ')}`);
      }

      // Create full event
      const fullEvent: Event = {
        ...event,
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        retryCount: 0,
        maxRetries: 3
      };

      this.metrics.totalEventsPublished++;
      this.eventCounts.push(Date.now());

      this.logger.info(`Publishing event: ${fullEvent.type}`, {
        eventId: fullEvent.id,
        source: fullEvent.source
      });

      // Find matching subscribers
      const matchingSubscribers = this.findMatchingSubscribers(fullEvent);

      // Deliver to subscribers
      for (const subscription of matchingSubscribers) {
        try {
          const delivered = await this.deliverToSubscriber(fullEvent, subscription);
          if (delivered) {
            deliveredCount++;
            subscription.lastActivity = new Date();
            this.metrics.totalEventsDelivered++;
          }
        } catch (error: any) {
          errors.push(`Failed to deliver to ${subscription.serviceId}: ${error.message}`);
          this.metrics.totalEventsFailed++;
        }
      }

      // Update delivery time metrics
      const deliveryTime = Date.now() - startTime;
      this.deliveryTimes.push(deliveryTime);
      if (this.deliveryTimes.length > 1000) {
        this.deliveryTimes = this.deliveryTimes.slice(-1000);
      }

      // Publish to Redis for real-time subscribers
      await this.redis.publish('events', JSON.stringify(fullEvent));

      this.logger.info(`Event published: ${fullEvent.type}`, {
        eventId: fullEvent.id,
        deliveredCount,
        errors: errors.length,
        deliveryTime
      });

      return { success: errors.length === 0, deliveredCount, errors };

    } catch (error: any) {
      this.logger.error('Error publishing event:', error);
      errors.push(error.message);
      return { success: false, deliveredCount, errors };
    }
  }

  private findMatchingSubscribers(event: Event): Subscription[] {
    return Array.from(this.subscribers.values()).filter(subscription => {
      if (subscription.status !== 'active') {
        return false;
      }

      return subscription.events.some(eventSubscription => {
        if (eventSubscription.type !== event.type) {
          return false;
        }

        if (eventSubscription.version && eventSubscription.version !== event.version) {
          return false;
        }

        if (eventSubscription.filter) {
          return this.matchesFilter(event.payload, eventSubscription.filter);
        }

        return true;
      });
    });
  }

  private matchesFilter(payload: any, filter: Record<string, any>): boolean {
    for (const [key, value] of Object.entries(filter)) {
      if (payload[key] !== value) {
        return false;
      }
    }
    return true;
  }

  private async deliverToSubscriber(event: Event, subscription: Subscription): Promise<boolean> {
    const startTime = Date.now();

    try {
      const response = await axios.post(
        `${subscription.serviceUrl}/events`,
        event,
        {
          timeout: subscription.deliveryOptions.timeout,
          headers: {
            'Content-Type': 'application/json',
            'X-Event-Id': event.id,
            'X-Event-Type': event.type,
            'X-Event-Source': event.source
          }
        }
      );

      if (response.status >= 200 && response.status < 300) {
        this.logger.debug(`Event delivered to ${subscription.serviceId}`, {
          eventId: event.id,
          deliveryTime: Date.now() - startTime
        });
        return true;
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }

    } catch (error: any) {
      this.logger.warn(`Failed to deliver event to ${subscription.serviceId}`, {
        eventId: event.id,
        error: error.message,
        deliveryTime: Date.now() - startTime
      });

      // Handle retry logic
      if (event.retryCount! < subscription.deliveryOptions.retries) {
        event.retryCount!++;
        
        // Schedule retry
        setTimeout(async () => {
          try {
            await this.deliverToSubscriber(event, subscription);
          } catch (retryError) {
            // If retry fails, add to dead letter queue
            await this.addToDeadLetterQueue(event, subscription, retryError as Error);
          }
        }, subscription.deliveryOptions.retryDelay * Math.pow(2, event.retryCount! - 1));

        return false;
      } else {
        // Max retries exceeded, add to dead letter queue
        await this.addToDeadLetterQueue(event, subscription, error);
        return false;
      }
    }
  }

  private async addToDeadLetterQueue(event: Event, subscription: Subscription, error: Error) {
    const deadLetterEvent: DeadLetterEvent = {
      ...event,
      error: {
        message: error.message,
        stack: error.stack,
        occurredAt: new Date(),
        retryCount: event.retryCount!,
        lastAttempt: new Date()
      },
      subscriberInfo: {
        serviceUrl: subscription.serviceUrl,
        serviceId: subscription.serviceId
      }
    };

    this.deadLetterQueue.push(deadLetterEvent);
    this.metrics.deadLetterQueueSize = this.deadLetterQueue.size;

    // Persist to Redis
    await this.redis.lpush('dead-letter-queue', JSON.stringify(deadLetterEvent));

    this.logger.error(`Event added to dead letter queue`, {
      eventId: event.id,
      serviceId: subscription.serviceId,
      error: error.message,
      retryCount: event.retryCount
    });
  }

  // ========== DEAD LETTER QUEUE MANAGEMENT ==========

  getDeadLetterQueue(serviceId?: string): DeadLetterEvent[] {
    if (serviceId) {
      return this.deadLetterQueue.filter(event => 
        event.subscriberInfo.serviceId === serviceId
      );
    }
    return this.deadLetterQueue;
  }

  async retryDeadLetterEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    const eventIndex = this.deadLetterQueue.findIndex(event => event.id === eventId);
    
    if (eventIndex === -1) {
      return { success: false, error: 'Event not found in dead letter queue' };
    }

    const deadLetterEvent = this.deadLetterQueue[eventIndex];
    
    // Remove from dead letter queue
    this.deadLetterQueue.splice(eventIndex, 1);
    this.metrics.deadLetterQueueSize = this.deadLetterQueue.size;

    // Remove from Redis
    await this.redis.lrem('dead-letter-queue', 1, JSON.stringify(deadLetterEvent));

    // Find the subscription
    const subscription = Array.from(this.subscribers.values()).find(
      s => s.serviceId === deadLetterEvent.subscriberInfo.serviceId
    );

    if (!subscription) {
      return { success: false, error: 'Subscription not found' };
    }

    try {
      // Reset retry count and deliver
      const event = { ...deadLetterEvent, retryCount: 0 };
      const delivered = await this.deliverToSubscriber(event, subscription);
      
      if (delivered) {
        this.logger.info(`Dead letter event retried successfully`, {
          eventId: deadLetterEvent.id,
          serviceId: subscription.serviceId
        });
        return { success: true };
      } else {
        // Add back to dead letter queue
        this.deadLetterQueue.push(deadLetterEvent);
        this.metrics.deadLetterQueueSize = this.deadLetterQueue.size;
        return { success: false, error: 'Delivery failed after retry' };
      }

    } catch (error: any) {
      // Add back to dead letter queue
      this.deadLetterQueue.push(deadLetterEvent);
      this.metrics.deadLetterQueueSize = this.deadLetterQueue.size;
      return { success: false, error: error.message };
    }
  }

  async purgeDeadLetterQueue(serviceId?: string): Promise<number> {
    let purgedCount = 0;

    if (serviceId) {
      const initialSize = this.deadLetterQueue.length;
      this.deadLetterQueue = this.deadLetterQueue.filter(
        event => event.subscriberInfo.serviceId !== serviceId
      );
      purgedCount = initialSize - this.deadLetterQueue.length;

      // Remove from Redis
      const events = await this.redis.lrange('dead-letter-queue', 0, -1);
      for (const eventStr of events) {
        const event = JSON.parse(eventStr);
        if (event.subscriberInfo.serviceId === serviceId) {
          await this.redis.lrem('dead-letter-queue', 1, eventStr);
        }
      }
    } else {
      purgedCount = this.deadLetterQueue.length;
      this.deadLetterQueue = [];
      await this.redis.del('dead-letter-queue');
    }

    this.metrics.deadLetterQueueSize = this.deadLetterQueue.size;

    this.logger.info(`Dead letter queue purged`, {
      purgedCount,
      serviceId: serviceId || 'all'
    });

    return purgedCount;
  }

  // ========== METRICS AND MONITORING ==========

  getMetrics(): EventBusMetrics {
    // Calculate average delivery time
    const avgDeliveryTime = this.deliveryTimes.length > 0
      ? this.deliveryTimes.reduce((sum, time) => sum + time, 0) / this.deliveryTimes.length
      : 0;

    // Calculate events per second
    const now = Date.now();
    const timeWindow = 60000; // 1 minute
    const recentEvents = this.eventCounts.filter(time => now - time < timeWindow);
    const eventsPerSecond = recentEvents.length / (timeWindow / 1000);

    return {
      ...this.metrics,
      averageDeliveryTime: avgDeliveryTime,
      eventsPerSecond
    };
  }

  private startMetricsCollection() {
    setInterval(() => {
      // Clean old metrics
      const now = Date.now();
      const timeWindow = 300000; // 5 minutes
      
      this.deliveryTimes = this.deliveryTimes.filter(time => now - time < timeWindow);
      this.eventCounts = this.eventCounts.filter(time => now - time < timeWindow);
      
      // Reset counters periodically
      if (now - this.lastMetricsReset > 3600000) { // 1 hour
        this.metrics.totalEventsPublished = 0;
        this.metrics.totalEventsDelivered = 0;
        this.metrics.totalEventsFailed = 0;
        this.lastMetricsReset = now;
      }

    }, 60000); // Update every minute
  }

  // ========== PERSISTENCE ==========

  private async setupRedisPersistence() {
    // Load subscriptions from Redis
    try {
      const keys = await this.redis.keys('subscription:*');
      for (const key of keys) {
        const subscriptionData = await this.redis.get(key);
        if (subscriptionData) {
          const subscription = JSON.parse(subscriptionData);
          subscription.createdAt = new Date(subscription.createdAt);
          subscription.lastActivity = subscription.lastActivity ? new Date(subscription.lastActivity) : undefined;
          this.subscribers.set(subscription.id, subscription);
        }
      }

      // Load dead letter queue from Redis
      const deadLetterEvents = await this.redis.lrange('dead-letter-queue', 0, -1);
      for (const eventStr of deadLetterEvents) {
        const event = JSON.parse(eventStr);
        event.error.occurredAt = new Date(event.error.occurredAt);
        event.error.lastAttempt = new Date(event.error.lastAttempt);
        this.deadLetterQueue.push(event);
      }

      this.metrics.activeSubscriptions = this.subscribers.size;
      this.metrics.deadLetterQueueSize = this.deadLetterQueue.size;

      this.logger.info('Event bus state loaded from Redis', {
        subscriptions: this.subscribers.size,
        deadLetterEvents: this.deadLetterQueue.size
      });

    } catch (error) {
      this.logger.error('Failed to load state from Redis:', error);
    }
  }

  private async persistSubscription(subscription: Subscription) {
    try {
      await this.redis.setex(
        `subscription:${subscription.id}`,
        86400, // 24 hours TTL
        JSON.stringify(subscription)
      );
    } catch (error) {
      this.logger.error('Failed to persist subscription:', error);
    }
  }

  // ========== HEALTH CHECKS ==========

  async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    const details = {
      redis: 'unknown',
      subscriptions: this.subscribers.size,
      deadLetterQueueSize: this.deadLetterQueue.size,
      metrics: this.getMetrics()
    };

    try {
      // Check Redis connection
      await this.redis.ping();
      details.redis = 'healthy';
    } catch (error) {
      details.redis = 'unhealthy';
      return { healthy: false, details };
    }

    return { healthy: true, details };
  }

  // ========== CLEANUP ==========

  async shutdown() {
    this.logger.info('Shutting down event bus...');
    
    if (this.redis) {
      await this.redis.quit();
    }
    
    this.logger.info('Event bus shutdown complete');
  }
}

export const enhancedEventBus = new EnhancedEventBus();
