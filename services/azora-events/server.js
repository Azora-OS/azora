const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4019;

// Ubuntu Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
}));
app.use(express.json());

// Ubuntu Rate Limiting
const ubuntuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Ubuntu rate limit exceeded', ubuntu: 'Please slow down for community harmony' }
});
app.use(ubuntuLimiter);

// Ubuntu Health Check
app.get('/health', (req, res) => {
  res.json({
    service: 'azora-events',
    status: 'healthy',
    ubuntu: 'I connect because we communicate together',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'Ngiyakwazi ngoba sikwazi - I can because we can',
    principles: [
      'My success enables your success',
      'My knowledge becomes our knowledge',
      'My work strengthens our foundation',
      'My security ensures our freedom'
    ],
    service: 'azora-events',
    ubuntu: 'Ubuntu event-driven communication'
  });
});

// Event Bus State
let events = [];
let subscribers = [];
let eventStreams = {};
let eventStats = {
  totalEvents: 0,
  eventsByType: {},
  eventsByService: {},
  subscribersByTopic: {}
};

// Event Types
const EventTypes = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  COURSE_ENROLLED: 'course.enrolled',
  COURSE_COMPLETED: 'course.completed',
  NFT_MINTED: 'nft.minted',
  NFT_TRANSFERRED: 'nft.transferred',
  TRANSACTION_CREATED: 'transaction.created',
  TRANSACTION_COMPLETED: 'transaction.completed',
  PROPOSAL_CREATED: 'proposal.created',
  PROPOSAL_EXECUTED: 'proposal.executed',
  VOTE_CAST: 'vote.cast',
  CITADEL_CONTRIBUTION: 'citadel.contribution',
  PROOF_SUBMITTED: 'proof.submitted',
  REWARD_DISTRIBUTED: 'reward.distributed',
  CERTIFICATE_ISSUED: 'certificate.issued',
  SERVICE_HEALTH: 'service.health',
  SYSTEM_ALERT: 'system.alert'
};

