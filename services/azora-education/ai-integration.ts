import OpenAI from 'openai'
import { RateLimiter } from 'limiter'
import { logger } from '../../infrastructure/monitoring/logger'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Rate limiter: 60 requests per minute
const rateLimiter = new RateLimiter({ tokensPerInterval: 60, interval: 'minute' })

export class AIEducationService {
  async generatePersonalizedContent(userId: string, topic: string, level: string) {
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
}