/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/
/**
 * Constitutional Learning Agent (CLA)
 *
 * AI-powered adaptive learning system that:
 * - Analyzes learner progress and PIVC scores
 * - Dynamically adjusts curriculum
 * - Vets content for constitutional alignment
 * - Provides intelligent remediation and acceleration
 */

import { EventEmitter } from 'events';

export interface LearnerProfile {
  id: string;
  userId: string;
  pivcScore: number;
  constitutionalAlignment: number;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  strengths: string[];
  weaknesses: string[];
  completedModules: string[];
  currentPath: LearningPath;
  achievements: Achievement[];
}

export interface LearningPath {
  id: string;
  name: string;
  difficulty: 'foundation' | 'intermediate' | 'advanced' | 'expert';
  modules: LearningModule[];
  estimatedDuration: number;
  pivcTarget: number;
  adaptiveRules: AdaptiveRule[];
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'reading' | 'quiz' | 'project' | 'discussion' | 'lab';
  duration: number;
  pivcWeight: number;
  prerequisites: string[];
  content: ModuleContent;
  assessments: Assessment[];
  constitutionalScore: number;
}

export interface ModuleContent {
  text?: string;
  videoUrl?: string;
  resources: Resource[];
  interactiveElements: InteractiveElement[];
}

export interface Resource {
  id: string;
  type: 'pdf' | 'link' | 'code' | 'dataset';
  title: string;
  url: string;
  constitutionallyVetted: boolean;
}

export interface InteractiveElement {
  id: string;
  type: 'quiz' | 'code-editor' | 'simulation' | 'discussion';
  config: Record<string, any>;
}

export interface Assessment {
  id: string;
  type: 'quiz' | 'project' | 'peer-review' | 'self-assessment';
  questions: Question[];
  passingScore: number;
  pivcImpact: number;
  constitutionalAlignment: boolean;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'essay' | 'code' | 'practical';
  text: string;
  options?: string[];
  correctAnswer?: string;
  rubric?: Rubric;
  pivcWeight: number;
}

export interface Rubric {
  criteria: RubricCriterion[];
  totalPoints: number;
}

export interface RubricCriterion {
  name: string;
  description: string;
  points: number;
  constitutionalAlignment: boolean;
}

export interface AdaptiveRule {
  id: string;
  condition: string;
  action: 'remediate' | 'accelerate' | 'skip' | 'review' | 'challenge';
  threshold: number;
  targetModules: string[];
}

export interface Achievement {
  id: string;
  type: 'sovereign-star' | 'badge' | 'certificate' | 'credential';
  name: string;
  description: string;
  earnedAt: number;
  pivcValue: number;
  verifiable: boolean;
  didCredential?: string;
}

export interface ContentVettingResult {
  contentId: string;
  constitutionalScore: number;
  alignment: 'excellent' | 'good' | 'acceptable' | 'poor' | 'rejected';
  issues: string[];
  recommendations: string[];
  approved: boolean;
}

/**
 * Constitutional Learning Agent
 */
export class ConstitutionalLearningAgent extends EventEmitter {
  private static instance: ConstitutionalLearningAgent;
  private learnerProfiles: Map<string, LearnerProfile> = new Map();
  private learningPaths: Map<string, LearningPath> = new Map();
  private contentCache: Map<string, ContentVettingResult> = new Map();

  private constructor() {
    super();
    this.initializeDefaultPaths();
  }

  public static getInstance(): ConstitutionalLearningAgent {
    if (!ConstitutionalLearningAgent.instance) {
      ConstitutionalLearningAgent.instance = new ConstitutionalLearningAgent();
    }
    return ConstitutionalLearningAgent.instance;
  }

  private initializeDefaultPaths(): void {
    // Foundation path for new learners
    this.learningPaths.set('foundation', {
      id: 'foundation',
      name: 'Sapiens Foundation',
      difficulty: 'foundation',
      modules: [],
      estimatedDuration: 40 * 60 * 60 * 1000, // 40 hours
      pivcTarget: 100,
      adaptiveRules: [
        {
          id: 'remediate-low-score',
          condition: 'assessment_score < 70',
          action: 'remediate',
          threshold: 70,
          targetModules: [],
        },
        {
          id: 'accelerate-high-pivc',
          condition: 'pivc_score > 150',
          action: 'accelerate',
          threshold: 150,
          targetModules: [],
        },
      ],
    });
  }

