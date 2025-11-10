/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

ENHANCED E2E TESTING WITH QUALITATIVE SESSION CAPTURE
Captures friction points and missing APIs, translates to backlog items
*/

import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Friction point types
 */
export enum FrictionType {
  MISSING_API = 'missing_api',
  SLOW_RESPONSE = 'slow_response',
  ERROR_MESSAGE = 'error_message',
  UI_BLOCKER = 'ui_blocker',
  MOCK_DATA = 'mock_data',
  NETWORK_ERROR = 'network_error',
}

/**
 * Friction point record
 */
export interface FrictionPoint {
  id: string;
  type: FrictionType;
  timestamp: Date;
  testName: string;
  page: string;
  element?: string;
  error?: string;
  apiEndpoint?: string;
  responseTime?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  screenshot?: string;
  networkRequest?: any;
}

/**
 * Session capture data
 */
export interface SessionCapture {
  sessionId: string;
  testName: string;
  startTime: Date;
  endTime?: Date;
  frictionPoints: FrictionPoint[];
  userActions: Array<{
    action: string;
    timestamp: Date;
    element?: string;
    result: 'success' | 'failure' | 'warning';
  }>;
  apiCalls: Array<{
    endpoint: string;
    method: string;
    status: number;
    responseTime: number;
    mockData?: boolean;
  }>;
  screenshots: string[];
}

/**
 * Gap tracking for backlog items
 */
export interface BacklogGap {
  id: string;
  title: string;
  description: string;
  type: 'missing_api' | 'slow_api' | 'error_handling' | 'ui_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedEndpoints: string[];
  frictionPoints: string[]; // IDs
  estimatedEffort: string;
  priority: number;
  createdAt: Date;
}

/**
 * Enhanced E2E Test Runner with Session Capture
 */
export class EnhancedE2ETestRunner {
  private sessionCaptures: SessionCapture[] = [];
  private frictionPoints: FrictionPoint[] = [];
  private backlogGaps: BacklogGap[] = [];
  private outputDir: string;

  constructor() {
    this.outputDir = path.join(__dirname, '../../tests/e2e/sessions');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Start session capture
   */
  startSessionCapture(testName: string): SessionCapture {
    const session: SessionCapture = {
      sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      testName,
      startTime: new Date(),
      frictionPoints: [],
      userActions: [],
      apiCalls: [],
      screenshots: [],
    };

    this.sessionCaptures.push(session);
    return session;
  }

  /**
   * Record friction point
   */
  recordFrictionPoint(
    session: SessionCapture,
    friction: Omit<FrictionPoint, 'id' | 'timestamp'>
  ): FrictionPoint {
    const frictionPoint: FrictionPoint = {
      id: `friction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...friction,
    };

    session.frictionPoints.push(frictionPoint);
    this.frictionPoints.push(frictionPoint);

    // Auto-generate backlog gap for critical/high severity issues
    if (['critical', 'high'].includes(friction.severity)) {
      this.createBacklogGap(frictionPoint);
    }

    return frictionPoint;
  }

  /**
   * Record user action
   */
  recordUserAction(
    session: SessionCapture,
    action: string,
    result: 'success' | 'failure' | 'warning',
    element?: string
  ): void {
    session.userActions.push({
      action,
      timestamp: new Date(),
      element,
      result,
    });
  }

  /**
   * Record API call
   */
  recordAPICall(
    session: SessionCapture,
    endpoint: string,
    method: string,
    status: number,
    responseTime: number,
    mockData?: boolean
  ): void {
    session.apiCalls.push({
      endpoint,
      method,
      status,
      responseTime,
      mockData,
    });

    // Check for slow responses
    if (responseTime > 2000) {
      this.recordFrictionPoint(session, {
        type: FrictionType.SLOW_RESPONSE,
        testName: session.testName,
        page: endpoint,
        apiEndpoint: endpoint,
        responseTime,
        severity: responseTime > 5000 ? 'high' : 'medium',
        description: `Slow API response: ${responseTime}ms for ${endpoint}`,
      });
    }

    // Check for mock data
    if (mockData) {
      this.recordFrictionPoint(session, {
        type: FrictionType.MOCK_DATA,
        testName: session.testName,
        page: endpoint,
        apiEndpoint: endpoint,
        severity: 'medium',
        description: `API endpoint ${endpoint} is returning mock data`,
      });
    }
  }

  /**
   * Capture screenshot
   */
  async captureScreenshot(session: SessionCapture, page: Page, name: string): Promise<string> {
    const screenshotPath = path.join(
      this.outputDir,
      `${session.sessionId}-${name}-${Date.now()}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
    session.screenshots.push(screenshotPath);
    return screenshotPath;
  }

  /**
   * End session capture
   */
  endSessionCapture(session: SessionCapture): void {
    session.endTime = new Date();

    // Save session to file
    const sessionFile = path.join(this.outputDir, `${session.sessionId}.json`);
    fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));

    console.log(`📸 Session captured: ${session.sessionId}`);
    console.log(`   Friction points: ${session.frictionPoints.length}`);
    console.log(`   API calls: ${session.apiCalls.length}`);
  }

