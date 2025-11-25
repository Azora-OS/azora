/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * Faculty AI Assistant
 * AI-powered tools for instructors: auto-grading, content generation, analytics
 */

import { EventEmitter } from 'events';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-test'
});

export interface GradingAssistance {
  suggestedGrade: number;
  feedback: string;
  rubricScores?: Array<{ criterion: string; score: number; feedback: string }>;
  confidence: number;
}

export interface ContentSuggestion {
  title: string;
  description: string;
  outline: string[];
  resources: string[];
  estimatedTime: number;
}

export class FacultyAIAssistant extends EventEmitter {
  constructor() {
    super();
    console.log('🤖 Faculty AI Assistant initialized');
  }

  /**
   * AI-assisted grading
   */
  async assistGrading(
    question: string,
    studentAnswer: string,
    rubric?: any,
    maxPoints: number = 100
  ): Promise<GradingAssistance> {
    try {
      const rubricText = rubric
        ? `Rubric: ${JSON.stringify(rubric)}`
        : 'Use general assessment criteria';

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an AI grading assistant. Provide fair, constructive feedback. Consider partial credit and alternative valid approaches. Return JSON with: suggestedGrade (0-100), feedback (string), confidence (0-1).'
          },
          {
            role: 'user',
            content: `Question: ${question}\n\nStudent Answer: ${studentAnswer}\n\n${rubricText}\n\nMax Points: ${maxPoints}\n\nProvide grading assessment as JSON.`
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      });

      const content = response.choices[0]?.message?.content || '{}';
      const result = JSON.parse(content);

      const assistance: GradingAssistance = {
        suggestedGrade: Math.min(maxPoints, Math.max(0, result.suggestedGrade || 0)),
        feedback: result.feedback || 'Good effort!',
        confidence: result.confidence || 0.7
      };

      console.log(`✅ AI grading: ${assistance.suggestedGrade}/${maxPoints} (${(assistance.confidence * 100).toFixed(0)}% confidence)`);
      this.emit('grading-assisted', assistance);

