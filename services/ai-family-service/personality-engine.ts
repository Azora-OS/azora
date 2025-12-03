/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

AI Family Service - Personality Engine
Generates personality-based responses using the shared OpenAI client.
*/

import { OpenAIClient, ChatMessage } from '@azora/shared-ai';

export type Persona = {
  id: string;
  name: string;
  role: 'mentor' | 'critic' | 'supporter' | 'strategist' | 'researcher';
  style?: string; // extra stylistic guidance
  mood?: 'calm' | 'enthusiastic' | 'curious' | 'serious' | 'empathetic';
};

export class PersonalityEngine {
  private client: OpenAIClient;

  constructor(client?: OpenAIClient) {
    this.client = client ?? new OpenAIClient();
  }

  async generateResponse(persona: Persona, message: string, context?: Record<string, any>): Promise<string> {
    const system = this.buildSystemPrompt(persona, context);
    const messages: ChatMessage[] = [
      { role: 'system', content: system },
      { role: 'user', content: message },
    ];
    return this.client.chat(messages, { temperature: 0.7, maxTokens: 700 });
  }

  async updateMood(persona: Persona, interaction: { sentiment?: 'positive' | 'neutral' | 'negative'; intensity?: number }): Promise<Persona> {
    const next = { ...persona };
    const intensity = interaction.intensity ?? 1;
    if (interaction.sentiment === 'positive') {
      next.mood = intensity > 1 ? 'enthusiastic' : 'calm';
    } else if (interaction.sentiment === 'negative') {
      next.mood = 'serious';
    } else {
      next.mood = next.mood || 'curious';
    }
    return next;
  }

  async consultFamily(topic: string, userId?: string): Promise<{ summary: string; perspectives: Record<string, string> }>{
    // Minimal set of default personas for consultation
    const personas: Persona[] = [
      { id: 'mentor', name: 'Mentor', role: 'mentor', mood: 'empathetic', style: 'practical, kind' },
      { id: 'critic', name: 'Critic', role: 'critic', mood: 'serious', style: 'risk-aware, precise' },
      { id: 'strategist', name: 'Strategist', role: 'strategist', mood: 'calm', style: 'goal-oriented' },
    ];

    const perspectives: Record<string, string> = {};
    for (const p of personas) {
      perspectives[p.id] = await this.generateResponse(p, `Provide your perspective on: ${topic}`, { userId });
    }

    const summary = await this.client.chat([
      { role: 'system', content: 'You synthesize multiple perspectives into a brief, actionable plan. Return a concise summary with 3-5 bullet points.' },
      { role: 'user', content: JSON.stringify({ topic, perspectives }) },
    ], { temperature: 0.4, maxTokens: 500 });

    return { summary, perspectives };
  }

  private buildSystemPrompt(persona: Persona, context?: Record<string, any>): string {
    const mood = persona.mood ? `Current mood: ${persona.mood}.` : '';
    const style = persona.style ? `Style: ${persona.style}.` : '';
    const user = context?.userId ? `Respond with respect for user ${context.userId}.` : '';
    return [
      `You are ${persona.name}, a ${persona.role} in the Azora AI Family.`,
      'Stay consistent with your role and mood while being helpful and safe.',
      mood,
      style,
      user,
    ].filter(Boolean).join(' ');
  }
}

export default PersonalityEngine;