  /**
   * Create backlog gap from friction point
   */
  private createBacklogGap(friction: FrictionPoint): BacklogGap {
    const gap: BacklogGap = {
      id: `gap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: this.generateGapTitle(friction),
      description: friction.description,
      type: this.mapFrictionToGapType(friction.type),
      severity: friction.severity,
      affectedEndpoints: friction.apiEndpoint ? [friction.apiEndpoint] : [],
      frictionPoints: [friction.id],
      estimatedEffort: this.estimateEffort(friction),
      priority: this.calculatePriority(friction),
      createdAt: new Date(),
    };

    this.backlogGaps.push(gap);
    return gap;
  }

  /**
   * Generate gap title from friction point
   */
  private generateGapTitle(friction: FrictionPoint): string {
    switch (friction.type) {
      case FrictionType.MISSING_API:
        return `Missing API: ${friction.apiEndpoint || friction.element}`;
      case FrictionType.SLOW_RESPONSE:
        return `Slow API Response: ${friction.apiEndpoint} (${friction.responseTime}ms)`;
      case FrictionType.MOCK_DATA:
        return `Replace Mock Data: ${friction.apiEndpoint}`;
      case FrictionType.UI_BLOCKER:
        return `UI Blocker: ${friction.element || friction.page}`;
      default:
        return `Fix ${friction.type}: ${friction.description}`;
    }
  }

  /**
   * Map friction type to gap type
   */
  private mapFrictionToGapType(frictionType: FrictionType): BacklogGap['type'] {
    switch (frictionType) {
      case FrictionType.MISSING_API:
      case FrictionType.MOCK_DATA:
        return 'missing_api';
      case FrictionType.SLOW_RESPONSE:
        return 'slow_api';
      case FrictionType.ERROR_MESSAGE:
      case FrictionType.NETWORK_ERROR:
        return 'error_handling';
      case FrictionType.UI_BLOCKER:
        return 'ui_issue';
      default:
        return 'missing_api';
    }
  }

  /**
   * Estimate effort for fixing gap
   */
  private estimateEffort(friction: FrictionPoint): string {
    switch (friction.type) {
      case FrictionType.MISSING_API:
        return '3-5 days';
      case FrictionType.SLOW_RESPONSE:
        return '2-3 days';
      case FrictionType.MOCK_DATA:
        return '1-2 days';
      case FrictionType.UI_BLOCKER:
        return '1 day';
      default:
        return '2-4 days';
    }
  }

  /**
   * Calculate priority (higher = more urgent)
   */
  private calculatePriority(friction: FrictionPoint): number {
    const severityWeight = {
      critical: 100,
      high: 75,
      medium: 50,
      low: 25,
    };

    const typeWeight = {
      [FrictionType.MISSING_API]: 30,
      [FrictionType.UI_BLOCKER]: 25,
      [FrictionType.SLOW_RESPONSE]: 20,
      [FrictionType.ERROR_MESSAGE]: 15,
      [FrictionType.MOCK_DATA]: 10,
      [FrictionType.NETWORK_ERROR]: 5,
    };

    return severityWeight[friction.severity] + (typeWeight[friction.type] || 0);
  }

  /**
   * Generate backlog report
   */
  generateBacklogReport(): string {
    const reportPath = path.join(this.outputDir, `backlog-${Date.now()}.json`);
    
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalGaps: this.backlogGaps.length,
        bySeverity: {
          critical: this.backlogGaps.filter(g => g.severity === 'critical').length,
          high: this.backlogGaps.filter(g => g.severity === 'high').length,
          medium: this.backlogGaps.filter(g => g.severity === 'medium').length,
          low: this.backlogGaps.filter(g => g.severity === 'low').length,
        },
        byType: {
          missing_api: this.backlogGaps.filter(g => g.type === 'missing_api').length,
          slow_api: this.backlogGaps.filter(g => g.type === 'slow_api').length,
          error_handling: this.backlogGaps.filter(g => g.type === 'error_handling').length,
          ui_issue: this.backlogGaps.filter(g => g.type === 'ui_issue').length,
        },
      },
      gaps: this.backlogGaps.sort((a, b) => b.priority - a.priority),
      frictionPoints: this.frictionPoints,
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    return reportPath;
  }

  /**
   * Get all backlog gaps
   */
  getBacklogGaps(): BacklogGap[] {
    return this.backlogGaps.sort((a, b) => b.priority - a.priority);
  }
}

// Export singleton instance
export const e2eTestRunner = new EnhancedE2ETestRunner();

export default e2eTestRunner;