      return assistance;
    } catch (error) {
      console.error('AI grading failed:', error);
      return {
        suggestedGrade: 0,
        feedback: 'Unable to provide AI assessment. Please grade manually.',
        confidence: 0
      };
    }
  }

  /**
   * Generate course content suggestions
   */
  async suggestContent(
    topic: string,
    level: string,
    duration: number
  ): Promise<ContentSuggestion> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an instructional design AI. Create comprehensive course content outlines with learning objectives, activities, and resources. Focus on African context when relevant.'
          },
          {
            role: 'user',
            content: `Create a ${duration}-minute lesson plan about ${topic} for ${level} level students. Include: title, description, outline (array), resources (array), estimatedTime. Return as JSON.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const content = response.choices[0]?.message?.content || '{}';
      const result = JSON.parse(content);

      const suggestion: ContentSuggestion = {
        title: result.title || `Lesson: ${topic}`,
        description: result.description || `A comprehensive lesson about ${topic}`,
        outline: result.outline || ['Introduction', 'Main Content', 'Practice', 'Summary'],
        resources: result.resources || [],
        estimatedTime: result.estimatedTime || duration
      };

      console.log(`📚 Content suggestion generated: ${suggestion.title}`);
      this.emit('content-suggested', suggestion);

      return suggestion;
    } catch (error) {
      console.error('Content suggestion failed:', error);
      return {
        title: `Lesson: ${topic}`,
        description: `A lesson about ${topic}`,
        outline: ['Introduction', 'Main Content', 'Practice', 'Assessment'],
        resources: [],
        estimatedTime: duration
      };
    }
  }

  /**
   * Generate quiz questions
   */
  async generateQuizQuestions(
    topic: string,
    difficulty: number,
    count: number = 5
  ): Promise<any[]> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'Generate educational quiz questions. Each question should have: question, options (4 choices), correctAnswer (index 0-3), explanation. Return as JSON array.'
          },
          {
            role: 'user',
            content: `Generate ${count} multiple choice questions about ${topic} at difficulty ${difficulty}/10.`
          }
        ],
        max_tokens: 1500
      });

      const content = response.choices[0]?.message?.content || '[]';
      const questions = JSON.parse(content);

      console.log(`❓ Generated ${questions.length} quiz questions`);
      this.emit('quiz-generated', { topic, questions });

      return questions;
    } catch (error) {
      console.error('Quiz generation failed:', error);
      return [];
    }
  }

  /**
   * Analyze student performance patterns
   */
  async analyzePerformance(studentData: any[]): Promise<any> {
    try {
      const summary = {
        totalStudents: studentData.length,
        averageGrade: studentData.reduce((sum, s) => sum + (s.grade || 0), 0) / studentData.length,
        atRisk: studentData.filter(s => (s.grade || 0) < 60).length,
        excellent: studentData.filter(s => (s.grade || 0) >= 85).length
      };

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an educational data analyst. Analyze student performance and provide actionable insights for instructors.'
          },
          {
            role: 'user',
            content: `Analyze this class performance: ${JSON.stringify(summary)}. Provide insights and recommendations as JSON with: insights (array), recommendations (array), concerns (array).`
          }
        ],
        max_tokens: 800
      });

      const content = response.choices[0]?.message?.content || '{}';
      const analysis = JSON.parse(content);

      console.log(`📊 Performance analysis complete`);
      this.emit('performance-analyzed', analysis);

      return {
        summary,
        ...analysis
      };
    } catch (error) {
      console.error('Performance analysis failed:', error);
      return {
        summary: { totalStudents: 0, averageGrade: 0, atRisk: 0, excellent: 0 },
        insights: [],
        recommendations: [],
        concerns: []
      };
    }
  }

  /**
   * Generate personalized feedback for students
   */
  async generateFeedback(
    studentName: string,
    performance: any,
    strengths: string[],
    weaknesses: string[]
  ): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a supportive instructor. Write personalized, encouraging feedback that acknowledges strengths and provides constructive guidance for improvement.'
          },
          {
            role: 'user',
            content: `Write feedback for ${studentName}. Performance: ${JSON.stringify(performance)}. Strengths: ${strengths.join(', ')}. Areas for improvement: ${weaknesses.join(', ')}.`
          }
        ],
        max_tokens: 300
      });

      const feedback = response.choices[0]?.message?.content || 'Keep up the good work!';

      console.log(`💬 Feedback generated for ${studentName}`);
      this.emit('feedback-generated', { studentName, feedback });

      return feedback;
    } catch (error) {
      console.error('Feedback generation failed:', error);
      return `${studentName}, you're making progress! Keep working on your areas of improvement.`;
    }
  }

  /**
   * Detect plagiarism (simple text similarity)
   */
  async detectPlagiarism(submission: string, corpus: string[]): Promise<any> {
    try {
      // Simple similarity check (in production, use dedicated plagiarism detection API)
      const similarities = corpus.map((text, index) => {
        const similarity = this.calculateSimilarity(submission, text);
        return { index, similarity, text: text.substring(0, 100) };
      });

      const maxSimilarity = Math.max(...similarities.map(s => s.similarity));
      const flagged = maxSimilarity > 0.7;

      const report = {
        similarity: maxSimilarity,
        flagged,
        matches: similarities.filter(s => s.similarity > 0.5).slice(0, 3),
        timestamp: new Date().toISOString()
      };

      if (flagged) {
        console.log(`⚠️ Potential plagiarism detected: ${(maxSimilarity * 100).toFixed(0)}% similarity`);
      }

      this.emit('plagiarism-checked', report);

      return report;
    } catch (error) {
      console.error('Plagiarism detection failed:', error);
      return { similarity: 0, flagged: false, matches: [], timestamp: new Date().toISOString() };
    }
  }

  /**
   * Simple text similarity (Jaccard similarity)
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }
}

export const facultyAI = new FacultyAIAssistant();
export default facultyAI;
