/**
 * Proof-of-Knowledge Mining System
 * Learning-to-Earn: Knowledge becomes economically productive
 */

export interface KnowledgeProof {
  proofId: string
  studentId: string
  courseId: string
  knowledgeType: "quiz" | "project" | "practical" | "peer_review" | "certification"
  difficulty: number // 1-100
  verificationScore: number // 0-100
  networkUtility: number // 0-100 (how useful this knowledge is to others)
  aiValidation: boolean
  peerValidations: number
  azrReward: number
  timestamp: Date
}

export class ProofOfKnowledge {
  /**
   * Calculate AZR reward for knowledge proof
   * Formula: Difficulty × Verification × Network_Utility × Ubuntu_Multiplier
   */
  static calculateKnowledgeReward(proof: KnowledgeProof, ubuntuMultiplier = 1.0): number {
    // Base calculation
    let reward =
      (proof.difficulty / 100) * 50 + // Difficulty component (max 50 AZR)
      (proof.verificationScore / 100) * 30 + // Verification component (max 30 AZR)
      (proof.networkUtility / 100) * 20 // Utility component (max 20 AZR)

    // Apply Ubuntu multiplier (collaborative learning bonus)
    reward *= ubuntuMultiplier

    // AI validation bonus
    if (proof.aiValidation) {
      reward *= 1.1
    }

    // Peer validation bonus (more validators = higher confidence)
    reward *= 1 + Math.min(5, proof.peerValidations) * 0.05

    return Math.round(reward)
  }

  /**
   * Create proof of knowledge from learning completion
   */
  static createKnowledgeProof(
    studentId: string,
    courseId: string,
    knowledgeType: KnowledgeProof["knowledgeType"],
    difficulty: number,
    verificationScore: number,
    networkUtility: number,
  ): KnowledgeProof {
    return {
      proofId: `pok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      courseId,
      knowledgeType,
      difficulty: Math.min(100, difficulty),
      verificationScore: Math.min(100, verificationScore),
      networkUtility: Math.min(100, networkUtility),
      aiValidation: verificationScore > 75,
      peerValidations: 0,
      azrReward: 0, // Calculated separately
      timestamp: new Date(),
    }
  }

  /**
   * Network utility score based on course demand and scarcity
   */
  static calculateNetworkUtility(
    courseDemand: number, // 0-100
    knowledgeScarcity: number, // 0-100
    skillGap: number, // 0-100
  ): number {
    // High demand + high scarcity + existing skill gap = high utility
    return courseDemand * 0.4 + knowledgeScarcity * 0.4 + skillGap * 0.2
  }

  /**
   * Validate knowledge through peer review
   */
  static addPeerValidation(proof: KnowledgeProof, validatorId: string, isValid: boolean): KnowledgeProof {
    if (isValid) {
      proof.peerValidations += 1
      // Increase verification score slightly with each peer validation
      proof.verificationScore = Math.min(100, proof.verificationScore + (100 - proof.verificationScore) * 0.1)
    }
    return proof
  }
}
