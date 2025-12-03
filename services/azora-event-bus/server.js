const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { EnhancedEventBus } = require('./src/enhanced-event-bus');
const Joi = require('joi');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3020;

// Initialize Enhanced Event Bus
const eventBus = new EnhancedEventBus(process.env.REDIS_URL);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Ubuntu Rate Limiting
const ubuntuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { 
    error: 'Ubuntu rate limit exceeded', 
    ubuntu: 'Please slow down for event harmony' 
  }
});
app.use(ubuntuLimiter);

// Middleware to get user ID from header
const getUserId = (req) => {
  return req.headers['x-user-id'] || req.user?.id || 'user_123456789';
};

// Health Check
app.get('/health', async (req, res) => {
  try {
    const health = await eventBus.healthCheck();
    
    res.json({
      service: 'azora-event-bus',
      status: health.healthy ? 'healthy' : 'unhealthy',
      ubuntu: 'I connect because we communicate together',
      timestamp: new Date().toISOString(),
      port: PORT,
      health,
      features: {
        schemaValidation: '✅ Active',
        deadLetterQueue: '✅ Active',
        redisPersistence: '✅ Active',
        retryLogic: '✅ Active',
        metrics: '✅ Active',
        filtering: '✅ Active'
      }
    });
  } catch (error) {
    res.status(500).json({
      service: 'azora-event-bus',
      status: 'unhealthy',
      error: error.message,
      ubuntu: 'We handle health check errors with Ubuntu grace'
    });
  }
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'Ngiyakwazi ngoba sikwazi - I can because we can',
    principles: [
      'My events strengthen our collective',
      'My communication builds community understanding',
      'My reliability fosters shared trust',
      'My patterns create systemic harmony'
    ],
    service: 'azora-event-bus',
    ubuntu: 'Ubuntu event-driven excellence'
  });
});

// ========== SCHEMA MANAGEMENT ENDPOINTS ==========

// POST /api/schemas/register - Register event schema
app.post('/api/schemas/register', async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      type,
      version = '1.0.0',
      schema,
      description
    } = req.body;

    if (!type || !schema) {
      return res.status(400).json({
        error: 'Event type and schema are required',
        ubuntu: 'Ubuntu clarity: Complete information enables proper validation'
      });
    }

    // Validate Joi schema
    let joiSchema;
    try {
      joiSchema = Joi.object(schema);
    } catch (schemaError) {
      return res.status(400).json({
        error: 'Invalid Joi schema',
        ubuntu: 'Ubuntu guidance: Provide valid schema definition'
      });
    }

    eventBus.registerSchema({
      type,
      version,
      schema: joiSchema,
      description
    });

    console.log(`📋 Schema registered: ${type}@${version} by user ${userId}`);

    res.status(201).json({
      success: true,
      schema: { type, version, description },
      ubuntu: 'Schema registered with Ubuntu validation'
    });
  } catch (error) {
    console.error('Error registering schema:', error);
    res.status(500).json({
      error: 'Failed to register schema',
      ubuntu: 'We handle schema errors with Ubuntu grace'
    });
  }
});

// GET /api/schemas - Get all schemas
app.get('/api/schemas', (req, res) => {
  try {
    const schemas = eventBus.getEventSchemas();
    
    res.json({
      schemas,
      ubuntu: 'Schemas provide Ubuntu event structure'
    });
  } catch (error) {
    console.error('Error fetching schemas:', error);
    res.status(500).json({
      error: 'Failed to fetch schemas',
      ubuntu: 'We handle schema retrieval errors with Ubuntu grace'
    });
  }
});

// GET /api/schemas/:type - Get schema for event type
app.get('/api/schemas/:type', (req, res) => {
  try {
    const { type } = req.params;
    const { version } = req.query;
    
    const schema = eventBus.getSchema(type, version);
    
    if (!schema) {
      return res.status(404).json({
        error: 'Schema not found',
        ubuntu: 'Ubuntu guidance: Check event type and version'
      });
    }

    res.json({
      schema,
      ubuntu: 'Schema retrieved with Ubuntu clarity'
    });
  } catch (error) {
    console.error('Error fetching schema:', error);
    res.status(500).json({
      error: 'Failed to fetch schema',
      ubuntu: 'We handle schema errors with Ubuntu grace'
    });
  }
});