  /**
   * Analyze learner and create/update adaptive path
   */
  public async analyzeAndAdapt(userId: string): Promise<LearningPath> {
    let profile = this.learnerProfiles.get(userId);

    if (!profile) {
      profile = await this.createLearnerProfile(userId);
    }

    // Analyze current progress
    const analysis = this.analyzeLearnerProgress(profile);

    // Apply adaptive rules
    const adaptedPath = await this.applyAdaptiveRules(profile, analysis);

    // Update profile
    profile.currentPath = adaptedPath;
    this.learnerProfiles.set(userId, profile);

    this.emit('path-adapted', { userId, path: adaptedPath });

    return adaptedPath;
  }

  private async createLearnerProfile(userId: string): Promise<LearnerProfile> {
    const profile: LearnerProfile = {
      id: `profile-${userId}`,
      userId,
      pivcScore: 0,
      constitutionalAlignment: 100,
      learningStyle: 'visual',
      strengths: [],
      weaknesses: [],
      completedModules: [],
      currentPath: this.learningPaths.get('foundation')!,
      achievements: [],
    };

    this.learnerProfiles.set(userId, profile);
    return profile;
  }

  private analyzeLearnerProgress(profile: LearnerProfile): ProgressAnalysis {
    const completionRate = profile.completedModules.length /
      (profile.currentPath.modules.length || 1);

    const avgPivcPerModule = profile.pivcScore /
      (profile.completedModules.length || 1);

    return {
      completionRate,
      avgPivcPerModule,
      needsRemediation: avgPivcPerModule < 10,
      readyForAcceleration: avgPivcPerModule > 20 && profile.pivcScore > 150,
      constitutionalAlignment: profile.constitutionalAlignment,
      recommendedAction: this.determineRecommendedAction(profile, completionRate, avgPivcPerModule),
    };
  }

  private determineRecommendedAction(
    profile: LearnerProfile,
    completionRate: number,
    avgPivc: number
  ): 'continue' | 'remediate' | 'accelerate' | 'review' {
    if (avgPivc < 10 && completionRate > 0.3) return 'remediate';
    if (avgPivc > 20 && profile.pivcScore > 150) return 'accelerate';
    if (completionRate > 0.8) return 'review';
    return 'continue';
  }

  private async applyAdaptiveRules(
    profile: LearnerProfile,
    analysis: ProgressAnalysis
  ): Promise<LearningPath> {
    const currentPath = { ...profile.currentPath };

    for (const rule of currentPath.adaptiveRules) {
      if (this.evaluateRule(rule, profile, analysis)) {
        await this.executeAdaptiveAction(rule, currentPath, profile);
      }
    }

    return currentPath;
  }

  private evaluateRule(
    rule: AdaptiveRule,
    profile: LearnerProfile,
    analysis: ProgressAnalysis
  ): boolean {
    // Simple rule evaluation (can be enhanced with proper parser)
    if (rule.condition.includes('pivc_score')) {
      return profile.pivcScore > rule.threshold;
    }
    if (rule.condition.includes('assessment_score')) {
      return analysis.avgPivcPerModule < rule.threshold;
    }
    return false;
  }

  private async executeAdaptiveAction(
    rule: AdaptiveRule,
    path: LearningPath,
    profile: LearnerProfile
  ): Promise<void> {
    switch (rule.action) {
      case 'remediate':
        await this.generateRemediationModules(profile, path);
        break;
      case 'accelerate':
        await this.skipFoundationalModules(profile, path);
        break;
      case 'skip':
        this.skipModules(path, rule.targetModules);
        break;
      case 'review':
        await this.addReviewModules(profile, path);
        break;
      case 'challenge':
        await this.addChallengeModules(profile, path);
        break;
    }

    this.emit('adaptive-action', { rule, profile, path });
  }

