/**
 * Analytics Dashboard Service
 * 
 * Tracks API usage patterns, user journeys, conversion funnels,
 * and business metrics for deployed applications.
 */

export interface AnalyticsEvent {
  id: string;
  name: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  properties: Record<string, any>;
  context: {
    page?: string;
    referrer?: string;
    userAgent?: string;
    ip?: string;
  };
}

export interface APIUsageMetrics {
  endpoint: string;
  method: string;
  totalCalls: number;
  uniqueUsers: number;
  avgResponseTime: number;
  errorRate: number;
  popularTimes: { hour: number; count: number }[];
}

export interface UserJourney {
  sessionId: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  events: AnalyticsEvent[];
  pages: string[];
  conversions: string[];
}

export interface ConversionFunnel {
  name: string;
  steps: FunnelStep[];
  totalEntered: number;
  totalCompleted: number;
  conversionRate: number;
  avgTimeToComplete: number;
}

export interface FunnelStep {
  name: string;
  event: string;
  entered: number;
  completed: number;
  dropoffRate: number;
  avgTimeInStep: number;
}

export interface BusinessMetrics {
  revenue: {
    total: number;
    byPeriod: { period: string; amount: number }[];
    byProduct: { product: string; amount: number }[];
  };
  users: {
    total: number;
    active: number;
    new: number;
    churn: number;
    retention: number;
  };
  engagement: {
    avgSessionDuration: number;
    avgPageViews: number;
    bounceRate: number;
    returnRate: number;
  };
}

export class AnalyticsDashboard {
  private events: AnalyticsEvent[] = [];
  private sessions: Map<string, UserJourney> = new Map();
  private funnels: Map<string, ConversionFunnel> = new Map();

  /**
   * Track an analytics event
   */
  trackEvent(
    name: string,
    properties?: Record<string, any>,
    context?: Partial<AnalyticsEvent['context']>,
    userId?: string,
    sessionId?: string
  ): AnalyticsEvent {
    const event: AnalyticsEvent = {
      id: this.generateId(),
      name,
      timestamp: new Date(),
      userId,
      sessionId: sessionId || this.generateSessionId(),
      properties: properties || {},
      context: {
        page: context?.page,
        referrer: context?.referrer,
        userAgent: context?.userAgent,
        ip: context?.ip,
      },
    };

    this.events.push(event);
    this.updateSession(event);
    this.updateFunnels(event);

    return event;
  }

  /**
   * Update user session
   */
  private updateSession(event: AnalyticsEvent): void {
    if (!event.sessionId) return;

    const existing = this.sessions.get(event.sessionId);

    if (existing) {
      existing.events.push(event);
      existing.endTime = event.timestamp;
      existing.duration = existing.endTime.getTime() - existing.startTime.getTime();
      
      if (event.context.page && !existing.pages.includes(event.context.page)) {
        existing.pages.push(event.context.page);
      }

      // Track conversions
      if (event.name.startsWith('conversion_')) {
        existing.conversions.push(event.name);
      }
    } else {
      this.sessions.set(event.sessionId, {
        sessionId: event.sessionId,
        userId: event.userId,
        startTime: event.timestamp,
        events: [event],
        pages: event.context.page ? [event.context.page] : [],
        conversions: event.name.startsWith('conversion_') ? [event.name] : [],
      });
    }
  }

  /**
   * Update conversion funnels
   */
  private updateFunnels(event: AnalyticsEvent): void {
    for (const funnel of this.funnels.values()) {
      const stepIndex = funnel.steps.findIndex(s => s.event === event.name);
      
      if (stepIndex >= 0) {
        const step = funnel.steps[stepIndex];
        step.entered++;

        // Check if user completed previous steps
        if (stepIndex === 0 || this.hasCompletedPreviousSteps(event.sessionId!, funnel, stepIndex)) {
          step.completed++;
          
          // Update funnel totals
          if (stepIndex === 0) {
            funnel.totalEntered++;
          }
          if (stepIndex === funnel.steps.length - 1) {
            funnel.totalCompleted++;
          }
        }
      }
    }
  }