// ========== SUBSCRIPTION MANAGEMENT ENDPOINTS ==========

// POST /api/subscriptions - Subscribe to events
app.post('/api/subscriptions', async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      serviceUrl,
      serviceId,
      events,
      deliveryOptions = {
        timeout: 5000,
        retries: 3,
        retryDelay: 1000,
        deadLetterAfterRetries: true
      }
    } = req.body;

    if (!serviceUrl || !serviceId || !events || !Array.isArray(events)) {
      return res.status(400).json({
        error: 'Service URL, service ID, and events array are required',
        ubuntu: 'Ubuntu clarity: Complete information enables proper subscription'
      });
    }

    const subscriptionId = eventBus.subscribe({
      serviceUrl,
      serviceId,
      events,
      status: 'active',
      deliveryOptions
    });

    console.log(`📢 Service ${serviceId} subscribed to events: ${events.map(e => e.type).join(', ')}`);

    res.status(201).json({
      success: true,
      subscriptionId,
      ubuntu: 'Subscription created with Ubuntu community spirit'
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      error: 'Failed to create subscription',
      ubuntu: 'We handle subscription errors with Ubuntu grace'
    });
  }
});

// DELETE /api/subscriptions/:id - Unsubscribe from events
app.delete('/api/subscriptions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const success = eventBus.unsubscribe(id);
    
    if (success) {
      console.log(`❌ Subscription ${id} unsubscribed`);
      res.json({
        success: true,
        ubuntu: 'Subscription removed with Ubuntu respect'
      });
    } else {
      res.status(404).json({
        error: 'Subscription not found',
        ubuntu: 'Ubuntu guidance: Check subscription ID'
      });
    }
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({
      error: 'Failed to unsubscribe',
      ubuntu: 'We handle unsubscription errors with Ubuntu grace'
    });
  }
});

// PUT /api/subscriptions/:id - Update subscription
app.put('/api/subscriptions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const success = eventBus.updateSubscription(id, updates);
    
    if (success) {
      console.log(`🔄 Subscription ${id} updated`);
      res.json({
        success: true,
        ubuntu: 'Subscription updated with Ubuntu care'
      });
    } else {
      res.status(404).json({
        error: 'Subscription not found',
        ubuntu: 'Ubuntu guidance: Check subscription ID'
      });
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      error: 'Failed to update subscription',
      ubuntu: 'We handle update errors with Ubuntu grace'
    });
  }
});

// GET /api/subscriptions - Get subscriptions
app.get('/api/subscriptions', (req, res) => {
  try {
    const { serviceId } = req.query;
    const subscriptions = eventBus.getSubscriptions(serviceId);
    
    res.json({
      subscriptions,
      ubuntu: 'Subscriptions reflect Ubuntu event community'
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({
      error: 'Failed to fetch subscriptions',
      ubuntu: 'We handle subscription errors with Ubuntu grace'
    });
  }
});

// ========== EVENT PUBLISHING ENDPOINTS ==========

// POST /api/events/publish - Publish event
app.post('/api/events/publish', async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      type,
      version = '1.0.0',
      payload,
      source,
      correlationId,
      causationId,
      metadata
    } = req.body;

    if (!type || !payload || !source) {
      return res.status(400).json({
        error: 'Event type, payload, and source are required',
        ubuntu: 'Ubuntu clarity: Complete information enables proper publishing'
      });
    }

    const result = await eventBus.publish({
      type,
      version,
      payload,
      source,
      correlationId,
      causationId,
      metadata: {
        ...metadata,
        ubuntu_event: 'Ubuntu community communication',
        publishedBy: userId
      }
    });

    console.log(`📨 Event published: ${type} by ${source}`);

    res.json({
      success: result.success,
      deliveredCount: result.deliveredCount,
      errors: result.errors,
      ubuntu: 'Event published with Ubuntu communication'
    });
  } catch (error) {
    console.error('Error publishing event:', error);
    res.status(500).json({
      error: 'Failed to publish event',
      message: error.message,
      ubuntu: 'We handle publishing errors with Ubuntu grace'
    });
  }
});