  private async generateRemediationModules(
    profile: LearnerProfile,
    path: LearningPath
  ): Promise<void> {
    // AI-generated remediation based on weaknesses
    const remediationModule: LearningModule = {
      id: `remediation-${Date.now()}`,
      title: `Remediation: ${profile.weaknesses.join(', ')}`,
      description: 'AI-generated focused review',
      type: 'quiz',
      duration: 15 * 60 * 1000, // 15 minutes
      pivcWeight: 5,
      prerequisites: [],
      content: {
        resources: [],
        interactiveElements: [],
      },
      assessments: [],
      constitutionalScore: 100,
    };

    path.modules.unshift(remediationModule);
  }

  private async skipFoundationalModules(
    profile: LearnerProfile,
    path: LearningPath
  ): Promise<void> {
    // Remove foundation modules for high-performers
    path.modules = path.modules.filter(m =>
      !m.title.toLowerCase().includes('foundation') &&
      !m.title.toLowerCase().includes('introduction')
    );
  }

  private skipModules(path: LearningPath, moduleIds: string[]): void {
    path.modules = path.modules.filter(m => !moduleIds.includes(m.id));
  }

  private async addReviewModules(
    profile: LearnerProfile,
    path: LearningPath
  ): Promise<void> {
    // Add comprehensive review before final assessment
    const reviewModule: LearningModule = {
      id: `review-${Date.now()}`,
      title: 'Comprehensive Review',
      description: 'Review all key concepts',
      type: 'quiz',
      duration: 30 * 60 * 1000,
      pivcWeight: 10,
      prerequisites: [],
      content: {
        resources: [],
        interactiveElements: [],
      },
      assessments: [],
      constitutionalScore: 100,
    };

    path.modules.push(reviewModule);
  }

  private async addChallengeModules(
    profile: LearnerProfile,
    path: LearningPath
  ): Promise<void> {
    // Add advanced challenge for high performers
    const challengeModule: LearningModule = {
      id: `challenge-${Date.now()}`,
      title: 'Advanced Challenge',
      description: 'Real-world application project',
      type: 'project',
      duration: 120 * 60 * 1000, // 2 hours
      pivcWeight: 50,
      prerequisites: [],
      content: {
        resources: [],
        interactiveElements: [],
      },
      assessments: [],
      constitutionalScore: 100,
    };

    path.modules.push(challengeModule);
  }

  /**
   * Vet content for constitutional alignment
   */
  public async vetContent(
    contentId: string,
    content: string,
    type: string
  ): Promise<ContentVettingResult> {
    // Check cache first
    if (this.contentCache.has(contentId)) {
      return this.contentCache.get(contentId)!;
    }

    // Perform constitutional vetting
    const score = await this.calculateConstitutionalScore(content);
    const issues = await this.detectConstitutionalIssues(content);
    const recommendations = await this.generateRecommendations(content, issues);

    const result: ContentVettingResult = {
      contentId,
      constitutionalScore: score,
      alignment: this.determineAlignment(score),
      issues,
      recommendations,
      approved: score >= 70,
    };

    this.contentCache.set(contentId, result);
    this.emit('content-vetted', result);

    return result;
  }

  private async calculateConstitutionalScore(content: string): Promise<number> {
    // Simulate constitutional scoring (integrate with CRE)
    let score = 100;

    // Deduct for potential issues
    if (content.toLowerCase().includes('misleading')) score -= 30;
    if (content.toLowerCase().includes('unverified')) score -= 20;
    if (content.length < 100) score -= 10;

    return Math.max(0, score);
  }

  private async detectConstitutionalIssues(content: string): Promise<string[]> {
    const issues: string[] = [];

    if (content.toLowerCase().includes('misleading')) {
      issues.push('Potentially misleading information detected');
    }
    if (content.toLowerCase().includes('unverified')) {
      issues.push('Unverified claims present');
    }
    if (content.length < 100) {
      issues.push('Content too brief for proper context');
    }

    return issues;
  }

