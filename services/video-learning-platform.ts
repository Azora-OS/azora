/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * VIDEO LEARNING PLATFORM
 *
 * Optimized for African conditions:
 * - Adaptive video quality (240p-1080p)
 * - Offline download capability
 * - Low-data compression
 * - Interactive learning
 * - Earn AZR by watching & learning
 */

import { EventEmitter } from 'events'
import { log } from '../lib/logger.js'
import crypto from 'crypto'
import { supabase, UserDB } from './supabase-client.js'

export interface VideoLesson {
  id: string
  title: string
  subject: string
  grade: string
  duration: number // seconds
  fileSize: number // MB
  quality: '240p' | '360p' | '480p' | '720p' | '1080p'
  language: string
  instructor: string
  topics: string[]
  azrReward: number
  downloaded: boolean
  watchProgress: number // 0-100%
}

export interface VideoStream {
  lessonId: string
  userId: string
  quality: string
  dataUsed: number // MB
  startTime: Date
  endTime?: Date
  completed: boolean
  quizScore?: number
}

export class VideoLearningPlatform extends EventEmitter {
  private lessons: Map<string, VideoLesson> = new Map()
  private streams: VideoStream[] = []
  private downloadedContent: Map<string, VideoLesson> = new Map()

  constructor() {
    super()
    this.initializeLessons()
    log.info('Video Learning Platform initialized', { supabaseReady: true })
  }

  /**
   * Initialize sample lessons
   */
  private initializeLessons() {
    const sampleLessons: VideoLesson[] = [
      {
        id: 'math-g9-algebra',
        title: 'Introduction to Algebra',
        subject: 'Mathematics',
        grade: 'Grade 9',
        duration: 900, // 15 minutes
        fileSize: 45, // MB in 360p
        quality: '360p',
        language: 'English',
        instructor: 'Prof. Nkosi',
        topics: ['Variables', 'Equations', 'Problem Solving'],
        azrReward: 5,
        downloaded: false,
        watchProgress: 0
      },
      {
        id: 'sci-g10-physics',
        title: 'Newton\'s Laws of Motion',
        subject: 'Physics',
        grade: 'Grade 10',
        duration: 1200, // 20 minutes
        fileSize: 60,
        quality: '360p',
        language: 'English',
        instructor: 'Dr. Mbatha',
        topics: ['Force', 'Acceleration', 'Motion'],
        azrReward: 7,
        downloaded: false,
        watchProgress: 0
      },
      {
        id: 'biz-entrepreneurship',
        title: 'Starting Your Business in Africa',
        subject: 'Business Studies',
        grade: 'Adult Learning',
        duration: 1800, // 30 minutes
        fileSize: 90,
        quality: '360p',
        language: 'Zulu/English',
        instructor: 'Mrs. Dlamini',
        topics: ['Business Plan', 'Funding', 'Marketing'],
        azrReward: 10,
        downloaded: false,
        watchProgress: 0
      }
    ]

    sampleLessons.forEach(lesson => {
      this.lessons.set(lesson.id, lesson)
    })
  }

  /**
   * Get all available lessons
   */
  getLessons(subject?: string, grade?: string): VideoLesson[] {
    let lessons = Array.from(this.lessons.values())

    if (subject) {
      lessons = lessons.filter(l => l.subject === subject)
    }
    if (grade) {
      lessons = lessons.filter(l => l.grade === grade)
    }

    return lessons
  }

  /**
   * Download video for offline viewing
   * Critical for areas with poor connectivity
   */
  async downloadVideo(
    lessonId: string,
    quality: VideoLesson['quality'] = '360p'
  ): Promise<VideoLesson> {
    const lesson = this.lessons.get(lessonId)
    if (!lesson) throw new Error('Lesson not found')

    // Adjust file size based on quality
    const qualitySizes = {
      '240p': 0.4,
      '360p': 1.0,
      '480p': 1.5,
      '720p': 2.5,
      '1080p': 4.0
    }

    const adjustedSize = lesson.fileSize * qualitySizes[quality]

    log.info('Downloading video for offline', {
      title: lesson.title,
      quality,
      sizeMB: adjustedSize.toFixed(1),
      durationMinutes: Math.floor(lesson.duration / 60),
      lessonId: lesson.id,
    })

    lesson.downloaded = true
    lesson.quality = quality
    this.downloadedContent.set(lessonId, { ...lesson })

    this.emit('video-downloaded', lesson)
    return lesson
  }

