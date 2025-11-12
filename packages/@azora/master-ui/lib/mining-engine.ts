// AZR Mining Engine - Proof of Knowledge Mining System

export interface KnowledgeProof {
  type: "course-completion" | "quiz" | "project" | "contribution"
  baseReward: number
  multiplier: number
}

export interface MinerProfile {
  sapiensId: string
  level: "beginner" | "intermediate" | "advanced"
  program: string
  miningPower: number
  totalAzrEarned: number
  proofsSubmitted: number
}

const PROOF_MULTIPLIERS: Record<string, number> = {
  quiz: 1,
  contribution: 3,
  project: 5,
  "course-completion": 10,
}

const LEVEL_MULTIPLIERS: Record<string, number> = {
  beginner: 1.0,
  intermediate: 1.5,
  advanced: 2.0,
}

const PROGRAM_MULTIPLIERS: Record<string, number> = {
  blockchain: 1.2,
  ai: 1.3,
  "data-science": 1.2,
  cybersecurity: 1.15,
  "full-stack": 1.1,
  other: 1.0,
}

export function calculateMiningPower(level: string, program: string): number {
  const levelMult = LEVEL_MULTIPLIERS[level] || 1.0
  const programMult = PROGRAM_MULTIPLIERS[program] || 1.0
  return levelMult * programMult
}

export function calculateAzrReward(baseReward: number, miningPower: number, proofType: string): number {
  const multiplier = PROOF_MULTIPLIERS[proofType] || 1
  return Math.floor(baseReward * miningPower * multiplier)
}

export function getMiningStats(profile: MinerProfile) {
  return {
    totalEarnings: profile.totalAzrEarned,
    averagePerProof: Math.floor(profile.totalAzrEarned / Math.max(profile.proofsSubmitted, 1)),
    miningPower: profile.miningPower.toFixed(2),
    nextMilestone: (profile.proofsSubmitted + 1) * 1000,
  }
}