  private async generateRecommendations(
    content: string,
    issues: string[]
  ): Promise<string[]> {
    const recommendations: string[] = [];

    if (issues.length > 0) {
      recommendations.push('Add citations and references');
      recommendations.push('Provide more context and examples');
      recommendations.push('Ensure claims are verifiable');
    }

    return recommendations;
  }

  private determineAlignment(score: number): ContentVettingResult['alignment'] {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'acceptable';
    if (score >= 50) return 'poor';
    return 'rejected';
  }

  /**
   * Generate AI-powered assessment
   */
  public async generateAssessment(
    moduleId: string,
    difficulty: string,
    pivcWeight: number
  ): Promise<Assessment> {
    const assessment: Assessment = {
      id: `assessment-${Date.now()}`,
      type: 'quiz',
      questions: await this.generateQuestions(moduleId, difficulty, 5),
      passingScore: 70,
      pivcImpact: pivcWeight,
      constitutionalAlignment: true,
    };

    this.emit('assessment-generated', assessment);
    return assessment;
  }

  private async generateQuestions(
    moduleId: string,
    difficulty: string,
    count: number
  ): Promise<Question[]> {
    const questions: Question[] = [];

    for (let i = 0; i < count; i++) {
      questions.push({
        id: `q-${moduleId}-${i}`,
        type: 'multiple-choice',
        text: `Question ${i + 1} about ${moduleId}`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        pivcWeight: 10,
      });
    }

    return questions;
  }

  /**
   * Provide intelligent feedback
   */
  public async provideFeedback(
    userId: string,
    assessmentId: string,
    answers: Record<string, string>
  ): Promise<FeedbackResult> {
    const profile = this.learnerProfiles.get(userId);
    if (!profile) {
      throw new Error('Learner profile not found');
    }

    const feedback: FeedbackResult = {
      assessmentId,
      score: 0,
      pivcEarned: 0,
      constitutionalAlignment: 100,
      detailedFeedback: [],
      recommendations: [],
      nextSteps: [],
    };

    // Analyze answers and provide feedback
    feedback.score = Math.random() * 100; // Simulate scoring
    feedback.pivcEarned = feedback.score * 0.5;
    feedback.detailedFeedback.push('Good understanding of core concepts');
    feedback.recommendations.push('Review advanced topics');
    feedback.nextSteps.push('Proceed to next module');

    this.emit('feedback-provided', { userId, feedback });
    return feedback;
  }

  public getLearnerProfile(userId: string): LearnerProfile | undefined {
    return this.learnerProfiles.get(userId);
  }

  public getLearningPath(pathId: string): LearningPath | undefined {
    return this.learningPaths.get(pathId);
  }

  /**
   * Get learning path for user (for GraphQL)
   */
  public async getLearningPathForUser(userId: string): Promise<any> {
    let profile = await this.getLearnerProfile(userId);

    if (!profile) {
      profile = await this.createLearnerProfile(userId);
    }

    // Adapt path based on progress
    const adaptedPath = await this.adaptLearningPath(userId);

    return {
      id: adaptedPath.id,
      name: adaptedPath.name,
      modules: adaptedPath.modules,
      progress: profile.completedModules.length / (adaptedPath.modules.length || 1) * 100,
    };
  }

  /**
   * Vet content by ID (for GraphQL) - simplified version
   */
  public async vetContent(contentId: string): Promise<any> {
    // For now, return a mock result
    // In production, would fetch content from database
    return {
      contentId,
      score: 95,
      alignment: 'excellent',
      issues: [],
      approved: true,
    };
  }
}

interface ProgressAnalysis {
  completionRate: number;
  avgPivcPerModule: number;
  needsRemediation: boolean;
  readyForAcceleration: boolean;
  constitutionalAlignment: number;
  recommendedAction: 'continue' | 'remediate' | 'accelerate' | 'review';
}

interface FeedbackResult {
  assessmentId: string;
  score: number;
  pivcEarned: number;
  constitutionalAlignment: number;
  detailedFeedback: string[];
  recommendations: string[];
  nextSteps: string[];
}

export default ConstitutionalLearningAgent;

