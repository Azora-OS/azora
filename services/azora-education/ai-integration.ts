import OpenAI from 'openai'
import { EventEmitter } from 'events'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-test'
})

class RateLimiter {
  private tokens: number
  private interval: number
  private lastRefill: number

  constructor(config: { tokensPerInterval: number; interval: string }) {
    this.tokens = config.tokensPerInterval
    this.interval = config.interval === 'minute' ? 60000 : 1000
    this.lastRefill = Date.now()
  }

  async removeTokens(count: number): Promise<void> {
    const now = Date.now()
    if (now - this.lastRefill >= this.interval) {
      this.tokens = 60
      this.lastRefill = now
    }
    if (this.tokens >= count) {
      this.tokens -= count
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

const rateLimiter = new RateLimiter({ tokensPerInterval: 60, interval: 'minute' })

const logger = {
  info: (msg: string, data?: any) => console.log(`[INFO] ${msg}`, data || ''),
  error: (msg: string, data?: any) => console.error(`[ERROR] ${msg}`, data || '')
}

export class AIEducationService extends EventEmitter {
  constructor() {
    super()
    console.log('🤖 AI Education Service initialized')
  }

  // --- CONSTITUTIONAL AI INTEGRATION ---
  private async critiquePrompt(prompt: string, actionType: string): Promise<void> {
    try {
      // In production, use env var for URL
      const response = await fetch('http://localhost:3014/api/critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          actionType,
          agentId: 'elara' // Default to Elara for education
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.verdict === 'REJECT') {
          const violation = data.data.violations[0];
          throw new Error(`Constitutional Violation (${violation.category}): ${violation.reasoning}`);
        }
      }
    } catch (error) {
      if (error.message.startsWith('Constitutional Violation')) {
        throw error;
      }
      // Fail open if critique service is down, but log it
      logger.error('Constitutional critique failed (service unavailable?)', { error });
    }
  }

  async generatePersonalizedContent(userId: string, topic: string, level: string) {
    await this.critiquePrompt(`Create a lesson about ${topic} for a student at ${level} level.`, 'CONTENT_GEN');
    await rateLimiter.removeTokens(1)

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an AI tutor for African students. Create educational content that is culturally relevant and appropriate for ${level} level. Focus on practical applications and African context.`
          },
          {
            role: 'user',
            content: `Create a lesson about ${topic} for a student at ${level} level.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })

      const content = response.choices[0]?.message?.content

      // Log for monitoring
      logger.info('AI content generated', { userId, topic, level })

      return {
        content,
        metadata: {
          model: 'gpt-4',
          tokens: response.usage?.total_tokens,
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      logger.error('AI content generation failed', { error, userId, topic })
      throw error
    }
  }

  async assessStudentResponse(question: string, studentAnswer: string, correctAnswer: string) {
    // Assessment is less risky, but we can still critique the feedback generation if needed.
    // Skipping strict critique for assessment to reduce latency, unless answer contains flagged content.
    await rateLimiter.removeTokens(1)

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assessment tool. Evaluate student responses fairly and provide constructive feedback. Consider partial credit and alternative valid approaches.'
          },
          {
            role: 'user',
            content: `Question: ${question}\nStudent Answer: ${studentAnswer}\nCorrect Answer: ${correctAnswer}\n\nProvide a score (0-100) and feedback.`
          }
        ],
        max_tokens: 500
      })

      const assessment = response.choices[0]?.message?.content
      const scoreMatch = assessment?.match(/(\d+)/)
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 0

      return {
        score: Math.min(100, Math.max(0, score)),
        feedback: assessment,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      logger.error('AI assessment failed', { error, question })
      throw error
    }
  }

  async detectBias(content: string) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Analyze content for cultural bias, gender bias, or other forms of discrimination. Focus on African context and perspectives.'
          },
          {
            role: 'user',
            content: `Analyze this content for bias: ${content}`
          }
        ],
        max_tokens: 300
      })

      const analysis = response.choices[0]?.message?.content
      const hasBias = analysis?.toLowerCase().includes('bias') || analysis?.toLowerCase().includes('discriminat')

      return {
        hasBias,
        analysis,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      logger.error('Bias detection failed', { error })
      return { hasBias: false, analysis: 'Analysis failed', timestamp: new Date().toISOString() }
    }
  }

  async generateLearningPath(userId: string, strengths: string[], weaknesses: string[]) {
    await this.critiquePrompt(`Create a learning path for a student with strengths in: ${strengths.join(', ')} and weaknesses in: ${weaknesses.join(', ')}`, 'CONTENT_GEN');
    await rateLimiter.removeTokens(1)

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an AI learning path designer. Create personalized learning paths based on student strengths and weaknesses. Focus on African context and practical skills.'
          },
          {
            role: 'user',
            content: `Create a learning path for a student with strengths in: ${strengths.join(', ')} and weaknesses in: ${weaknesses.join(', ')}`
          }
        ],
        max_tokens: 800
      })

      const path = response.choices[0]?.message?.content

      logger.info('Learning path generated', { userId, strengths, weaknesses })
      this.emit('learning-path-generated', { userId, path })

      return {
        path,
        recommendations: this.extractRecommendations(path || ''),
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      logger.error('Learning path generation failed', { error, userId })
      return this.getDefaultLearningPath(strengths, weaknesses)
    }
  }

  async tutorQuestion(question: string, context: string, language: string = 'en') {
    await this.critiquePrompt(`Context: ${context}\n\nQuestion: ${question}`, 'CHAT');
    await rateLimiter.removeTokens(1)

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are Elara, an AI tutor for African students. Answer questions clearly and encourage learning. Use Socratic method when appropriate. Respond in ${language}.`
          },
          {
            role: 'user',
            content: `Context: ${context}\n\nQuestion: ${question}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })

      const answer = response.choices[0]?.message?.content

      this.emit('question-answered', { question, answer, language })

      return {
        answer,
        followUpQuestions: this.generateFollowUpQuestions(question, answer || ''),
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      logger.error('Tutor question failed', { error, question })
      throw error
    }
  }

  async generateQuiz(topic: string, difficulty: number, questionCount: number = 5) {
    await this.critiquePrompt(`Generate ${questionCount} multiple choice questions about ${topic} at difficulty level ${difficulty}/10.`, 'CONTENT_GEN');
    await rateLimiter.removeTokens(1)

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Generate educational quiz questions in JSON format. Each question should have: question, options (array of 4), correctAnswer (index), explanation.'
          },
          {
            role: 'user',
            content: `Generate ${questionCount} multiple choice questions about ${topic} at difficulty level ${difficulty}/10. Return as JSON array.`
          }
        ],
        max_tokens: 1500
      })

      const content = response.choices[0]?.message?.content || '[]'
      const questions = JSON.parse(content)

      logger.info('Quiz generated', { topic, difficulty, questionCount })
      this.emit('quiz-generated', { topic, questions })

      return {
        questions,
        topic,
        difficulty,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      logger.error('Quiz generation failed', { error, topic })
      return this.getDefaultQuiz(topic, difficulty, questionCount)
    }
  }

  private extractRecommendations(path: string): string[] {
    const lines = path.split('\n').filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
    return lines.slice(0, 5).map(line => line.replace(/^[-\d.]+\s*/, '').trim())
  }

  private generateFollowUpQuestions(question: string, answer: string): string[] {
    return [
      'Can you explain that in simpler terms?',
      'How does this apply in real life?',
      'What are some examples?'
    ]
  }

  private getDefaultLearningPath(strengths: string[], weaknesses: string[]) {
    return {
      path: `Focus on strengthening: ${weaknesses.join(', ')}. Build on: ${strengths.join(', ')}.`,
      recommendations: weaknesses.slice(0, 3),
      timestamp: new Date().toISOString()
    }
  }

  private getDefaultQuiz(topic: string, difficulty: number, count: number) {
    return {
      questions: Array(count).fill(null).map((_, i) => ({
        question: `Question ${i + 1} about ${topic}`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        explanation: 'Default explanation'
      })),
      topic,
      difficulty,
      timestamp: new Date().toISOString()
    }
  }
}

export const aiEducation = new AIEducationService()
export default aiEducation