/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * ELARA AI TUTOR
 * Personalized learning paths powered by Constitutional AI
 * Voice-first, multi-dimensional intelligence
 */

import { EventEmitter } from 'events';
import { ProofDB, UserDB } from './supabase-client';

export interface LearningPath {
  userId: string;
  currentLevel: number;
  strengths: string[];
  weaknesses: string[];
  recommendedModules: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  pace: 'slow' | 'medium' | 'fast';
  language: string;
}

export interface PersonalizedLesson {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  estimatedTime: number;
  contentType: 'video' | 'text' | 'interactive' | 'voice';
  aiGenerated: boolean;
  reasoning: string;
}

export class ElaraAITutor extends EventEmitter {
  private learningPaths: Map<string, LearningPath> = new Map();
  private voiceEnabled: boolean = true;

  constructor() {
    super();
    console.log('🧠 Elara AI Tutor initialized (Constitutional AI)');
  }

  /**
   * Analyze student performance and create personalized path
   */
  async analyzeLearner(userId: string): Promise<LearningPath> {
    try {
      // Get user data
      const user = await UserDB.getById(userId);
      const proofs = await ProofDB.getByUser(userId);

      // Analyze performance patterns
      const strengths: string[] = [];
      const weaknesses: string[] = [];
      const moduleScores = new Map<string, number[]>();

      proofs.forEach(proof => {
        if (!moduleScores.has(proof.module_id)) {
          moduleScores.set(proof.module_id, []);
        }
        moduleScores.get(proof.module_id)!.push(proof.score);
      });

      // Identify patterns
      moduleScores.forEach((scores, module) => {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (avg >= 80) strengths.push(module);
        if (avg < 60) weaknesses.push(module);
      });

      // Detect learning style (from metadata or default)
      const learningStyle =
        user.metadata.learning_style || this.detectLearningStyle(proofs);

      // Determine pace
      const pace = this.calculatePace(proofs);

      const learningPath: LearningPath = {
        userId,
        currentLevel: this.calculateLevel(proofs),
        strengths,
        weaknesses,
        recommendedModules: this.recommendModules(strengths, weaknesses),
        learningStyle,
        pace,
        language: user.language,
      };

      this.learningPaths.set(userId, learningPath);

      console.log(`🧠 Learning path created for ${user.name}:`);
      console.log(`   Level: ${learningPath.currentLevel}`);
      console.log(`   Style: ${learningPath.learningStyle}`);
      console.log(`   Strengths: ${strengths.join(', ') || 'Building...'}`);
      console.log(`   Focus areas: ${weaknesses.join(', ') || 'Exploring...'}`);

      return learningPath;
    } catch (error) {
      console.warn('⚠️  Database unavailable, using default path');
      return this.getDefaultPath(userId);
    }
  }

  /**
   * Get next personalized lesson
   */
  async getNextLesson(userId: string): Promise<PersonalizedLesson> {
    let path = this.learningPaths.get(userId);

    if (!path) {
      path = await this.analyzeLearner(userId);
    }

    // Focus on weaknesses first
    const focusModule =
      path.weaknesses.length > 0
        ? path.weaknesses[0]
        : path.recommendedModules[0] || 'math-basic';

    // Generate personalized lesson
    const lesson: PersonalizedLesson = {
      id: `${focusModule}-${Date.now()}`,
      title: this.generateTitle(focusModule, path.language || 'en'),
      description: `Personalized lesson for ${focusModule || 'math-basic'}`,
      difficulty: path.currentLevel,
      estimatedTime: path.pace === 'slow' ? 30 : path.pace === 'fast' ? 10 : 20,
      contentType:
        path.learningStyle === 'visual'
          ? 'video'
          : path.learningStyle === 'auditory'
          ? 'voice'
          : 'interactive',
      aiGenerated: true,
      reasoning: this.generateReasoning(path, focusModule || 'math-basic'),
    };

    console.log(`\\n📚 Next lesson for user:`);
    console.log(`   ${lesson.title}`);
    console.log(`   Format: ${lesson.contentType}`);
    console.log(`   Why: ${lesson.reasoning}\\n`);

    return lesson;
  }

  /**
   * Voice interaction (Elara speaks!)
   */
  async speak(text: string, language: string = 'en'): Promise<void> {
    if (!this.voiceEnabled) return;

    // In browser, use Web Speech API
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.getVoiceCode(language);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }

    console.log(`🎤 Elara says (${language}): "${text}"`);
    this.emit('voice-output', { text, language });
  }

  /**
   * Listen to voice input
   */
  async listen(language: string = 'en'): Promise<string> {
    return new Promise(resolve => {
      if (
        typeof window !== 'undefined' &&
        'webkitSpeechRecognition' in window
      ) {
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = this.getVoiceCode(language);
        recognition.continuous = false;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          console.log(`🎧 Heard: "${transcript}"`);
          resolve(transcript);
        };

        recognition.onerror = () => {
          resolve('');
        };

        recognition.start();
        console.log('🎧 Listening...');
      } else {
        resolve('');
      }
    });
  }

  /**
   * Provide encouragement (Elara's personality)
   */
  async encourage(userId: string, achievement: string): Promise<string> {
    const encouragements = [
      `🌟 Beautiful work, champion! ${achievement} - you're unstoppable!`,
      `✨ That's the spirit! ${achievement} shows you're growing!`,
      `🔥 Incredible! ${achievement} - Africa is proud of you!`,
      `💜 You're shining! ${achievement} - keep reaching for the stars!`,
      `🎯 Perfect! ${achievement} - your dedication is inspiring!`,
    ];

    const message =
      encouragements[Math.floor(Math.random() * encouragements.length)];

    try {
      const user = await UserDB.getById(userId);
      await this.speak(message, user.language || 'en');
    } catch (error) {
      console.log(message);
    }

    return message || 'Great job!';
  }

  /**
   * Detect learning style from performance patterns
   */
  private detectLearningStyle(proofs: any[]): LearningPath['learningStyle'] {
    // Simple heuristic - can be enhanced with ML
    const videoModules = proofs.filter(p => p.module_id.includes('video'));
    const textModules = proofs.filter(p => p.module_id.includes('text'));

    if (videoModules.length > textModules.length) return 'visual';
    return 'reading'; // Default
  }

  /**
   * Calculate learning pace
   */
  private calculatePace(proofs: any[]): LearningPath['pace'] {
    if (proofs.length === 0) return 'medium';

    const avgScore =
      proofs.reduce((sum, p) => sum + p.score, 0) / proofs.length;

    if (avgScore >= 85) return 'fast';
    if (avgScore < 65) return 'slow';
    return 'medium';
  }

  /**
   * Calculate current level
   */
  private calculateLevel(proofs: any[]): number {
    return Math.min(Math.floor(proofs.length / 5) + 1, 10);
  }

  /**
   * Recommend next modules
   */
  private recommendModules(
    strengths: string[],
    weaknesses: string[]
  ): string[] {
    const modules = [
      'math-basic',
      'science-intro',
      'business-101',
      'english-grammar',
    ];

    // Prioritize weakness remediation
    return weaknesses.length > 0
      ? weaknesses
      : modules.filter(m => !strengths.includes(m));
  }

  /**
   * Generate title in appropriate language
   */
  private generateTitle(module: string, language: string): string {
    const titles: Record<string, Record<string, string>> = {
      'math-basic': {
        en: 'Master Basic Math',
        zu: 'Sebenzisa Izibalo Eziyisisekelo',
        af: 'Bemeester Basiese Wiskunde',
      },
    };

    return titles[module]?.[language] || titles[module]?.en || 'Next Lesson';
  }

  /**
   * Generate reasoning
   */
  private generateReasoning(path: LearningPath, module: string): string {
    if (path.weaknesses.includes(module)) {
      return `Building strength in ${module} - you've got this!`;
    }
    return `Next step in your learning journey`;
  }

  /**
   * Get voice language code
   */
  private getVoiceCode(lang: string): string {
    const codes: Record<string, string> = {
      en: 'en-ZA', // South African English
      zu: 'zu-ZA',
      xh: 'xh-ZA',
      af: 'af-ZA',
    };
    return codes[lang] || 'en-US';
  }

  /**
   * Default learning path
   */
  private getDefaultPath(userId: string): LearningPath {
    return {
      userId,
      currentLevel: 1,
      strengths: [],
      weaknesses: [],
      recommendedModules: ['math-basic', 'english-grammar'],
      learningStyle: 'visual',
      pace: 'medium',
      language: 'en',
    };
  }
}

export const elaraAI = new ElaraAITutor();
export default elaraAI;