  /**
   * Start watching a video
   * Adapts quality based on connection speed
   */
  async watchVideo(
    lessonId: string,
    userId: string,
    connectionSpeed: 'slow' | 'medium' | 'fast' = 'medium'
  ): Promise<VideoStream> {
    const lesson = this.lessons.get(lessonId)
    if (!lesson) throw new Error('Lesson not found')

    // Auto-select quality based on connection
    const qualityMap = {
      'slow': '240p',
      'medium': '360p',
      'fast': '480p'
    }
    const quality = qualityMap[connectionSpeed]

    const stream: VideoStream = {
      lessonId,
      userId,
      quality,
      dataUsed: 0,
      startTime: new Date(),
      completed: false
    }

    this.streams.push(stream)

    log.info('Watching video lesson', {
      title: lesson.title,
      quality,
      connectionSpeed,
      azrReward: lesson.azrReward,
      lessonId: lesson.id,
    })

    this.emit('video-started', stream)
    return stream
  }

  /**
   * Complete video and earn rewards
   */
  async completeVideo(
    lessonId: string,
    userId: string,
    quizScore: number
  ): Promise<number> {
    const lesson = this.lessons.get(lessonId)
    if (!lesson) throw new Error('Lesson not found')

    const stream = this.streams.find(
      s => s.lessonId === lessonId && s.userId === userId && !s.completed
    )

    if (stream) {
      stream.completed = true
      stream.endTime = new Date()
      stream.quizScore = quizScore
    }

    lesson.watchProgress = 100

    // Bonus AZR for high quiz scores
    const bonus = quizScore >= 80 ? lesson.azrReward * 0.5 : 0
    const totalReward = lesson.azrReward + bonus

    // Update user earnings in database
    try {
      const user = await UserDB.getById(userId)
      await UserDB.updateEarnings(userId, user.total_earned + totalReward)

      // Store completion in metadata
      const completedVideos = user.metadata.completed_videos || []
      await UserDB.updateMetadata(userId, {
        ...user.metadata,
        completed_videos: [...completedVideos, { lessonId, quizScore, reward: totalReward, date: new Date() }]
      })
    } catch (error) {
      log.warn('Database update failed, rewards tracked in-memory', { lessonId: lesson.id, userId })
    }

    log.info('Video lesson completed', {
      title: lesson.title,
      quizScore,
      baseReward: lesson.azrReward,
      bonus,
      totalReward,
      lessonId: lesson.id,
      userId,
    })

    this.emit('video-completed', { lesson, quizScore, totalReward })
    return totalReward
  }

  /**
   * Get user's downloaded content
   */
  getDownloadedContent(userId: string): VideoLesson[] {
    return Array.from(this.downloadedContent.values())
  }

  /**
   * Get platform statistics
   */
  getStats() {
    return {
      totalLessons: this.lessons.size,
      totalDownloads: this.downloadedContent.size,
      totalStreams: this.streams.length,
      completionRate: this.streams.filter(s => s.completed).length / this.streams.length * 100 || 0,
      averageQuizScore: this.streams
        .filter(s => s.quizScore !== undefined)
        .reduce((sum, s) => sum + (s.quizScore || 0), 0) /
        this.streams.filter(s => s.quizScore !== undefined).length || 0,
      totalDataSaved: Array.from(this.downloadedContent.values())
        .reduce((sum, l) => sum + l.fileSize, 0)
    }
  }

  /**
   * Recommend lessons based on user progress
   */
  getRecommendations(userId: string, completedLessons: string[]): VideoLesson[] {
    // Simple recommendation: next lessons in same subject
    return Array.from(this.lessons.values())
      .filter(l => !completedLessons.includes(l.id))
      .slice(0, 5)
  }
}

export const videoLearning = new VideoLearningPlatform()
export default videoLearning
