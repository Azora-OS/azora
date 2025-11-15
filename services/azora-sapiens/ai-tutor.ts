/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

Azora Sapiens - AI Tutor
Lightweight, production-ready wrapper that uses the shared OpenAI client.
*/

import { OpenAIClient, ChatMessage } from '@azora/shared-ai';

export class AITutor {
  private client: OpenAIClient;

  constructor(client?: OpenAIClient) {
    this.client = client ?? new OpenAIClient();
  }

  async answerQuestion(question: string, context?: { subject?: string; level?: string; userId?: string }): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: this.buildSystemPrompt(context) },
      { role: 'user', content: `Question: ${question}` },
    ];
    return this.client.chat(messages, { temperature: 0.4, maxTokens: 700 });
  }

  async explainConcept(concept: string, level: 'beginner' | 'intermediate' | 'advanced' = 'beginner'): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: `You are a world-class teacher. Explain concepts clearly for a ${level} learner. Use simple language and examples.` },
      { role: 'user', content: `Explain the concept: ${concept}` },
    ];
    return this.client.chat(messages, { temperature: 0.5, maxTokens: 800 });
  }

  async generateExercises(topic: string, difficulty: 'easy' | 'medium' | 'hard' = 'easy'): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: 'You create high-quality practice exercises with answers. Provide JSON with fields: questions (array), answers (array), tips (array).' },
      { role: 'user', content: `Create ${difficulty} exercises for topic: ${topic}` },
    ];
    return this.client.chat(messages, { temperature: 0.7, maxTokens: 900 });
  }

  async provideFeedback(answer: string, correctAnswer: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are a constructive tutor. Compare student answer with the correct answer. Provide: assessment (short), mistakes (bulleted), improvement (bulleted). Be encouraging.' },
      { role: 'user', content: `Student answer: ${answer}\nCorrect answer: ${correctAnswer}` },
    ];
    return this.client.chat(messages, { temperature: 0.3, maxTokens: 600 });
  }

  private buildSystemPrompt(context?: { subject?: string; level?: string; userId?: string }): string {
    const subject = context?.subject ? `Subject: ${context.subject}.` : '';
    const level = context?.level ? `Level: ${context.level}.` : '';
    return [
      'You are Azora Sapiens, a helpful AI tutor focused on clarity, accuracy, and pedagogy.',
      'Keep answers structured, cite key steps, and suggest next learning actions.',
      subject,
      level,
    ].filter(Boolean).join(' ');
  }
}

export default AITutor;