  /**
   * Check if user completed previous funnel steps
   */
  private hasCompletedPreviousSteps(sessionId: string, funnel: ConversionFunnel, currentStep: number): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    for (let i = 0; i < currentStep; i++) {
      const stepEvent = funnel.steps[i].event;
      if (!session.events.some(e => e.name === stepEvent)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get API usage metrics
   */
  getAPIUsageMetrics(timeRange?: { start: Date; end: Date }): APIUsageMetrics[] {
    const apiEvents = this.filterEvents('api_call', timeRange);
    const grouped = new Map<string, AnalyticsEvent[]>();

    // Group by endpoint and method
    for (const event of apiEvents) {
      const key = `${event.properties.method}:${event.properties.endpoint}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(event);
    }

    const metrics: APIUsageMetrics[] = [];

    for (const [key, events] of grouped) {
      const [method, endpoint] = key.split(':');
      const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean)).size;
      const responseTimes = events.map(e => e.properties.responseTime || 0);
      const errors = events.filter(e => e.properties.error).length;

      // Calculate popular times
      const hourCounts = new Map<number, number>();
      for (const event of events) {
        const hour = event.timestamp.getHours();
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      }

      metrics.push({
        endpoint,
        method,
        totalCalls: events.length,
        uniqueUsers,
        avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
        errorRate: (errors / events.length) * 100,
        popularTimes: Array.from(hourCounts.entries())
          .map(([hour, count]) => ({ hour, count }))
          .sort((a, b) => b.count - a.count),
      });
    }

    return metrics.sort((a, b) => b.totalCalls - a.totalCalls);
  }

  /**
   * Get user journeys
   */
  getUserJourneys(filter?: {
    userId?: string;
    completed?: boolean;
    minDuration?: number;
    timeRange?: { start: Date; end: Date };
  }): UserJourney[] {
    let journeys = Array.from(this.sessions.values());

    if (filter?.userId) {
      journeys = journeys.filter(j => j.userId === filter.userId);
    }

    if (filter?.completed !== undefined) {
      journeys = journeys.filter(j => filter.completed ? j.conversions.length > 0 : j.conversions.length === 0);
    }

    if (filter?.minDuration) {
      journeys = journeys.filter(j => (j.duration || 0) >= filter.minDuration);
    }

    if (filter?.timeRange) {
      journeys = journeys.filter(j => 
        j.startTime >= filter.timeRange!.start && j.startTime <= filter.timeRange!.end
      );
    }

    return journeys.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  /**
   * Define a conversion funnel
   */
  defineFunnel(name: string, steps: { name: string; event: string }[]): ConversionFunnel {
    const funnel: ConversionFunnel = {
      name,
      steps: steps.map(s => ({
        name: s.name,
        event: s.event,
        entered: 0,
        completed: 0,
        dropoffRate: 0,
        avgTimeInStep: 0,
      })),
      totalEntered: 0,
      totalCompleted: 0,
      conversionRate: 0,
      avgTimeToComplete: 0,
    };

    this.funnels.set(name, funnel);
    return funnel;
  }

  /**
   * Get conversion funnel
   */
  getConversionFunnel(name: string): ConversionFunnel | undefined {
    const funnel = this.funnels.get(name);
    if (!funnel) return undefined;

    // Calculate rates and averages
    for (let i = 0; i < funnel.steps.length; i++) {
      const step = funnel.steps[i];
      const prevStep = i > 0 ? funnel.steps[i - 1] : null;

      if (prevStep) {
        step.dropoffRate = prevStep.completed > 0 
          ? ((prevStep.completed - step.completed) / prevStep.completed) * 100 
          : 0;
      }

      // Calculate average time in step
      const stepTimes = this.calculateStepTimes(funnel, i);
      step.avgTimeInStep = stepTimes.reduce((a, b) => a + b, 0) / stepTimes.length || 0;
    }

    funnel.conversionRate = funnel.totalEntered > 0 
      ? (funnel.totalCompleted / funnel.totalEntered) * 100 
      : 0;

    // Calculate average time to complete
    const completionTimes = this.calculateCompletionTimes(funnel);
    funnel.avgTimeToComplete = completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length || 0;

    return funnel;
  }

  /**
   * Calculate time spent in each funnel step
   */
  private calculateStepTimes(funnel: ConversionFunnel, stepIndex: number): number[] {
    const times: number[] = [];
    const step = funnel.steps[stepIndex];
    const nextStep = funnel.steps[stepIndex + 1];

    if (!nextStep) return times;

    for (const session of this.sessions.values()) {
      const stepEvent = session.events.find(e => e.name === step.event);
      const nextStepEvent = session.events.find(e => e.name === nextStep.event);

      if (stepEvent && nextStepEvent) {
        const duration = nextStepEvent.timestamp.getTime() - stepEvent.timestamp.getTime();
        times.push(duration);
      }
    }

    return times;
  }

  /**
   * Calculate funnel completion times
   */
  private calculateCompletionTimes(funnel: ConversionFunnel): number[] {
    const times: number[] = [];
    const firstStep = funnel.steps[0];
    const lastStep = funnel.steps[funnel.steps.length - 1];

    for (const session of this.sessions.values()) {
      const firstEvent = session.events.find(e => e.name === firstStep.event);
      const lastEvent = session.events.find(e => e.name === lastStep.event);

      if (firstEvent && lastEvent) {
        const duration = lastEvent.timestamp.getTime() - firstEvent.timestamp.getTime();
        times.push(duration);
      }
    }

    return times;
  }

  /**
   * Get business metrics
   */
  getBusinessMetrics(timeRange?: { start: Date; end: Date }): BusinessMetrics {
    const revenueEvents = this.filterEvents('revenue', timeRange);
    const userEvents = this.filterEvents('user_action', timeRange);
    const sessions = this.getUserJourneys({ timeRange });

    // Revenue metrics
    const totalRevenue = revenueEvents.reduce((sum, e) => sum + (e.properties.amount || 0), 0);
    const revenueByPeriod = this.groupByPeriod(revenueEvents, 'day');
    const revenueByProduct = this.groupByProperty(revenueEvents, 'product');

    // User metrics
    const totalUsers = new Set(userEvents.map(e => e.userId).filter(Boolean)).size;
    const activeUsers = new Set(
      userEvents
        .filter(e => e.timestamp >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .map(e => e.userId)
        .filter(Boolean)
    ).size;
    const newUsers = userEvents.filter(e => e.name === 'user_signup').length;

    // Engagement metrics
    const sessionDurations = sessions.map(s => s.duration || 0);
    const avgSessionDuration = sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length || 0;
    const avgPageViews = sessions.reduce((sum, s) => sum + s.pages.length, 0) / sessions.length || 0;
    const bouncedSessions = sessions.filter(s => s.pages.length === 1).length;
    const bounceRate = (bouncedSessions / sessions.length) * 100 || 0;
    const returningSessions = sessions.filter(s => s.events.length > 1).length;
    const returnRate = (returningSessions / sessions.length) * 100 || 0;

    return {
      revenue: {
        total: totalRevenue,
        byPeriod: revenueByPeriod,
        byProduct: revenueByProduct,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
        churn: 0, // Would need historical data
        retention: 0, // Would need historical data
      },
      engagement: {
        avgSessionDuration,
        avgPageViews,
        bounceRate,
        returnRate,
      },
    };
  }

  /**
   * Filter events by name and time range
   */
  private filterEvents(name: string, timeRange?: { start: Date; end: Date }): AnalyticsEvent[] {
    let filtered = this.events.filter(e => e.name === name);

    if (timeRange) {
      filtered = filtered.filter(e => 
        e.timestamp >= timeRange.start && e.timestamp <= timeRange.end
      );
    }

    return filtered;
  }

  /**
   * Group events by time period
   */
  private groupByPeriod(events: AnalyticsEvent[], period: 'hour' | 'day' | 'week' | 'month'): { period: string; amount: number }[] {
    const grouped = new Map<string, number>();

    for (const event of events) {
      const key = this.getPeriodKey(event.timestamp, period);
      const amount = event.properties.amount || 0;
      grouped.set(key, (grouped.get(key) || 0) + amount);
    }

    return Array.from(grouped.entries())
      .map(([period, amount]) => ({ period, amount }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Get period key for grouping
   */
  private getPeriodKey(date: Date, period: 'hour' | 'day' | 'week' | 'month'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');

    switch (period) {
      case 'hour': return `${year}-${month}-${day} ${hour}:00`;
      case 'day': return `${year}-${month}-${day}`;
      case 'week': return `${year}-W${this.getWeekNumber(date)}`;
      case 'month': return `${year}-${month}`;
    }
  }

  /**
   * Get week number
   */
  private getWeekNumber(date: Date): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return String(weekNo).padStart(2, '0');
  }

  /**
   * Group events by property
   */
  private groupByProperty(events: AnalyticsEvent[], property: string): { product: string; amount: number }[] {
    const grouped = new Map<string, number>();

    for (const event of events) {
      const key = event.properties[property] || 'unknown';
      const amount = event.properties.amount || 0;
      grouped.set(key, (grouped.get(key) || 0) + amount);
    }

    return Array.from(grouped.entries())
      .map(([product, amount]) => ({ product, amount }))
      .sort((a, b) => b.amount - a.amount);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Clear old data
   */
  clearOldData(olderThan: Date): void {
    this.events = this.events.filter(e => e.timestamp >= olderThan);
    
    for (const [sessionId, session] of this.sessions) {
      if (session.startTime < olderThan) {
        this.sessions.delete(sessionId);
      }
    }
  }
}
