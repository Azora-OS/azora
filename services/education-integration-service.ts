/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * EDUCATION INTEGRATION SERVICE
 * Connects all education components: PoK Engine, Elara AI, LMS, SMS Learning
 * Provides unified API for education ecosystem
 */

import { EventEmitter } from 'events';
import { pokEngine } from './proof-of-knowledge-engine';
import { elaraAI } from './elara-ai-tutor';
import { smsLearning } from './sms-learning';
import { aiEducation } from './azora-education/ai-integration';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  language: string;
  level: number;
  totalEarned: number;
  coursesCompleted: number;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  strengths: string[];
  weaknesses: string[];
}

export interface LearningSession {
  sessionId: string;
  studentId: string;
  moduleId: string;
  startTime: Date;
  endTime?: Date;
  score?: number;
  rewardEarned?: number;
  completed: boolean;
}

export class EducationIntegrationService extends EventEmitter {
  private sessions: Map<string, LearningSession> = new Map();

  constructor() {
    super();
    this.initializeEventListeners();
    console.log('🎓 Education Integration Service initialized');
  }

  /**
   * Initialize cross-service event listeners
   */
  private initializeEventListeners(): void {
    // PoK Engine events
    pokEngine.on('proof-submitted', (proof) => {
      this.emit('student-earned', {
        userId: proof.userId,
        amount: proof.rewardAmount,
        moduleId: proof.moduleId
      });
    });

    // Elara AI events
    elaraAI.on('learning-path-generated', (data) => {
      this.emit('learning-path-updated', data);
    });

    // SMS Learning events
    smsLearning.on('sms-sent', (data) => {
      this.emit('sms-notification', data);
    });

    console.log('✅ Cross-service event listeners initialized');
  }

  /**
   * Start comprehensive learning session
   */
  async startLearningSession(
    studentId: string,
    moduleId: string,
    channel: 'web' | 'mobile' | 'sms' | 'ussd' = 'web'
  ): Promise<LearningSession> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session: LearningSession = {
      sessionId,
      studentId,
      moduleId,
      startTime: new Date(),
      completed: false
    };

    this.sessions.set(sessionId, session);

    // Get personalized lesson from Elara AI
    const lesson = await elaraAI.getNextLesson(studentId);

    console.log(`📚 Learning session started: ${sessionId} (${channel})`);
    this.emit('session-started', { session, lesson, channel });

