const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

class QuantumTracking {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3056;
    this.events = new Map();
    this.sessions = new Map();
    this.userProfiles = new Map();
    this.behaviorPatterns = new Map();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json());
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        service: 'quantum-tracking',
        timestamp: new Date().toISOString(),
        events: this.events.size,
        sessions: this.sessions.size,
        profiles: this.userProfiles.size
      });
    });

    // Event tracking
    this.app.post('/api/track/event', this.trackEvent.bind(this));
    this.app.get('/api/events', this.getEvents.bind(this));
    this.app.get('/api/events/:userId', this.getUserEvents.bind(this));

    // Session tracking
    this.app.post('/api/track/session', this.trackSession.bind(this));
    this.app.get('/api/sessions', this.getSessions.bind(this));
    this.app.get('/api/sessions/:userId', this.getUserSessions.bind(this));

    // User behavior analysis
    this.app.get('/api/behavior/:userId', this.getUserBehavior.bind(this));
    this.app.get('/api/behavior/patterns/all', this.getBehaviorPatterns.bind(this));
    this.app.post('/api/behavior/analyze', this.analyzeBehavior.bind(this));

    // Advanced analytics
    this.app.get('/api/analytics/funnel', this.getFunnelAnalytics.bind(this));
    this.app.get('/api/analytics/cohort', this.getCohortAnalysis.bind(this));
    this.app.get('/api/analytics/retention', this.getRetentionAnalysis.bind(this));
    this.app.get('/api/analytics/engagement', this.getEngagementMetrics.bind(this));

    // Real-time tracking
    this.app.get('/api/realtime/active', this.getActiveUsers.bind(this));
    this.app.get('/api/realtime/events', this.getRealtimeEvents.bind(this));
  }

  trackEvent(req, res) {
    try {
      const { userId, eventType, eventData = {}, metadata = {} } = req.body;
      
      if (!userId || !eventType) {
        return res.status(400).json({ error: 'userId and eventType are required' });
      }

      const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const event = {
        id: eventId,
        userId,
        eventType,
        eventData,
        metadata: {
          ...metadata,
          userAgent: req.headers['user-agent'],
          ip: req.ip,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };

      this.events.set(eventId, event);
      this.updateUserProfile(userId, event);
      this.analyzeBehaviorPattern(userId, event);
      
      res.json({ 
        success: true, 
        eventId,
        message: 'Event tracked successfully' 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  trackSession(req, res) {
    try {
      const { userId, sessionId, action, duration, pageViews = [] } = req.body;
      
      if (!userId || !sessionId || !action) {
        return res.status(400).json({ error: 'userId, sessionId, and action are required' });
      }

      const session = this.sessions.get(sessionId) || {
        id: sessionId,
        userId,
        startTime: new Date().toISOString(),
        events: [],
        pageViews: [],
        duration: 0
      };

      if (action === 'start') {
        session.startTime = new Date().toISOString();
      } else if (action === 'end') {
        session.endTime = new Date().toISOString();
        session.duration = duration || 0;
      }

      session.pageViews = [...session.pageViews, ...pageViews];
      session.lastActivity = new Date().toISOString();
      
      this.sessions.set(sessionId, session);
      
      res.json({ 
        success: true, 
        sessionId,
        message: 'Session tracked successfully' 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  updateUserProfile(userId, event) {
    const profile = this.userProfiles.get(userId) || {
      userId,
      firstSeen: new Date().toISOString(),
      totalEvents: 0,
      eventTypes: new Set(),
      lastActivity: null,
      engagementScore: 0
    };

    profile.totalEvents++;
    profile.eventTypes.add(event.eventType);
    profile.lastActivity = event.timestamp;
    profile.engagementScore = this.calculateEngagementScore(profile);

    this.userProfiles.set(userId, profile);
  }

  calculateEngagementScore(profile) {
    const daysSinceFirst = (new Date() - new Date(profile.firstSeen)) / (1000 * 60 * 60 * 24);
    const eventsPerDay = profile.totalEvents / Math.max(daysSinceFirst, 1);
    const diversityScore = profile.eventTypes.size * 10;
    
    return Math.min(100, Math.round(eventsPerDay * 5 + diversityScore));
  }

  analyzeBehaviorPattern(userId, event) {
    const patternKey = `${userId}_${event.eventType}`;
    const pattern = this.behaviorPatterns.get(patternKey) || {
      userId,
      eventType: event.eventType,
      frequency: 0,
      lastOccurrence: null,
      averageInterval: 0,
      timestamps: []
    };

    pattern.frequency++;
    pattern.lastOccurrence = event.timestamp;
    pattern.timestamps.push(new Date(event.timestamp).getTime());
    
    if (pattern.timestamps.length > 1) {
      const intervals = [];
      for (let i = 1; i < pattern.timestamps.length; i++) {
        intervals.push(pattern.timestamps[i] - pattern.timestamps[i-1]);
      }
      pattern.averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    }

    this.behaviorPatterns.set(patternKey, pattern);
  }

  getEvents(req, res) {
    try {
      const { limit = 100, offset = 0, eventType } = req.query;
      let events = Array.from(this.events.values());
      
      if (eventType) {
        events = events.filter(event => event.eventType === eventType);
      }
      
      events = events
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(offset, offset + parseInt(limit));

      res.json({
        events,
        total: this.events.size,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getUserEvents(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 100 } = req.query;
      
      const userEvents = Array.from(this.events.values())
        .filter(event => event.userId === userId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, parseInt(limit));

      res.json({
        userId,
        events: userEvents,
        count: userEvents.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getSessions(req, res) {
    try {
      const { limit = 50 } = req.query;
      const sessions = Array.from(this.sessions.values())
        .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
        .slice(0, parseInt(limit));

      res.json({ sessions });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getUserSessions(req, res) {
    try {
      const { userId } = req.params;
      const userSessions = Array.from(this.sessions.values())
        .filter(session => session.userId === userId)
        .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

      res.json({
        userId,
        sessions: userSessions,
        count: userSessions.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getUserBehavior(req, res) {
    try {
      const { userId } = req.params;
      const profile = this.userProfiles.get(userId);
      
      if (!profile) {
        return res.status(404).json({ error: 'User profile not found' });
      }

      const userPatterns = Array.from(this.behaviorPatterns.values())
        .filter(pattern => pattern.userId === userId);

      res.json({
        userId,
        profile: {
          ...profile,
          eventTypes: Array.from(profile.eventTypes)
        },
        patterns: userPatterns
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getBehaviorPatterns(req, res) {
    try {
      const patterns = Array.from(this.behaviorPatterns.values())
        .sort((a, b) => b.frequency - a.frequency);

      res.json({ patterns });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  analyzeBehavior(req, res) {
    try {
      const { userId, timeframe = '7d' } = req.body;
      
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 1;
      const cutoffTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const recentEvents = Array.from(this.events.values())
        .filter(event => 
          (!userId || event.userId === userId) &&
          new Date(event.timestamp) > cutoffTime
        );

      const analysis = {
        timeframe,
        totalEvents: recentEvents.length,
        uniqueUsers: new Set(recentEvents.map(e => e.userId)).size,
        eventTypes: this.groupBy(recentEvents, 'eventType'),
        hourlyDistribution: this.getHourlyDistribution(recentEvents),
        topUsers: this.getTopUsers(recentEvents)
      };

      res.json({ analysis });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }

  getHourlyDistribution(events) {
    const hours = Array(24).fill(0);
    events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hours[hour]++;
    });
    return hours;
  }

  getTopUsers(events) {
    const userCounts = this.groupBy(events, 'userId');
    return Object.entries(userCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([userId, count]) => ({ userId, eventCount: count }));
  }

  getFunnelAnalytics(req, res) {
    try {
      const funnel = {
        steps: [
          { name: 'Visit', count: 1000, conversion: 100 },
          { name: 'Signup', count: 450, conversion: 45 },
          { name: 'Course Enroll', count: 320, conversion: 32 },
          { name: 'Complete Course', count: 280, conversion: 28 }
        ],
        totalConversion: 28
      };

      res.json({ funnel });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getCohortAnalysis(req, res) {
    try {
      const cohorts = [
        { period: '2024-01', users: 100, retention: [100, 85, 72, 65, 58] },
        { period: '2024-02', users: 150, retention: [100, 88, 75, 68] },
        { period: '2024-03', users: 200, retention: [100, 90, 78] }
      ];

      res.json({ cohorts });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getRetentionAnalysis(req, res) {
    try {
      const retention = {
        day1: 85,
        day7: 72,
        day30: 58,
        day90: 45
      };

      res.json({ retention });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getEngagementMetrics(req, res) {
    try {
      const profiles = Array.from(this.userProfiles.values());
      const avgEngagement = profiles.reduce((sum, p) => sum + p.engagementScore, 0) / profiles.length;
      
      const metrics = {
        averageEngagementScore: Math.round(avgEngagement) || 0,
        highlyEngaged: profiles.filter(p => p.engagementScore > 80).length,
        moderatelyEngaged: profiles.filter(p => p.engagementScore > 50 && p.engagementScore <= 80).length,
        lowEngaged: profiles.filter(p => p.engagementScore <= 50).length,
        totalUsers: profiles.length
      };

      res.json({ metrics });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getActiveUsers(req, res) {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const activeUsers = Array.from(this.userProfiles.values())
        .filter(profile => new Date(profile.lastActivity) > fiveMinutesAgo)
        .length;

      res.json({ activeUsers, timestamp: new Date().toISOString() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getRealtimeEvents(req, res) {
    try {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const recentEvents = Array.from(this.events.values())
        .filter(event => new Date(event.timestamp) > oneMinuteAgo)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      res.json({ events: recentEvents, count: recentEvents.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`✅ Quantum Tracking Service running on port ${this.port}`);
    });
  }
}

const service = new QuantumTracking();
if (require.main === module) service.start();
module.exports = service;
