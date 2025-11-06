/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Azora IDE Core
 *
 * Superior IDE built by learning from Cursor and enhancing with Elara
 */

import { EventEmitter } from 'events';
import { CursorLearningEngine } from './cursor-learning-engine';
import { ElaraCore } from '../system-core/agent-tools/elara-core';
import { EthicalFramework } from '../system-core/ethical-framework';

export interface IDEConfig {
  elaraEnabled: boolean;
  ethicalFramework: boolean;
  aiCompletion: boolean;
  realTimeCollaboration: boolean;
  voiceControl: boolean;
  gestureControl: boolean;
}

export interface EditorSession {
  id: string;
  projectPath: string;
  files: Map<string, string>;
  collaborators: string[];
  aiContext: any;
}

export class AzoraIDE extends EventEmitter {
  private static instance: AzoraIDE;
  private learningEngine: CursorLearningEngine;
  private elara: ElaraCore;
  private ethicalFramework: EthicalFramework;
  private sessions: Map<string, EditorSession> = new Map();
  private config: IDEConfig;

  private constructor() {
    super();
    this.learningEngine = CursorLearningEngine.getInstance();
    this.elara = ElaraCore.getInstance();
    this.ethicalFramework = new EthicalFramework();
    this.config = {
      elaraEnabled: true,
      ethicalFramework: true,
      aiCompletion: true,
      realTimeCollaboration: true,
      voiceControl: false,
      gestureControl: false
    };
  }

  public static getInstance(): AzoraIDE {
    if (!AzoraIDE.instance) {
      AzoraIDE.instance = new AzoraIDE();
    }
    return AzoraIDE.instance;
  }

  /**
   * Initialize IDE and learn from Cursor
   */
  public async initialize(): Promise<void> {
    console.log('🚀 Initializing Azora IDE...');
    console.log('🧠 Learning from Cursor codebase...');

    // Learn from Cursor
    await this.learningEngine.ingestCursorCodebase();

    // Get enhanced features
    const enhanced = this.learningEngine.generateEnhancedIDE();
    console.log(`✅ Learned ${enhanced.features.length} features from Cursor`);

    // Initialize Elara
    if (this.config.elaraEnabled) {
      await this.elara.initialize();
    }

    this.emit('initialized', enhanced);
  }

  /**
   * Create new editor session
   */
  public createSession(projectPath: string): EditorSession {
    const session: EditorSession = {
      id: `session-${Date.now()}`,
      projectPath,
      files: new Map(),
      collaborators: [],
      aiContext: {}
    };

    this.sessions.set(session.id, session);
    this.emit('session-created', session);
    return session;
  }

  /**
   * AI-powered code completion
   */
  public async completeCode(
    sessionId: string,
    file: string,
    context: string,
    cursor: { line: number; column: number }
  ): Promise<string[]> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Get Elara suggestions
    const suggestions = await this.elara.suggestCodeCompletion({
      file,
      context,
      cursor,
      projectContext: {
        path: session.projectPath,
        files: Array.from(session.files.entries())
      }
    });

    // Filter through ethical framework
    const filtered = await this.ethicalFramework.filterSuggestions(suggestions);

    return filtered;
  }

  /**
   * AI chat interface (like Cursor)
   */
  public async chat(
    sessionId: string,
    message: string,
    context?: any
  ): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Use Elara for chat
    const response = await this.elara.chat({
      message,
      context: {
        ...session.aiContext,
        ...context,
        projectPath: session.projectPath
      }
    });

    return response;
  }

  /**
   * Real-time collaboration
   */
  public async shareSession(sessionId: string, userId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    session.collaborators.push(userId);
    this.emit('session-shared', { sessionId, userId });
  }

  /**
   * Get IDE status
   */
  public getStatus(): {
    initialized: boolean;
    sessions: number;
    learnedFeatures: number;
    elaraEnabled: boolean;
  } {
    return {
      initialized: true,
      sessions: this.sessions.size,
      learnedFeatures: this.learningEngine.getLearnedFeatures().length,
      elaraEnabled: this.config.elaraEnabled
    };
  }
}

export default AzoraIDE;


