/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from 'axios';

const EDUCATION_API_URL = process.env.EDUCATION_API_URL || 'http://localhost:3008';

export interface SkillBadge {
  id: string;
  skillName: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  source: 'sapiens' | 'forge' | 'external';
  certificateId?: string;
  certificateUrl?: string;
  issueDate: Date;
  expiryDate?: Date;
  verified: boolean;
}

export interface EducationCredential {
  type: 'course' | 'degree' | 'certificate';
  name: string;
  institution: string;
  completionDate: Date;
  grade?: string;
  credentialUrl?: string;
}

/**
 * 🎓 SKILL VERIFICATION SERVICE - Education Bridge
 * 
 * Connects Forge to Sapiens Academy to verify skills.
 * Users can display their completed courses as verified skills.
 */
export class SkillVerificationService {

  /**
   * Get verified skills for a user from Sapiens
   */
  static async getVerifiedSkills(userId: string): Promise<SkillBadge[]> {
    try {
      const response = await axios.get(`${EDUCATION_API_URL}/api/certificates/user/${userId}`);

      const certificates = response.data.certificates || [];

      return certificates.map((cert: any) => ({
        id: cert.id,
        skillName: cert.courseName,
        level: this.determineSkillLevel(cert.grade),
        source: 'sapiens',
        certificateId: cert.id,
        certificateUrl: cert.certificateUrl,
        issueDate: new Date(cert.issueDate),
        verified: true
      }));
    } catch (error) {
      console.error('❌ Failed to get verified skills:', error);
      return [];
    }
  }

  /**
   * Add verified skill badge to Forge profile
   */
  static async addSkillBadge(
    userId: string,
    skillName: string,
    certificateId?: string
  ): Promise<SkillBadge> {
    // Verify certificate exists in Sapiens
    let verified = false;
    let certificateUrl;

    if (certificateId) {
      try {
        const response = await axios.get(`${EDUCATION_API_URL}/api/certificates/${certificateId}`);
        if (response.data.certificate) {
          verified = true;
          certificateUrl = response.data.certificate.certificateUrl;
        }
      } catch (error) {
        console.error('❌ Certificate verification failed:', error);
      }
    }

    const badge: SkillBadge = {
      id: `badge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      skillName,
      level: 'Beginner',
      source: certificateId ? 'sapiens' : 'forge',
      certificateId,
      certificateUrl,
      issueDate: new Date(),
      verified
    };

    // TODO: Save to database
    // await prisma.skillBadge.create({ data: badge });

    this.emitEvent('skill:badge_added', { userId, badge });

    return badge;
  }

  /**
   * Verify skill through test/quiz
   */
  static async verifySkillThroughTest(
    userId: string,
    skillName: string,
    testScore: number
  ): Promise<SkillBadge> {
    if (testScore < 70) {
      throw new Error('Test score too low for verification (minimum 70%)');
    }

    const level = this.determineSkillLevel(testScore);

    const badge: SkillBadge = {
      id: `badge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      skillName,
      level,
      source: 'forge',
      issueDate: new Date(),
      verified: true
    };

    // TODO: Save to database
    // await prisma.skillBadge.create({ data: badge });

    this.emitEvent('skill:verified_through_test', { userId, badge, testScore });

    return badge;
  }

  /**
   * Get skill endorsements from clients
   */
  static async endorseSkill(
    sellerId: string,
    skillName: string,
    endorsedBy: string
  ): Promise<void> {
    // TODO: Save endorsement
    // await prisma.skillEndorsement.create({
    //   data: { sellerId, skillName, endorsedBy, createdAt: new Date() }
    // });

    this.emitEvent('skill:endorsed', { sellerId, skillName, endorsedBy });
  }

  /**
   * Get all endorsements for a skill
   */
  static async getSkillEndorsements(
    sellerId: string,
    skillName: string
  ): Promise<number> {
    // TODO: Count from database
    // return await prisma.skillEndorsement.count({
    //   where: { sellerId, skillName }
    // });
    return 0;
  }

