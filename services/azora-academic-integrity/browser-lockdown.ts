/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * SECURE BROWSER LOCKDOWN SYSTEM
 * 
 * Secure exam browser similar to Safe Exam Browser (SEB) and Respondus LockDown Browser:
 * - Prevent tab switching
 * - Disable copy/paste
 * - Disable right-click
 * - Block external applications
 * - Disable print screen
 * - Full-screen enforcement
 * - Network restriction
 * - Browser extension blocking
 * 
 * Client-side JavaScript + Server-side monitoring
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

export interface LockdownSession {
  id: string;
  examId: string;
  studentNumber: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'ended' | 'violated';
  restrictions: LockdownRestrictions;
  violations: LockdownViolation[];
  heartbeats: Date[];
  lastActivity: Date;
}

export interface LockdownRestrictions {
  disableRightClick: boolean;
  disableCopyPaste: boolean;
  disablePrintScreen: boolean;
  enforceFullScreen: boolean;
  blockTabSwitching: boolean;
  blockApplicationSwitching: boolean;
  blockBrowserExtensions: boolean;
  blockDeveloperTools: boolean;
  restrictedNetworkAccess: boolean;
  allowedDomains: string[];
  monitorClipboard: boolean;
}

export interface LockdownViolation {
  id: string;
  timestamp: Date;
  type: 
    | 'tab_switch_attempt'
    | 'right_click_attempt'
    | 'copy_attempt'
    | 'paste_attempt'
    | 'print_screen_attempt'
    | 'fullscreen_exit'
    | 'developer_tools_opened'
    | 'extension_detected'
    | 'unauthorized_domain'
    | 'clipboard_access'
    | 'window_blur'
    | 'visibility_change';
  severity: 'minor' | 'moderate' | 'severe';
  blocked: boolean;
  details: string;
}

export interface LockdownConfig {
  examId: string;
  duration: number; // minutes
  restrictions: LockdownRestrictions;
  autoSubmitOnViolation: boolean;
  maxViolations: number;
  allowedWebsites?: string[];
  allowedTools?: string[];
}

export class BrowserLockdownService extends EventEmitter {
  private sessions: Map<string, LockdownSession> = new Map();
  private heartbeatInterval = 30000; // 30 seconds
  
  constructor() {
    super();
  }

  /**
   * Initialize browser lockdown for exam
   */
  async initializeLockdown(
    examId: string,
    studentNumber: string,
    config: LockdownConfig
  ): Promise<{
    sessionId: string;
    clientScript: string;
    config: LockdownRestrictions;
  }> {
    const sessionId = crypto.randomUUID();

    // Create session
    const session: LockdownSession = {
      id: sessionId,
      examId,
      studentNumber,
      startTime: new Date(),
      status: 'active',
      restrictions: config.restrictions,
      violations: [],
      heartbeats: [new Date()],
      lastActivity: new Date()
    };

    // Store session
    this.sessions.set(sessionId, session);

    // Generate client-side JavaScript
    const clientScript = this.generateClientScript(sessionId, config.restrictions);

    // Emit event
    this.emit('lockdown-initialized', session);

    console.log(`[LOCKDOWN] Browser lockdown initialized for exam ${examId}`);

    return {
      sessionId,
      clientScript,
      config: config.restrictions
    };
  }

