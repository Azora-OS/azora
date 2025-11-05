/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * TEACHER & PARENT SERVICES
 * Dashboards, notifications, and classroom management
 */

import { EventEmitter } from 'events'
import { UserDB, ProofDB } from './supabase-client'
import { smsLearning } from './sms-learning'
import { i18n } from './i18n-service'

export interface ClassroomStats {
  teacherId: string
  totalStudents: number
  activeToday: number
  averageScore: number
  totalLessonsCompleted: number
  totalEarned: number
  topPerformers: Array<{ name: string; score: number; earned: number }>
  needsAttention: Array<{ name: string; score: number; lastActive: string }>
}

export interface ParentReport {
  parentId: string
  children: Array<{
    id: string
    name: string
    totalLessons: number
    averageScore: number
    totalEarned: number
    recentActivity: Array<{ module: string; score: number; date: string }>
    strengths: string[]
    needsHelp: string[]
  }>
}

export class TeacherService extends EventEmitter {
  constructor() {
    super()
    console.log('👨‍🏫 Teacher Service initialized')
  }

  /**
   * Get classroom statistics
   */
  async getClassroomStats(teacherId: string): Promise<ClassroomStats> {
    try {
      const teacher = await UserDB.getById(teacherId)
      const studentIds: string[] = teacher.metadata.assigned_students || []

      if (studentIds.length === 0) {
        return this.getEmptyStats(teacherId)
      }

      // Get all student data
      const students = await Promise.all(
        studentIds.map(id => UserDB.getById(id))
      )

      // Get all proofs
      const allProofs = await Promise.all(
        studentIds.map(id => ProofDB.getByUser(id))
      )

      // Calculate stats
      const flatProofs = allProofs.flat()
      const averageScore = flatProofs.length > 0
        ? flatProofs.reduce((sum, p) => sum + p.score, 0) / flatProofs.length
        : 0

      const totalEarned = students.reduce((sum, s) => sum + s.total_earned, 0)

      // Top performers
      const topPerformers = students
        .map((s, i) => ({
          name: s.name,
          score: allProofs[i].length > 0 
            ? allProofs[i].reduce((sum, p) => sum + p.score, 0) / allProofs[i].length
            : 0,
          earned: s.total_earned
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)

      // Students needing attention
      const needsAttention = students
        .map((s, i) => ({
          name: s.name,
          score: allProofs[i].length > 0
            ? allProofs[i].reduce((sum, p) => sum + p.score, 0) / allProofs[i].length
            : 0,
          lastActive: allProofs[i][0]?.created_at || s.created_at
        }))
        .filter(s => s.score < 60 || !s.lastActive)
        .slice(0, 5)

      const stats: ClassroomStats = {
        teacherId,
        totalStudents: studentIds.length,
        activeToday: flatProofs.filter(p => 
          new Date(p.created_at).toDateString() === new Date().toDateString()
        ).length,
        averageScore: Math.round(averageScore),
        totalLessonsCompleted: flatProofs.length,
        totalEarned,
        topPerformers,
        needsAttention
      }

      console.log(`📊 Classroom stats for ${teacher.name}:`)
      console.log(`   Students: ${stats.totalStudents}`)
      console.log(`   Avg Score: ${stats.averageScore}%`)
      console.log(`   Total Earned: ${stats.totalEarned} UBO`)

      return stats

    } catch (error) {
      console.warn('⚠️  Database unavailable')
      return this.getEmptyStats(teacherId)
    }
  }

  /**
   * Assign students to teacher
   */
  async assignStudents(teacherId: string, studentIds: string[]): Promise<void> {
    try {
      const teacher = await UserDB.getById(teacherId)
      
      await UserDB.updateMetadata(teacherId, {
        ...teacher.metadata,
        assigned_students: [...new Set([...(teacher.metadata.assigned_students || []), ...studentIds])]
      })

      console.log(`✅ Assigned ${studentIds.length} students to teacher ${teacherId}`)
    } catch (error) {
      console.error('Failed to assign students:', error)
    }
  }

  /**
   * Send message to students
   */
  async sendMessage(teacherId: string, studentIds: string[], message: string): Promise<void> {
    for (const studentId of studentIds) {
      try {
        const student = await UserDB.getById(studentId)
        const phone = student.metadata.phone_number

        if (phone) {
          await smsLearning['sendSMS'](phone, `[Teacher Message] ${message}`)
        }

        // Also store in metadata for in-app notifications
        await UserDB.updateMetadata(studentId, {
          ...student.metadata,
          messages: [
            ...(student.metadata.messages || []),
            {
              from: teacherId,
              message,
              date: new Date().toISOString(),
              read: false
            }
          ]
        })

      } catch (error) {
        console.error(`Failed to message student ${studentId}:`, error)
      }
    }

    this.emit('messages-sent', { teacherId, count: studentIds.length })
  }

  private getEmptyStats(teacherId: string): ClassroomStats {
    return {
      teacherId,
      totalStudents: 0,
      activeToday: 0,
      averageScore: 0,
      totalLessonsCompleted: 0,
      totalEarned: 0,
      topPerformers: [],
      needsAttention: []
    }
  }
}

export class ParentService extends EventEmitter {
  constructor() {
    super()
    console.log('👨‍👩‍👧 Parent Service initialized')
  }

  /**
   * Get parent report (all children)
   */
  async getParentReport(parentId: string): Promise<ParentReport> {
    try {
      const parent = await UserDB.getById(parentId)
      const childrenIds: string[] = parent.metadata.children || []

      if (childrenIds.length === 0) {
        return { parentId, children: [] }
      }

      const childrenData = await Promise.all(
        childrenIds.map(async (id) => {
          const child = await UserDB.getById(id)
          const proofs = await ProofDB.getByUser(id)

          const avgScore = proofs.length > 0
            ? Math.round(proofs.reduce((sum, p) => sum + p.score, 0) / proofs.length)
            : 0

          // Analyze modules
          const moduleScores = new Map<string, number[]>()
          proofs.forEach(p => {
            if (!moduleScores.has(p.module_id)) {
              moduleScores.set(p.module_id, [])
            }
            moduleScores.get(p.module_id)!.push(p.score)
          })

          const strengths: string[] = []
          const needsHelp: string[] = []
          moduleScores.forEach((scores, module) => {
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length
            if (avg >= 80) strengths.push(module)
            if (avg < 60) needsHelp.push(module)
          })

          return {
            id: child.id,
            name: child.name,
            totalLessons: proofs.length,
            averageScore: avgScore,
            totalEarned: child.total_earned,
            recentActivity: proofs.slice(0, 5).map(p => ({
              module: p.module_id,
              score: p.score,
              date: p.created_at
            })),
            strengths,
            needsHelp
          }
        })
      )

      const report: ParentReport = { parentId, children: childrenData }

      console.log(`👨‍👩‍👧 Parent report for ${parent.name}:`)
      console.log(`   Children: ${childrenData.length}`)
      childrenData.forEach(c => {
        console.log(`   - ${c.name}: ${c.totalLessons} lessons, ${c.averageScore}% avg`)
      })

      return report

    } catch (error) {
      console.warn('⚠️  Database unavailable')
      return { parentId, children: [] }
    }
  }

  /**
   * Send notification to parent (SMS + in-app)
   */
  async notifyParent(
    parentId: string, 
    childName: string, 
    event: 'completion' | 'achievement' | 'concern',
    details: string
  ): Promise<void> {
    try {
      const parent = await UserDB.getById(parentId)
      const phone = parent.metadata.phone_number

      const emoji = event === 'completion' ? '🎉' : event === 'achievement' ? '🌟' : '⚠️'
      const message = `${emoji} ${childName}: ${details}`

      // Send SMS
      if (phone) {
        await smsLearning['sendSMS'](phone, message)
      }

      // Store notification
      await UserDB.updateMetadata(parentId, {
        ...parent.metadata,
        notifications: [
          ...(parent.metadata.notifications || []),
          {
            child: childName,
            event,
            message: details,
            date: new Date().toISOString(),
            read: false
          }
        ]
      })

      console.log(`📲 Parent notified: ${message}`)
      this.emit('parent-notified', { parentId, event })

    } catch (error) {
      console.error('Failed to notify parent:', error)
    }
  }

  /**
   * Link child to parent
   */
  async linkChild(parentId: string, childId: string): Promise<void> {
    try {
      const parent = await UserDB.getById(parentId)
      
      await UserDB.updateMetadata(parentId, {
        ...parent.metadata,
        children: [...new Set([...(parent.metadata.children || []), childId])]
      })

      console.log(`✅ Linked child ${childId} to parent ${parentId}`)
    } catch (error) {
      console.error('Failed to link child:', error)
    }
  }
}

export const teacherService = new TeacherService()
export const parentService = new ParentService()

export default { teacherService, parentService }