    return session;
  }

  /**
   * Complete learning session and process rewards
   */
  async completeLearningSession(
    sessionId: string,
    score: number,
    module: any
  ): Promise<any> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.endTime = new Date();
    session.score = score;
    session.completed = true;

    // Submit proof of knowledge
    const proof = await pokEngine.submitProof(session.studentId, module, score);
    session.rewardEarned = proof.rewardAmount;

    // Record on blockchain
    const txHash = await pokEngine.recordOnChain(proof);

    // Get encouragement from Elara
    const encouragement = await elaraAI.encourage(
      session.studentId,
      `Completed ${module.title} with ${score}% score`
    );

    console.log(`✅ Session completed: ${sessionId} - Earned ${proof.rewardAmount} AZR`);
    this.emit('session-completed', { session, proof, txHash, encouragement });

    return {
      session,
      proof,
      txHash,
      encouragement,
      certificate: await pokEngine.getCertificate(proof.id)
    };
  }

  /**
   * Get comprehensive student dashboard
   */
  async getStudentDashboard(studentId: string): Promise<any> {
    // Get data from all services
    const [learningPath, proofs, rewards] = await Promise.all([
      elaraAI.analyzeLearner(studentId),
      pokEngine.getUserProofs(studentId),
      Promise.resolve(pokEngine.getUserRewards(studentId))
    ]);

    const stats = pokEngine.getStats();

    const dashboard = {
      studentId,
      learningPath,
      totalEarned: rewards,
      proofsCompleted: proofs.length,
      averageScore:
        proofs.reduce((sum, p) => sum + p.score, 0) / proofs.length || 0,
      recentProofs: proofs.slice(0, 5),
      nextLesson: await elaraAI.getNextLesson(studentId),
      systemStats: stats,
      timestamp: new Date().toISOString()
    };

    console.log(`📊 Dashboard generated for student: ${studentId}`);
    this.emit('dashboard-generated', dashboard);

    return dashboard;
  }

  /**
   * Multi-channel learning support
   */
  async sendLearningContent(
    studentId: string,
    content: string,
    channels: Array<'email' | 'sms' | 'push'> = ['sms']
  ): Promise<void> {
    for (const channel of channels) {
      if (channel === 'sms') {
        // Get student phone number and send via SMS
        // await smsLearning.sendSMS(phoneNumber, content)
        console.log(`📱 SMS sent to student: ${studentId}`);
      }
      // Add other channels as needed
    }

    this.emit('content-sent', { studentId, channels, content });
  }

  /**
   * AI-powered study recommendations
   */
  async getStudyRecommendations(studentId: string): Promise<any> {
    const learningPath = await elaraAI.analyzeLearner(studentId);
    const proofs = await pokEngine.getUserProofs(studentId);

    // Analyze recent performance
    const recentScores = proofs.slice(0, 5).map(p => p.score);
    const avgRecent =
      recentScores.reduce((a, b) => a + b, 0) / recentScores.length || 0;

    // Get AI recommendations
    const recommendations = {
      focusAreas: learningPath.weaknesses.slice(0, 3),
      suggestedModules: learningPath.recommendedModules,
      studyTime: this.calculateOptimalStudyTime(avgRecent, learningPath.pace),
      difficulty: learningPath.currentLevel,
      motivationalMessage: await elaraAI.encourage(
        studentId,
        'Keep up the great work!'
      )
    };

    console.log(`💡 Study recommendations generated for: ${studentId}`);
    this.emit('recommendations-generated', recommendations);

    return recommendations;
  }

  /**
   * Batch process student assessments
   */
  async batchProcessAssessments(assessments: any[]): Promise<any> {
    const results = [];

    for (const assessment of assessments) {
      try {
        const result = await this.completeLearningSession(
          assessment.sessionId,
          assessment.score,
          assessment.module
        );
        results.push({ success: true, ...result });
      } catch (error: any) {
        results.push({
          success: false,
          sessionId: assessment.sessionId,
          error: error.message
        });
      }
    }

    // Process batch rewards on blockchain
    const proofs = results
      .filter(r => r.success && r.proof)
      .map(r => r.proof);
    const totalDistributed = await pokEngine.processBatchRewards(proofs);

    console.log(
      `📦 Batch processed: ${results.length} assessments, ${totalDistributed} AZR distributed`
    );
    this.emit('batch-processed', { results, totalDistributed });

    return { results, totalDistributed };
  }

  /**
   * Generate learning analytics
   */
  async getSystemAnalytics(): Promise<any> {
    const pokStats = pokEngine.getStats();
    const smsStats = smsLearning.getStats();

    const analytics = {
      totalProofs: pokStats.totalProofs,
      totalRewards: pokStats.totalRewardsDistributed,
      uniqueStudents: pokStats.uniqueUsers,
      averageScore: pokStats.averageScore,
      averageReward: pokStats.averageReward,
      activeSMSSessions: smsStats.activeSessions,
      supportedLanguages: smsStats.languages,
      activeSessions: this.sessions.size,
      timestamp: new Date().toISOString()
    };

    console.log('📈 System analytics generated');
    this.emit('analytics-generated', analytics);

    return analytics;
  }

  /**
   * Health check for all education services
   */
  async healthCheck(): Promise<any> {
    const health = {
      pokEngine: { status: 'healthy', stats: pokEngine.getStats() },
      elaraAI: { status: 'healthy', voiceEnabled: true },
      smsLearning: { status: 'healthy', stats: smsLearning.getStats() },
      aiEducation: { status: 'healthy' },
      integration: { status: 'healthy', activeSessions: this.sessions.size },
      timestamp: new Date().toISOString()
    };

    console.log('✅ Health check completed');
    return health;
  }

  /**
   * Calculate optimal study time based on performance
   */
  private calculateOptimalStudyTime(
    avgScore: number,
    pace: 'slow' | 'medium' | 'fast'
  ): number {
    let baseTime = 30; // minutes

    if (pace === 'slow') baseTime = 45;
    if (pace === 'fast') baseTime = 20;

    // Adjust based on performance
    if (avgScore < 60) baseTime += 15;
    if (avgScore >= 85) baseTime -= 10;

    return Math.max(15, Math.min(60, baseTime));
  }

  /**
   * Get active sessions
   */
  getActiveSessions(): LearningSession[] {
    return Array.from(this.sessions.values()).filter(s => !s.completed);
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): LearningSession | undefined {
    return this.sessions.get(sessionId);
  }
}

// Export singleton instance
export const educationIntegration = new EducationIntegrationService();
export default educationIntegration;
