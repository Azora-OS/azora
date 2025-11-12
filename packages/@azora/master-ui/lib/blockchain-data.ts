export interface BlockchainCredential {
  id: string
  qualificationId: string
  userId: string
  credentialHash: string
  blockchainTxHash: string
  verificationDate: string
  status: "verified" | "pending" | "failed"
  azrReward: number
  certificateNumber: string
  expiryDate?: string
  issuer: string
}

export interface AZRTransaction {
  id: string
  type: "earning" | "spending" | "transfer" | "referral"
  amount: number
  reason: string
  date: string
  status: "completed" | "pending"
  txHash?: string
  description: string
}

export interface RewardsStats {
  totalEarned: number
  currentBalance: number
  thisMonth: number
  pendingRewards: number
}

export const mockCredentials: BlockchainCredential[] = [
  {
    id: "cred-001",
    qualificationId: "qual-aws-cca",
    userId: "user-001",
    credentialHash: "0x8f3d4e7a2b1c9e5f6a8d3c7b9e2f1a5c",
    blockchainTxHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a",
    verificationDate: "2025-01-15",
    status: "verified",
    azrReward: 5000,
    certificateNumber: "AZORA-AWS-2025-001",
    issuer: "Amazon Web Services",
  },
]

export const mockTransactions: AZRTransaction[] = [
  {
    id: "tx-001",
    type: "earning",
    amount: 5000,
    reason: "AWS Certification Completion",
    date: "2025-01-15",
    status: "completed",
    txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
    description: "Earned 5000 AZR for completing AWS Certified Cloud Architect certification",
  },
  {
    id: "tx-002",
    type: "referral",
    amount: 1000,
    reason: "Friend Signup Bonus",
    date: "2025-01-10",
    status: "completed",
    txHash: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
    description: "Referral bonus: Your friend joined Azora Sapiens",
  },
  {
    id: "tx-003",
    type: "earning",
    amount: 2000,
    reason: "Course Completion",
    date: "2025-01-05",
    status: "completed",
    txHash: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f",
    description: "Earned 2000 AZR for completing online learning path",
  },
  {
    id: "tx-004",
    type: "pending",
    amount: 3000,
    reason: "Certification Upload",
    date: "2025-01-20",
    status: "pending",
    description: "Waiting for verification of uploaded certificate",
  },
]

export const mockRewardsStats: RewardsStats = {
  totalEarned: 8000,
  currentBalance: 11100,
  thisMonth: 5000,
  pendingRewards: 3000,
}

export function generateVerificationHash(data: string): string {
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return "0x" + Math.abs(hash).toString(16).padStart(64, "0")
}

export function generateBlockchainTx(data: string): string {
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return "0x" + Math.abs(hash).toString(16).padStart(64, "0").substring(0, 66)
}
