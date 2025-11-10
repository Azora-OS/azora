/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

CLAUDE/OPENAI INTEGRATION WITH REAL DATA
Wraps OpenAI/Claude API calls with real user context and data
*/

import OpenAI from 'openai';
import { aiDataAccess } from './data-access';

/**
 * Claude/OpenAI Service with Real Data Context
 */
export class ClaudeAIService {
  private openai: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.openai = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_MODEL || 'gpt-4';
  }

  /**
   * Generate AI response with user context
   */
  async generateWithContext(
    userId: string,
    prompt: string,
    options?: {
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    // Get real user context
    const userContext = await aiDataAccess.getCachedUserContext(userId);

    // Build system prompt with real data
    const systemPrompt = options?.systemPrompt || this.buildSystemPrompt(userContext);

    // Build user prompt with context
    const userPrompt = this.buildUserPrompt(prompt, userContext);

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1000,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  /**
   * Generate personalized learning recommendations
   */
  async generateLearningRecommendations(userId: string): Promise<any> {
    const learningData = await aiDataAccess.getUserLearningData(userId);
    
    const prompt = `Based on the user's learning progress:
- Completed courses: ${learningData?.completedCourses || 0}
- In-progress courses: ${learningData?.inProgressCourses || 0}
- Average progress: ${learningData?.totalProgress || 0}%

Generate personalized learning recommendations in JSON format with:
- nextCourses: Array of recommended courses
- skillsToDevelop: Array of skills to focus on
- learningPath: Suggested learning path
- motivation: Personalized motivation message`;

    const response = await this.generateWithContext(userId, prompt, {
      systemPrompt: 'You are an AI learning advisor for Azora OS. Provide personalized, actionable learning recommendations.',
      temperature: 0.8,
    });

    try {
      return JSON.parse(response);
    } catch {
      // If JSON parsing fails, return structured response
      return {
        recommendations: response,
        generatedAt: new Date(),
      };
    }
  }

  /**
   * Generate financial insights
   */
  async generateFinancialInsights(userId: string): Promise<any> {
    const financialData = await aiDataAccess.getUserFinancialData(userId);
    
    const prompt = `Based on the user's financial data:
- Total balance: ${financialData?.totalBalance || 0}
- Recent transactions: ${financialData?.transactionCount || 0}

Generate financial insights and recommendations in JSON format with:
- insights: Array of financial insights
- recommendations: Array of actionable recommendations
- trends: Spending/earning trends
- opportunities: Earning opportunities`;

    const response = await this.generateWithContext(userId, prompt, {
      systemPrompt: 'You are an AI financial advisor for Azora OS. Provide helpful financial insights and recommendations.',
      temperature: 0.7,
    });

    try {
      return JSON.parse(response);
    } catch {
      return {
        insights: response,
        generatedAt: new Date(),
      };
    }
  }

  /**
   * Generate career recommendations
   */
  async generateCareerRecommendations(userId: string): Promise<any> {
    const marketplaceData = await aiDataAccess.getUserMarketplaceData(userId);
    
    const prompt = `Based on the user's marketplace activity:
- Posted jobs: ${marketplaceData?.postedJobs || 0}
- Applications: ${marketplaceData?.applications || 0}
- Accepted applications: ${marketplaceData?.acceptedApplications || 0}

Generate career recommendations in JSON format with:
- jobMatches: Array of matching job opportunities
- skillGaps: Skills to develop for better opportunities
- careerPath: Suggested career progression
- opportunities: Current opportunities`;

    const response = await this.generateWithContext(userId, prompt, {
      systemPrompt: 'You are an AI career advisor for Azora OS. Provide personalized career guidance.',
      temperature: 0.8,
    });

    try {
      return JSON.parse(response);
    } catch {
      return {
        recommendations: response,
        generatedAt: new Date(),
      };
    }
  }

  /**
   * Build system prompt with user context
   */
  private buildSystemPrompt(userContext: any): string {
    if (!userContext) {
      return 'You are an AI assistant for Azora OS, a Constitutional AI Operating System.';
    }

    return `You are an AI assistant for Azora OS, a Constitutional AI Operating System.

User Context:
- User ID: ${userContext.user?.userId || 'Unknown'}
- Email: ${userContext.user?.email || 'Unknown'}
- Role: ${userContext.user?.role || 'Unknown'}

Learning Progress:
- Completed courses: ${userContext.learning?.completedCourses || 0}
- In-progress courses: ${userContext.learning?.inProgressCourses || 0}
- Average progress: ${userContext.learning?.totalProgress || 0}%

Financial Status:
- Total balance: ${userContext.financial?.totalBalance || 0}
- Recent transactions: ${userContext.financial?.transactionCount || 0}

Marketplace Activity:
- Posted jobs: ${userContext.marketplace?.postedJobs || 0}
- Applications: ${userContext.marketplace?.applications || 0}

Provide personalized, helpful responses based on this real user data.`;
  }

  /**
   * Build user prompt with context
   */
  private buildUserPrompt(prompt: string, userContext: any): string {
    if (!userContext) {
      return prompt;
    }

    return `${prompt}

[User Context Available - Use this data to personalize your response]`;
  }
}

// Export singleton instance
export const claudeAI = new ClaudeAIService();

export default claudeAI;