// POST /api/events/batch - Publish multiple events
app.post('/api/events/batch', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { events } = req.body;

    if (!events || !Array.isArray(events)) {
      return res.status(400).json({
        error: 'Events array is required',
        ubuntu: 'Ubuntu clarity: Provide events for batch publishing'
      });
    }

    const results = [];
    let totalDelivered = 0;
    let totalErrors = 0;

    for (const eventData of events) {
      try {
        const result = await eventBus.publish({
          ...eventData,
          metadata: {
            ...eventData.metadata,
            ubuntu_event: 'Ubuntu community communication',
            publishedBy: userId
          }
        });
        
        results.push({
          type: eventData.type,
          success: result.success,
          deliveredCount: result.deliveredCount,
          errors: result.errors
        });

        totalDelivered += result.deliveredCount;
        totalErrors += result.errors.length;

      } catch (error) {
        results.push({
          type: eventData.type,
          success: false,
          deliveredCount: 0,
          errors: [error.message]
        });
        totalErrors++;
      }
    }

    console.log(`📦 Batch published: ${events.length} events, ${totalDelivered} delivered, ${totalErrors} errors`);

    res.json({
      success: totalErrors === 0,
      totalEvents: events.length,
      totalDelivered,
      totalErrors,
      results,
      ubuntu: 'Batch published with Ubuntu efficiency'
    });
  } catch (error) {
    console.error('Error publishing batch:', error);
    res.status(500).json({
      error: 'Failed to publish batch',
      ubuntu: 'We handle batch errors with Ubuntu grace'
    });
  }
});

// ========== DEAD LETTER QUEUE ENDPOINTS ==========

// GET /api/dead-letter-queue - Get dead letter queue
app.get('/api/dead-letter-queue', (req, res) => {
  try {
    const { serviceId, limit = 100 } = req.query;
    const deadLetterQueue = eventBus.getDeadLetterQueue(serviceId);
    
    const limitedQueue = deadLetterQueue.slice(0, parseInt(limit));
    
    res.json({
      deadLetterQueue: limitedQueue,
      totalSize: deadLetterQueue.length,
      ubuntu: 'Dead letter queue shows Ubuntu communication challenges'
    });
  } catch (error) {
    console.error('Error fetching dead letter queue:', error);
    res.status(500).json({
      error: 'Failed to fetch dead letter queue',
      ubuntu: 'We handle dead letter errors with Ubuntu grace'
    });
  }
});

// POST /api/dead-letter-queue/:eventId/retry - Retry dead letter event
app.post('/api/dead-letter-queue/:eventId/retry', async (req, res) => {
  try {
    const { eventId } = req.params;
    const result = await eventBus.retryDeadLetterEvent(eventId);
    
    if (result.success) {
      console.log(`🔄 Dead letter event retried: ${eventId}`);
      res.json({
        success: true,
        ubuntu: 'Event retried with Ubuntu persistence'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        ubuntu: 'Ubuntu guidance: Check event and subscription status'
      });
    }
  } catch (error) {
    console.error('Error retrying dead letter event:', error);
    res.status(500).json({
      error: 'Failed to retry dead letter event',
      ubuntu: 'We handle retry errors with Ubuntu grace'
    });
  }
});

// DELETE /api/dead-letter-queue/purge - Purge dead letter queue
app.delete('/api/dead-letter-queue/purge', async (req, res) => {
  try {
    const { serviceId } = req.query;
    const purgedCount = await eventBus.purgeDeadLetterQueue(serviceId);
    
    console.log(`🗑️ Dead letter queue purged: ${purgedCount} events for ${serviceId || 'all services'}`);
    
    res.json({
      success: true,
      purgedCount,
      ubuntu: 'Queue purged with Ubuntu cleanliness'
    });
  } catch (error) {
    console.error('Error purging dead letter queue:', error);
    res.status(500).json({
      error: 'Failed to purge dead letter queue',
      ubuntu: 'We handle purge errors with Ubuntu grace'
    });
  }
});