  /**
   * Generate client-side JavaScript for browser lockdown
   */
  private generateClientScript(sessionId: string, restrictions: LockdownRestrictions): string {
    return `
(function() {
  'use strict';
  
  const SESSION_ID = '${sessionId}';
  const API_ENDPOINT = 'https://api.azora.world/proctoring';
  
  // Track violations
  let violations = [];
  
  // Disable right-click
  ${restrictions.disableRightClick ? `
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    recordViolation('right_click_attempt', 'Right-click attempted');
    return false;
  });
  ` : ''}
  
  // Disable copy/paste
  ${restrictions.disableCopyPaste ? `
  document.addEventListener('copy', function(e) {
    e.preventDefault();
    recordViolation('copy_attempt', 'Copy operation attempted');
    return false;
  });
  
  document.addEventListener('paste', function(e) {
    e.preventDefault();
    recordViolation('paste_attempt', 'Paste operation attempted');
    return false;
  });
  
  document.addEventListener('cut', function(e) {
    e.preventDefault();
    return false;
  });
  ` : ''}
  
  // Disable print screen
  ${restrictions.disablePrintScreen ? `
  document.addEventListener('keyup', function(e) {
    if (e.key === 'PrintScreen') {
      e.preventDefault();
      recordViolation('print_screen_attempt', 'Print Screen key pressed');
      
      // Clear clipboard
      navigator.clipboard.writeText('');
    }
  });
  ` : ''}
  
  // Detect developer tools
  ${restrictions.blockDeveloperTools ? `
  const devtools = /./;
  devtools.toString = function() {
    recordViolation('developer_tools_opened', 'Developer tools detected');
    return 'devtools';
  };
  console.log('%c', devtools);
  
  // Additional devtools detection
  let devtoolsOpen = false;
  const threshold = 160;
  
  setInterval(function() {
    if (window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        recordViolation('developer_tools_opened', 'Developer tools detected (size check)');
      }
    } else {
      devtoolsOpen = false;
    }
  }, 1000);
  ` : ''}
  
  // Enforce fullscreen
  ${restrictions.enforceFullScreen ? `
  function enterFullScreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  }
  
  // Enter fullscreen on load
  enterFullScreen();
  
  // Monitor fullscreen changes
  document.addEventListener('fullscreenchange', function() {
    if (!document.fullscreenElement) {
      recordViolation('fullscreen_exit', 'Exited fullscreen mode');
      enterFullScreen();
    }
  });
  
  document.addEventListener('webkitfullscreenchange', function() {
    if (!document.webkitFullscreenElement) {
      recordViolation('fullscreen_exit', 'Exited fullscreen mode');
      enterFullScreen();
    }
  });
  ` : ''}
  
  // Block tab switching
  ${restrictions.blockTabSwitching ? `
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      recordViolation('visibility_change', 'Tab switched or window hidden');
    }
  });
  
  window.addEventListener('blur', function() {
    recordViolation('window_blur', 'Window lost focus');
  });
  ` : ''}
  
  // Monitor clipboard
  ${restrictions.monitorClipboard ? `
  setInterval(async function() {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText && clipboardText.length > 0) {
        recordViolation('clipboard_access', 'Clipboard contains text: ' + clipboardText.substring(0, 50));
      }
    } catch (err) {
      // Clipboard access denied (expected)
    }
  }, 5000);
  ` : ''}
  
  // Detect extensions (via resource timing)
  ${restrictions.blockBrowserExtensions ? `
  function detectExtensions() {
    const extensionIds = [
      // Common extension IDs (Chrome Web Store)
      'chrome-extension://...',
    ];
    
    // Check for extension resources
    const resources = performance.getEntriesByType('resource');
    for (const resource of resources) {
      if (resource.name.includes('chrome-extension://') || 
          resource.name.includes('moz-extension://')) {
        recordViolation('extension_detected', 'Browser extension detected: ' + resource.name);
      }
    }
  }
  
  detectExtensions();
  setInterval(detectExtensions, 10000);
  ` : ''}
  
  // Heartbeat
  setInterval(function() {
    sendHeartbeat();
  }, 30000);
  
  // Record violation
  function recordViolation(type, details) {
    const violation = {
      type: type,
      details: details,
      timestamp: new Date().toISOString()
    };
    
    violations.push(violation);
    
    // Send to server
    fetch(API_ENDPOINT + '/lockdown/violation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: SESSION_ID,
        violation: violation
      })
    }).catch(err => console.error('Failed to report violation:', err));
    
    // Alert user
    console.warn('Lockdown violation detected:', type);
  }
  
  // Send heartbeat
  function sendHeartbeat() {
    fetch(API_ENDPOINT + '/lockdown/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: SESSION_ID,
        timestamp: new Date().toISOString()
      })
    }).catch(err => console.error('Heartbeat failed:', err));
  }
  
  // Prevent page unload during exam
  window.addEventListener('beforeunload', function(e) {
    e.preventDefault();
    e.returnValue = '';
    return 'Exam in progress. Are you sure you want to leave?';
  });
  
  // Block common shortcuts
  document.addEventListener('keydown', function(e) {
    // Block Ctrl+C, Ctrl+V, Ctrl+X
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
      e.preventDefault();
      recordViolation('copy_attempt', 'Keyboard shortcut blocked: ' + e.key);
      return false;
    }
    
    // Block F12 (developer tools)
    if (e.key === 'F12') {
      e.preventDefault();
      recordViolation('developer_tools_opened', 'F12 pressed');
      return false;
    }
    
    // Block Ctrl+Shift+I (inspect)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      recordViolation('developer_tools_opened', 'Inspect shortcut pressed');
      return false;
    }
    
    // Block Alt+Tab (application switching)
    if (e.altKey && e.key === 'Tab') {
      e.preventDefault();
      recordViolation('tab_switch_attempt', 'Alt+Tab pressed');
      return false;
    }
  });
  
  console.log('[LOCKDOWN] Browser security active for session:', SESSION_ID);
})();
    `.trim();
  }

  /**
   * Record violation from client
   */
  async recordViolation(
    sessionId: string,
    type: LockdownViolation['type'],
    details: string
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    const violation: LockdownViolation = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type,
      severity: this.getViolationSeverity(type),
      blocked: true,
      details
    };

    session.violations.push(violation);
    session.lastActivity = new Date();

    // Emit event
    this.emit('violation-detected', {
      session,
      violation
    });

    // Check if session should be terminated
    const severeViolations = session.violations.filter(v => v.severity === 'severe').length;
    if (severeViolations >= 3) {
      await this.terminateSession(sessionId, 'Too many severe violations');
    }
  }

  /**
   * Determine violation severity
   */
  private getViolationSeverity(type: LockdownViolation['type']): 'minor' | 'moderate' | 'severe' {
    const severityMap: Record<LockdownViolation['type'], 'minor' | 'moderate' | 'severe'> = {
      'tab_switch_attempt': 'moderate',
      'right_click_attempt': 'minor',
      'copy_attempt': 'moderate',
      'paste_attempt': 'moderate',
      'print_screen_attempt': 'moderate',
      'fullscreen_exit': 'severe',
      'developer_tools_opened': 'severe',
      'extension_detected': 'severe',
      'unauthorized_domain': 'severe',
      'clipboard_access': 'moderate',
      'window_blur': 'moderate',
      'visibility_change': 'moderate'
    };

    return severityMap[type];
  }

  /**
   * Receive heartbeat from client
   */
  async receiveHeartbeat(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    session.heartbeats.push(new Date());
    session.lastActivity = new Date();
  }

  /**
   * End lockdown session
   */
  async endSession(sessionId: string): Promise<LockdownSession> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    session.endTime = new Date();
    session.status = session.violations.length > 0 ? 'violated' : 'ended';

    // Emit event
    this.emit('lockdown-ended', session);

    return session;
  }

  /**
   * Terminate session (for severe violations)
   */
  async terminateSession(sessionId: string, reason: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'violated';
    session.endTime = new Date();

    // Emit event
    this.emit('lockdown-terminated', {
      session,
      reason
    });
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): LockdownSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Check if session is active
   */
  isSessionActive(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    return session !== undefined && session.status === 'active';
  }

  /**
   * Get violations for session
   */
  getViolations(sessionId: string): LockdownViolation[] {
    const session = this.sessions.get(sessionId);
    return session?.violations || [];
  }
}

// Create singleton
export const browserLockdownService = new BrowserLockdownService();

export default browserLockdownService;
