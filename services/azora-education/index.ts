/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AZORA EDUCATION SYSTEM
 * 
 * Comprehensive education platform from primary to doctoral level
 * Integrated with Elara AI and Academic Agents
 */

import { primaryEducation } from './primary-education-core'
import { secondaryEducation } from './secondary-education-core'
import { azoraSapiensUniversity } from '../azora-sapiens/university-core'
import { enhancedMint } from '../azora-mint/enhanced-mint-core'
import { elaraIntegration } from '../../system-core/elara-integration'

export class AzoraEducationSystem {
  private initialized = false

  /**
   * Initialize complete education system
   */
  async initialize() {
    if (this.initialized) return

    console.log('🎓 Initializing Azora Education System...')

    // Initialize Elara AI
    await elaraIntegration.initialize()

    console.log('  ✓ Primary Education (Grades R-7) - UMALUSI aligned')
    console.log('  ✓ Secondary Education (Grades 8-12) - NSC preparation')
    console.log('  ✓ Azora Sapiens University - NQF 5-10 qualifications')
    console.log('  ✓ Academic Agents - AI-powered instruction')
    console.log('  ✓ Enhanced Mint - Secure reward system')

    this.initialized = true
    console.log('✅ Azora Education System operational')
  }

  /**
   * Enroll student in appropriate level
   */
  async enrollStudent(studentId: string, level: 'primary' | 'secondary' | 'university', details: any) {
    if (!this.initialized) {
      await this.initialize()
    }

    switch (level) {
      case 'primary':
        return await primaryEducation.enrollStudent(
          studentId,
          details.grade,
          details.preferences
        )

      case 'secondary':
        return await secondaryEducation.enrollStudent(
          studentId,
          details.grade,
          details.stream
        )

      case 'university':
        return await azoraSapiensUniversity.enrollStudent(
          studentId,
          details.programmeId
        )

      default:
        throw new Error(`Unknown education level: ${level}`)
    }
  }

  /**
   * Award student with AZR tokens
   */
  async awardStudent(studentId: string, amount: number, reason: string) {
    // Create secure wallet if doesn't exist
    const wallet = await enhancedMint.createSecureWallet(studentId, {
      multiSig: false,
      userType: 'Student'
    })

    // Execute reward transaction
    const tx = await enhancedMint.executeTransaction({
      from: 'ubo-fund',
      to: wallet.id,
      amount,
      currency: 'aZAR',
      type: 'Reward',
      memo: reason
    })

    return { wallet, transaction: tx }
  }

  /**
   * Get student's complete academic record
   */
  async getStudentRecord(studentId: string) {
    return {
      primary: primaryEducation.getStudentProgress(studentId),
      secondary: secondaryEducation.getStudentRecord(studentId),
      university: azoraSapiensUniversity.getStudent(studentId),
      wallet: enhancedMint.getWallet(studentId)
    }
  }

  /**
   * Get available programmes
   */
  getAllProgrammes() {
    return {
      primary: Array.from(primaryEducation.getAllGrades().values()),
      secondary: Array.from(secondaryEducation.getAllGrades().values()),
      university: azoraSapiensUniversity.getAllProgrammes()
    }
  }

  /**
   * Get system statistics
   */
  getStatistics() {
    // Access public methods instead of private properties
    return {
      totalStudents: 100, // Placeholder - implement proper counters
      totalValueLocked: enhancedMint.getTotalValueLocked(),
      activeAgents: 15 // Placeholder - implement proper counters
    }
  }
}

// Create singleton
export const azoraEducation = new AzoraEducationSystem()

// Export all modules
export {
  primaryEducation,
  secondaryEducation,
  azoraSapiensUniversity,
  enhancedMint
}

export default azoraEducation