// ========== METRICS ENDPOINTS ==========

// GET /api/metrics - Get event bus metrics
app.get('/api/metrics', (req, res) => {
  try {
    const metrics = eventBus.getMetrics();
    
    res.json({
      metrics,
      ubuntu: 'Metrics reflect Ubuntu event health'
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({
      error: 'Failed to fetch metrics',
      ubuntu: 'We handle metric errors with Ubuntu grace'
    });
  }
});

// GET /api/stats - Get detailed statistics
app.get('/api/stats', (req, res) => {
  try {
    const metrics = eventBus.getMetrics();
    const subscriptions = eventBus.getSubscriptions();
    const deadLetterQueue = eventBus.getDeadLetterQueue();
    
    // Calculate additional statistics
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    const eventsByType = {};
    
    // Count events by type (simplified - in production would use proper analytics)
    deadLetterQueue.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    });

    res.json({
      overview: metrics,
      subscriptions: {
        total: subscriptions.length,
        active: activeSubscriptions,
        inactive: subscriptions.length - activeSubscriptions
      },
      deadLetterQueue: {
        totalSize: deadLetterQueue.length,
        eventsByType
      },
      ubuntu: 'Statistics show Ubuntu event ecosystem'
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      error: 'Failed to fetch stats',
      ubuntu: 'We handle stats errors with Ubuntu grace'
    });
  }
});

// ========== UTILITY ENDPOINTS ==========

// POST /api/events/validate - Validate event against schema
app.post('/api/events/validate', (req, res) => {
  try {
    const { type, version, payload } = req.body;
    
    if (!type || !payload) {
      return res.status(400).json({
        error: 'Event type and payload are required',
        ubuntu: 'Ubuntu clarity: Provide event details for validation'
      });
    }

    const validation = eventBus.validateEvent({ type, version, payload });
    
    res.json({
      valid: validation.valid,
      errors: validation.errors,
      ubuntu: 'Validation performed with Ubuntu precision'
    });
  } catch (error) {
    console.error('Error validating event:', error);
    res.status(500).json({
      error: 'Failed to validate event',
      ubuntu: 'We handle validation errors with Ubuntu grace'
    });
  }
});

// GET /api/status - Get event bus status
app.get('/api/status', async (req, res) => {
  try {
    const health = await eventBus.healthCheck();
    const metrics = eventBus.getMetrics();
    
    res.json({
      status: health.healthy ? 'operational' : 'degraded',
      health,
      metrics,
      timestamp: new Date(),
      ubuntu: 'Event bus operates with Ubuntu excellence'
    });
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({
      error: 'Failed to fetch status',
      ubuntu: 'We handle status errors with Ubuntu grace'
    });
  }
});

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  console.error('Ubuntu Event Bus Error:', error);
  res.status(500).json({
    error: 'Ubuntu event bus error',
    ubuntu: 'We handle event errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Event bus endpoint not found',
    ubuntu: 'Ubuntu guidance: Check available event bus endpoints',
    availableEndpoints: [
      '/api/schemas/register',
      '/api/schemas',
      '/api/schemas/:type',
      '/api/subscriptions',
      '/api/subscriptions/:id',
      '/api/events/publish',
      '/api/events/batch',
      '/api/events/validate',
      '/api/dead-letter-queue',
      '/api/dead-letter-queue/:eventId/retry',
      '/api/dead-letter-queue/purge',
      '/api/metrics',
      '/api/stats',
      '/api/status'
    ]
  });
});

// Start the service
app.listen(PORT, () => {
  console.log(`📢 Azora Event Bus running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I connect because we communicate together!"');
  console.log(`🔍 Schema Validation: Active`);
  console.log(`💀 Dead Letter Queue: Active`);
  console.log(`🔄 Retry Logic: Active`);
  console.log(`📊 Metrics: Active`);
  console.log(`🗃️ Redis Persistence: Active`);
  console.log(`🎯 Event Filtering: Active`);
  console.log(`🛡️ Ubuntu: Event security through community trust`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  await eventBus.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  await eventBus.shutdown();
  process.exit(0);
});

module.exports = app;
