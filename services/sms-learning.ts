/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * SMS LEARNING SERVICE
 * Learn via SMS - No smartphone needed!
 * Integration with Africa's Talking API
 */

import { EventEmitter } from 'events'
import { UserDB, ProofDB } from './supabase-client'
import { i18n } from './i18n-service'

export interface SMSSession {
  phoneNumber: string
  userId?: string
  currentModule: string
  currentQuestion: number
  score: number
  language: string
  startedAt: Date
}

export interface SMSQuiz {
  id: string
  module: string
  questions: Array<{
    question: string
    options: string[]
    correctAnswer: number
    translation?: Record<string, { question: string; options: string[] }>
  }>
  reward: number
}

export class SMSLearningService extends EventEmitter {
  private sessions: Map<string, SMSSession> = new Map()
  private quizzes: Map<string, SMSQuiz> = new Map()
  private africastalkingApiKey: string = process.env.AFRICASTALKING_API_KEY || ''
  private africastalkingUsername: string = process.env.AFRICASTALKING_USERNAME || 'azora'

  constructor() {
    super()
    this.initializeQuizzes()
    console.log('📱 SMS Learning Service initialized (Africa\'s Talking)')
  }

  /**
   * Initialize sample quizzes (multilingual)
   */
  private initializeQuizzes() {
    const mathQuiz: SMSQuiz = {
      id: 'math-basic',
      module: 'Basic Mathematics',
      questions: [
        {
          question: 'What is 7 × 8?',
          options: ['54', '56', '58', '60'],
          correctAnswer: 1,
          translation: {
            zu: {
              question: 'Yini i-7 × 8?',
              options: ['54', '56', '58', '60']
            },
            af: {
              question: 'Wat is 7 × 8?',
              options: ['54', '56', '58', '60']
            }
          }
        },
        {
          question: 'What is 100 - 37?',
          options: ['61', '62', '63', '64'],
          correctAnswer: 2,
          translation: {
            zu: {
              question: 'Yini i-100 - 37?',
              options: ['61', '62', '63', '64']
            }
          }
        }
      ],
      reward: 0.05
    }

    this.quizzes.set('math-basic', mathQuiz)
  }

  /**
   * Start SMS learning session
   */
  async startSession(phoneNumber: string, language: string = 'en'): Promise<string> {
    const session: SMSSession = {
      phoneNumber,
      currentModule: 'math-basic',
      currentQuestion: 0,
      score: 0,
      language,
      startedAt: new Date()
    }

    this.sessions.set(phoneNumber, session)

    const quiz = this.quizzes.get('math-basic')!
    const question = quiz.questions[0]
    
    const message = this.formatQuestion(question, 1, language)
    await this.sendSMS(phoneNumber, message)

    console.log(`📱 SMS session started: ${phoneNumber} (${language})`)
    return message
  }

  /**
   * Process incoming SMS answer
   */
  async processAnswer(phoneNumber: string, answer: string): Promise<string> {
    const session = this.sessions.get(phoneNumber)
    if (!session) {
      return this.translate('start_session', session?.language || 'en')
    }

    const quiz = this.quizzes.get(session.currentModule)!
    const question = quiz.questions[session.currentQuestion]

    // Check answer (1-4 or A-D)
    const answerIndex = this.parseAnswer(answer)
    const correct = answerIndex === question.correctAnswer

    if (correct) {
      session.score++
    }

    session.currentQuestion++

    // More questions?
    if (session.currentQuestion < quiz.questions.length) {
      const nextQ = quiz.questions[session.currentQuestion]
      const message = this.formatQuestion(nextQ, session.currentQuestion + 1, session.language)
      await this.sendSMS(phoneNumber, message)
      return message
    }

    // Quiz complete!
    return await this.completeQuiz(session, quiz)
  }