  /**
   * Recommend courses based on in-demand Forge skills
   */
  static async recommendCourses(userId: string): Promise<any[]> {
    try {
      // Get user's current skills
      const userSkills = await this.getVerifiedSkills(userId);

      // Get in-demand skills on Forge
      const demandSkills = await this.getInDemandSkills();

      // Find skill gaps
      const skillGaps = demandSkills.filter(
        ds => !userSkills.some(us => us.skillName === ds.name)
      );

      // Get recommended courses from Sapiens
      const recommendations = [];
      for (const skill of skillGaps.slice(0, 5)) {
        try {
          const response = await axios.get(`${EDUCATION_API_URL}/api/courses/search`, {
            params: { q: skill.name }
          });
          recommendations.push(...response.data.courses);
        } catch (error) {
          console.error(`❌ Failed to get courses for ${skill.name}:`, error);
        }
      }

      return recommendations;
    } catch (error) {
      console.error('❌ Failed to recommend courses:', error);
      return [];
    }
  }

  /**
   * Get in-demand skills on Forge marketplace
   */
  static async getInDemandSkills(): Promise<Array<{ name: string; demand: number }>> {
    // TODO: Analyze marketplace data to find top skills
    // This could be based on:
    // - Number of job postings
    // - Average project price
    // - Completion rate
    // - Client satisfaction

    return [
      { name: 'Web Development', demand: 100 },
      { name: 'Graphic Design', demand: 85 },
      { name: 'Content Writing', demand: 70 },
      { name: 'Video Editing', demand: 65 },
      { name: 'Mobile App Development', demand: 60 }
    ];
  }

  /**
   * Check if user has specific skill
   */
  static async hasVerifiedSkill(userId: string, skillName: string): Promise<boolean> {
    const skills = await this.getVerifiedSkills(userId);
    return skills.some(s => s.skillName.toLowerCase() === skillName.toLowerCase());
  }

  /**
   * Get user's education credentials
   */
  static async getEducationCredentials(userId: string): Promise<EducationCredential[]> {
    try {
      const response = await axios.get(`${EDUCATION_API_URL}/api/students/${userId}/credentials`);
      return response.data.credentials || [];
    } catch (error) {
      console.error('❌ Failed to get education credentials:', error);
      return [];
    }
  }

  /**
   * Award Learn-to-Earn bonus for skill improvement
   */
  static async awardSkillImprovementBonus(
    userId: string,
    skillName: string,
    newLevel: string
  ): Promise<void> {
    const bonusAmounts = {
      'Beginner': 10,
      'Intermediate': 25,
      'Advanced': 50,
      'Expert': 100
    };

    const bonus = bonusAmounts[newLevel as keyof typeof bonusAmounts] || 0;

    if (bonus > 0) {
      try {
        // Award through Education service
        await axios.post(`${EDUCATION_API_URL}/api/learn-to-earn/award`, {
          userId,
          amount: bonus,
          reason: `Reached ${newLevel} level in ${skillName}`,
          metadata: {
            service: 'azora-forge',
            skillName,
            level: newLevel
          }
        });

        console.log(`✅ Awarded ${bonus} AZR for ${skillName} ${newLevel}`);
      } catch (error) {
        console.error('❌ Failed to award skill improvement bonus:', error);
      }
    }
  }

  /**
   * Determine skill level from test score or grade
   */
  private static determineSkillLevel(score: number): SkillBadge['level'] {
    if (score >= 90) { return 'Expert'; }
    if (score >= 80) { return 'Advanced'; }
    if (score >= 70) { return 'Intermediate'; }
    return 'Beginner';
  }

  /**
   * Organism Health Check - Ensure Education service is operational
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${EDUCATION_API_URL}/health`, {
        timeout: 5000
      });
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('❌ Education health check failed:', error);
      return false;
    }
  }

  private static emitEvent(event: string, data: any) {
    console.log(`🔔 Skill Verification Event: ${event}`, data);
    // Emit to organism event bus
    // OrganismEventBus.emit(event, data);
  }
}