// Publish Event
app.post('/api/events/publish', async (req, res) => {
  try {
    const { type, data, source, priority = 'normal', correlationId } = req.body;
    
    const event = {
      id: 'event-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      type,
      data,
      source,
      priority,
      correlationId,
      timestamp: new Date().toISOString(),
      ubuntu: 'Ubuntu event published'
    };
    
    events.push(event);
    eventStats.totalEvents += 1;
    
    // Update stats
    if (!eventStats.eventsByType[type]) {
      eventStats.eventsByType[type] = 0;
    }
    eventStats.eventsByType[type] += 1;
    
    if (!eventStats.eventsByService[source]) {
      eventStats.eventsByService[source] = 0;
    }
    eventStats.eventsByService[source] += 1;
    
    // Notify subscribers
    const topicSubscribers = subscribers.filter(s => s.topic === type || s.topic === '*');
    const notifications = topicSubscribers.map(subscriber => ({
      subscriberId: subscriber.id,
      endpoint: subscriber.endpoint,
      event: event,
      delivered: false,
      attempts: 0
    }));
    
    // Simulate event delivery
    setTimeout(() => {
      notifications.forEach(notification => {
        notification.delivered = true;
        console.log(`📨 Event delivered: ${type} to ${notification.subscriberId}`);
      });
    }, 100);
    
    console.log(`📤 Event Published: ${type} from ${source}`);
    
    res.json({ 
      success: true, 
      event: {
        id: event.id,
        type,
        source,
        timestamp: event.timestamp,
        subscribersNotified: notifications.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subscribe to Events
app.post('/api/events/subscribe', async (req, res) => {
  try {
    const { topic, endpoint, subscriberId, filters = {} } = req.body;
    
    const subscription = {
      id: subscriberId || 'sub-' + Date.now(),
      topic,
      endpoint,
      filters,
      createdAt: new Date().toISOString(),
      status: 'active',
      eventsReceived: 0,
      lastEventAt: null,
      ubuntu: 'Ubuntu event subscription'
    };
    
    subscribers.push(subscription);
    
    // Update subscriber stats
    if (!eventStats.subscribersByTopic[topic]) {
      eventStats.subscribersByTopic[topic] = 0;
    }
    eventStats.subscribersByTopic[topic] += 1;
    
    console.log(`📬 Subscription Created: ${subscriberId} to ${topic}`);
    
    res.json({ 
      success: true, 
      subscription: {
        id: subscription.id,
        topic,
        endpoint,
        status: 'active',
        createdAt: subscription.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Events
app.get('/api/events', async (req, res) => {
  try {
    const type = req.query.type;
    const source = req.query.source;
    const priority = req.query.priority;
    const limit = parseInt(req.query.limit) || 50;
    const since = req.query.since;
    
    let filteredEvents = events;
    
    if (type) {
      filteredEvents = filteredEvents.filter(e => e.type === type);
    }
    
    if (source) {
      filteredEvents = filteredEvents.filter(e => e.source === source);
    }
    
    if (priority) {
      filteredEvents = filteredEvents.filter(e => e.priority === priority);
    }
    
    if (since) {
      const sinceDate = new Date(since);
      filteredEvents = filteredEvents.filter(e => new Date(e.timestamp) >= sinceDate);
    }
    
    const sortedEvents = filteredEvents
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
    
    res.json({ 
      events: sortedEvents,
      total: filteredEvents.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Event Details
app.get('/api/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = events.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Get related events by correlation ID
    let relatedEvents = [];
    if (event.correlationId) {
      relatedEvents = events.filter(e => 
        e.correlationId === event.correlationId && e.id !== eventId
      );
    }
    
    res.json({
      event,
      relatedEvents
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Event Stream
app.post('/api/events/streams', async (req, res) => {
  try {
    const { name, filters = [], subscriberId } = req.body;
    
    const stream = {
      id: 'stream-' + Date.now(),
      name,
      filters,
      subscriberId,
      createdAt: new Date().toISOString(),
      status: 'active',
      eventsInStream: 0,
      lastEventAt: null,
      ubuntu: 'Ubuntu event stream'
    };
    
    eventStreams[stream.id] = stream;
    
    console.log(`🌊 Event Stream Created: ${name} for ${subscriberId}`);
    
    res.json({ 
      success: true, 
      stream: {
        id: stream.id,
        name,
        status: 'active',
        createdAt: stream.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Event Streams
app.get('/api/events/streams', async (req, res) => {
  try {
    const streams = Object.values(eventStreams).map(stream => ({
      ...stream,
      eventCount: events.filter(e => {
        return stream.filters.length === 0 || 
          stream.filters.some(filter => e.type.includes(filter));
      }).length
    }));
    
    res.json({ streams });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Subscribers
app.get('/api/events/subscribers', async (req, res) => {
  try {
    const topic = req.query.topic;
    const status = req.query.status || 'active';
    
    let filteredSubscribers = subscribers.filter(s => s.status === status);
    
    if (topic) {
      filteredSubscribers = filteredSubscribers.filter(s => s.topic === topic);
    }
    
    res.json({ subscribers: filteredSubscribers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unsubscribe from Events
app.delete('/api/events/subscriptions/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    
    const subscriptionIndex = subscribers.findIndex(s => s.id === subscriptionId);
    if (subscriptionIndex === -1) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    const subscription = subscribers[subscriptionIndex];
    subscribers.splice(subscriptionIndex, 1);
    
    // Update stats
    if (eventStats.subscribersByTopic[subscription.topic]) {
      eventStats.subscribersByTopic[subscription.topic] -= 1;
      if (eventStats.subscribersByTopic[subscription.topic] === 0) {
        delete eventStats.subscribersByTopic[subscription.topic];
      }
    }
    
    console.log(`📭 Subscription Removed: ${subscriptionId} from ${subscription.topic}`);
    
    res.json({ 
      success: true, 
      message: 'Subscription removed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Event Statistics
app.get('/api/events/stats', async (req, res) => {
  try {
    const recentEvents = events.filter(e => {
      const eventTime = new Date(e.timestamp);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return eventTime >= oneHourAgo;
    });
    
    const eventsPerHour = recentEvents.length;
    const topEventTypes = Object.entries(eventStats.eventsByType)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    const topServices = Object.entries(eventStats.eventsByService)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    res.json({
      totalEvents: eventStats.totalEvents,
      eventsPerHour,
      activeSubscribers: subscribers.filter(s => s.status === 'active').length,
      activeStreams: Object.values(eventStreams).filter(s => s.status === 'active').length,
      topEventTypes: Object.fromEntries(topEventTypes),
      topServices: Object.fromEntries(topServices),
      subscribersByTopic: eventStats.subscribersByTopic,
      ubuntu: 'Ubuntu event statistics'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Service Health Events (Integration)
app.post('/api/events/health', async (req, res) => {
  try {
    const { serviceName, status, metrics, timestamp } = req.body;
    
    const healthEvent = {
      id: 'event-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      type: EventTypes.SERVICE_HEALTH,
      data: {
        serviceName,
        status,
        metrics,
        timestamp: timestamp || new Date().toISOString()
      },
      source: serviceName,
      priority: status === 'healthy' ? 'low' : 'high',
      timestamp: new Date().toISOString(),
      ubuntu: 'Ubuntu service health event'
    };
    
    events.push(healthEvent);
    
    // Alert on unhealthy services
    if (status !== 'healthy') {
      console.log(`🚨 Service Alert: ${serviceName} is ${status}`);
    }
    
    res.json({ success: true, eventId: healthEvent.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// System Alert Events
app.post('/api/events/alert', async (req, res) => {
  try {
    const { level, message, source, details } = req.body;
    
    const alertEvent = {
      id: 'event-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      type: EventTypes.SYSTEM_ALERT,
      data: {
        level,
        message,
        source,
        details
      },
      source: source || 'system',
      priority: level === 'critical' ? 'high' : level === 'warning' ? 'normal' : 'low',
      timestamp: new Date().toISOString(),
      ubuntu: 'Ubuntu system alert'
    };
    
    events.push(alertEvent);
    
    console.log(`🚨 System Alert [${level.toUpperCase()}]: ${message}`);
    
    res.json({ success: true, eventId: alertEvent.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Default Ubuntu Routes
app.get('/api/status', (req, res) => {
  res.json({
    service: 'azora-events',
    status: 'operational',
    ubuntu: 'Ubuntu event bus service ready'
  });
});

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  console.error('Ubuntu Service Error:', error);
  res.status(500).json({
    error: 'Ubuntu service error',
    ubuntu: 'We handle errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// Start Ubuntu Service
app.listen(PORT, () => {
  console.log(`📨 Azora Event Bus service running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I connect because we communicate together!"`);
  console.log(`📊 Events: ${events.length}, Subscribers: ${subscribers.length}`);
});
