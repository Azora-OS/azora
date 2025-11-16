/**
 * OpenAI Client Wrapper
 * Centralized GPT-4 integration for Azora Sapiens
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  model: string;
}

/**
 * Send a message to GPT-4 and get a response
 */
export async function sendMessage(
  messages: AIMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }
): Promise<AIResponse> {
  const response = await openai.chat.completions.create({
    model: options?.model || 'gpt-4',
    messages,
    temperature: options?.temperature || 0.7,
    max_tokens: options?.maxTokens || 2000,
  });

  const content = response.choices[0]?.message?.content || '';

  return {
    content,
    tokens: {
      prompt: response.usage?.prompt_tokens || 0,
      completion: response.usage?.completion_tokens || 0,
      total: response.usage?.total_tokens || 0,
    },
    model: response.model,
  };
}

/**
 * Generate a learning path for a student
 */
export async function generateLearningPath(
  studentName: string,
  goal: string,
  currentLevel: string,
  interests: string[]
): Promise<string> {
  const prompt = `
You are an expert educational advisor. Create a personalized learning path for:
- Student: ${studentName}
- Goal: ${goal}
- Current Level: ${currentLevel}
- Interests: ${interests.join(', ')}

Provide a structured learning path with:
1. Week-by-week breakdown
2. Key topics to cover
3. Recommended resources
4. Milestones and checkpoints
5. Estimated time commitment

Format as a clear, actionable plan.
  `;

  const response = await sendMessage([
    {
      role: 'system',
      content: 'You are an expert educational advisor creating personalized learning paths.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ]);

  return response.content;
}

/**
 * Generate assessment questions
 */
export async function generateAssessmentQuestions(
  topic: string,
  level: 'beginner' | 'intermediate' | 'advanced',
  count: number = 5
): Promise<string[]> {
  const prompt = `
Generate ${count} ${level} level assessment questions about "${topic}".

Format each question on a new line, numbered 1-${count}.
Include multiple choice options (A, B, C, D) for each question.
  `;

  const response = await sendMessage([
    {
      role: 'system',
      content: 'You are an expert educator creating assessment questions.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ]);

  return response.content.split('\n').filter((q) => q.trim());
}

/**
 * Analyze student performance
 */
export async function analyzePerformance(
  studentName: string,
  scores: Record<string, number>,
  completedTopics: string[]
): Promise<string> {
  const prompt = `
Analyze the performance of student ${studentName}:
- Scores: ${JSON.stringify(scores)}
- Completed Topics: ${completedTopics.join(', ')}

Provide:
1. Strengths and weaknesses
2. Recommended focus areas
3. Personalized improvement suggestions
4. Next steps for learning
  `;

  const response = await sendMessage([
    {
      role: 'system',
      content: 'You are an expert educational analyst providing personalized feedback.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ]);

  return response.content;
}

/**
 * Generate tutoring response
 */
export async function generateTutoringResponse(
  studentQuestion: string,
  topic: string,
  context: string
): Promise<string> {
  const prompt = `
A student asked: "${studentQuestion}"

Topic: ${topic}
Context: ${context}

Provide a helpful, educational response that:
1. Answers the question clearly
2. Explains the concept
3. Provides an example
4. Suggests follow-up learning
  `;

  const response = await sendMessage([
    {
      role: 'system',
      content: 'You are an expert tutor providing clear, helpful explanations.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ]);

  return response.content;
}

/**
 * Generate job recommendations
 */
export async function generateJobRecommendations(
  skills: string[],
  experience: string,
  interests: string[]
): Promise<string> {
  const prompt = `
Generate job recommendations for someone with:
- Skills: ${skills.join(', ')}
- Experience: ${experience}
- Interests: ${interests.join(', ')}

Provide:
1. Top 5 job roles
2. Why each role is a good fit
3. Skills to develop
4. Career path suggestions
  `;

  const response = await sendMessage([
    {
      role: 'system',
      content: 'You are an expert career advisor providing personalized recommendations.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ]);

  return response.content;
}

/**
 * Generate course content
 */
export async function generateCourseContent(
  courseTitle: string,
  duration: string,
  targetAudience: string
): Promise<string> {
  const prompt = `
Create course content for:
- Title: ${courseTitle}
- Duration: ${duration}
- Target Audience: ${targetAudience}

Provide:
1. Course outline (modules and lessons)
2. Learning objectives
3. Key topics
4. Assessment methods
5. Resources needed
  `;

  const response = await sendMessage([
    {
      role: 'system',
      content: 'You are an expert instructional designer creating comprehensive course content.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ]);

  return response.content;
}

export default {
  sendMessage,
  generateLearningPath,
  generateAssessmentQuestions,
  analyzePerformance,
  generateTutoringResponse,
  generateJobRecommendations,
  generateCourseContent,
};