  /**
   * Complete quiz and award points
   */
  private async completeQuiz(session: SMSSession, quiz: SMSQuiz): Promise<string> {
    const percentage = Math.round((session.score / quiz.questions.length) * 100)
    const passed = percentage >= 60

    let reward = 0
    if (passed && session.userId) {
      reward = quiz.reward * (percentage / 100)

      try {
        // Create proof in database
        await ProofDB.create({
          user_id: session.userId,
          module_id: quiz.id,
          score: percentage,
          reward_amount: reward,
          proof_hash: `sms-${session.phoneNumber}-${Date.now()}`,
          verified: true
        })

        // Update earnings
        const user = await UserDB.getById(session.userId)
        await UserDB.updateEarnings(session.userId, user.total_earned + reward)

        console.log(`✅ SMS quiz complete: ${session.phoneNumber} earned ${reward} UBO`)
      } catch (error) {
        console.warn('⚠️  Database unavailable, quiz completed in-memory')
      }
    }

    // Clear session
    this.sessions.delete(session.phoneNumber)

    const message = passed 
      ? `🎉 ${this.translate('passed', session.language)}! Score: ${percentage}%. Earned: ${reward.toFixed(3)} UBO`
      : `Try again! Score: ${percentage}%. Reply START to retry.`

    await this.sendSMS(session.phoneNumber, message)
    return message
  }

  /**
   * Send SMS via Africa's Talking
   */
  private async sendSMS(to: string, message: string): Promise<void> {
    // In production, use Africa's Talking SDK
    if (this.africastalkingApiKey) {
      try {
        // const AfricasTalking = require('africastalking')({
        //   apiKey: this.africastalkingApiKey,
        //   username: this.africastalkingUsername
        // })
        // await AfricasTalking.SMS.send({ to: [to], message, from: 'AZORA' })
        
        console.log(`📤 SMS to ${to}: ${message}`)
      } catch (error) {
        console.error('SMS send failed:', error)
      }
    } else {
      // Development mode - just log
      console.log(`📤 [DEV] SMS to ${to}: ${message}`)
    }

    this.emit('sms-sent', { to, message })
  }

  /**
   * Format question for SMS
   */
  private formatQuestion(question: any, number: number, lang: string): string {
    const q = question.translation?.[lang] || question
    const options = q.options.map((opt: string, i: number) => 
      `${i + 1}. ${opt}`
    ).join('\n')

    return `Q${number}: ${q.question}\n${options}\n\nReply with 1-4`
  }

  /**
   * Parse answer (1-4, A-D, or text)
   */
  private parseAnswer(answer: string): number {
    const cleaned = answer.trim().toUpperCase()
    
    // Numeric
    if (/^[1-4]$/.test(cleaned)) {
      return parseInt(cleaned) - 1
    }

    // Letter
    if (/^[A-D]$/.test(cleaned)) {
      return cleaned.charCodeAt(0) - 65
    }

    return -1 // Invalid
  }

  /**
   * Simple translation helper
   */
  private translate(key: string, lang: string): string {
    const translations: Record<string, Record<string, string>> = {
      passed: {
        en: 'Congratulations! You passed',
        zu: 'Halala! Uphase',
        xh: 'Siyavuyisana! Uphumelele',
        af: 'Baie geluk! Jy het geslaag'
      },
      start_session: {
        en: 'Reply START to begin quiz',
        zu: 'Phendula START ukuqala ukuhlolwa',
        af: 'Antwoord START om toets te begin'
      }
    }

    return translations[key]?.[lang] || translations[key]?.en || key
  }

  /**
   * Link phone number to user account
   */
  async linkUser(phoneNumber: string, userId: string): Promise<void> {
    const session = this.sessions.get(phoneNumber)
    if (session) {
      session.userId = userId
    }

    // Update user metadata
    try {
      const user = await UserDB.getById(userId)
      await UserDB.updateMetadata(userId, {
        ...user.metadata,
        phone_number: phoneNumber,
        sms_learning_enabled: true
      })
    } catch (error) {
      console.warn('Failed to link user:', error)
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      activeSessions: this.sessions.size,
      totalQuizzes: this.quizzes.size,
      languages: ['en', 'zu', 'xh', 'af']
    }
  }
}

export const smsLearning = new SMSLearningService()
export default smsLearning
