const analytics = new Map();

const getMetrics = async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;
    
    const metrics = {
      users: {
        total: 1250,
        active: 890,
        new: 45
      },
      revenue: {
        total: 125000,
        monthly: 45000,
        daily: 1500
      },
      courses: {
        total: 150,
        completed: 1200,
        inProgress: 450
      },
      engagement: {
        avgSessionTime: '25m',
        bounceRate: '15%',
        completionRate: '78%'
      }
    };

    res.json({
      timeframe,
      metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getDashboard = async (req, res) => {
  try {
    const dashboard = {
      overview: {
        totalUsers: 1250,
        totalRevenue: 125000,
        totalCourses: 150,
        avgRating: 4.7
      },
      charts: {
        userGrowth: [
          { date: '2024-01-01', users: 1000 },
          { date: '2024-01-02', users: 1050 },
          { date: '2024-01-03', users: 1100 },
          { date: '2024-01-04', users: 1200 },
          { date: '2024-01-05', users: 1250 }
        ],
        revenueGrowth: [
          { date: '2024-01-01', revenue: 100000 },
          { date: '2024-01-02', revenue: 110000 },
          { date: '2024-01-03', revenue: 115000 },
          { date: '2024-01-04', revenue: 120000 },
          { date: '2024-01-05', revenue: 125000 }
        ]
      }
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const trackEvent = async (req, res) => {
  try {
    const { event, userId, data } = req.body;
    
    if (!event || !userId) {
      return res.status(400).json({ error: 'Event and userId are required' });
    }

    const eventData = {
      id: Date.now().toString(),
      event,
      userId,
      data: data || {},
      timestamp: new Date().toISOString()
    };

    analytics.set(eventData.id, eventData);

    res.status(201).json({
      message: 'Event tracked successfully',
      eventId: eventData.id
    });
  } catch (error) {
    console.error('Event tracking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getMetrics,
  getDashboard,
  trackEvent
};