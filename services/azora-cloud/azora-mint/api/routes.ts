/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * AZORA MINT API ROUTES
 * Complete money system endpoints
 */

import { Router } from 'express'
import { bankIntegration } from '../bank-integration'
import { mintMine } from '../advanced-mint-mine'
import { directWithdrawal } from '../direct-bank-withdrawal'
import { lunoIntegration } from '../luno-integration'

const router = Router()

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'azora-mint',
    timestamp: new Date().toISOString()
  })
})

// Bank account operations
router.post('/bank/link', async (req, res) => {
  try {
    const { userId, accountNumber, bank, accountHolder, branchCode } = req.body
    const account = await bankIntegration.linkBankAccount(
      userId,
      accountNumber,
      bank,
      accountHolder,
      branchCode
    )
    res.json({ success: true, account })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.post('/bank/verify', async (req, res) => {
  try {
    const { userId } = req.body
    const verified = await bankIntegration.verifyBankAccount(userId)
    res.json({ success: true, verified })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// Loan operations
router.post('/loan/apply', async (req, res) => {
  try {
    const { userId, amount, purpose, term } = req.body
    const loan = await bankIntegration.applyForLoan(userId, amount, purpose, term)
    res.json({ success: true, loan })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.post('/loan/approve/:loanId', async (req, res) => {
  try {
    const { loanId } = req.params
    await bankIntegration.approveLoan(loanId)
    res.json({ success: true })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// Token conversion
router.post('/convert/azr-to-zar', async (req, res) => {
  try {
    const { userId, azrAmount } = req.body
    const zarAmount = await bankIntegration.convertAZRtoZAR(userId, azrAmount)
    res.json({ success: true, zarAmount })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// Withdrawals
router.post('/withdraw/to-bank', async (req, res) => {
  try {
    const { userId, amount } = req.body
    await bankIntegration.withdrawToBank(userId, amount)
    res.json({ success: true })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.post('/withdraw/via-luno', async (req, res) => {
  try {
    const { userId, azrAmount, bankAccount } = req.body
    const withdrawal = await directWithdrawal.withdrawViaLuno(userId, azrAmount, bankAccount)
    res.json({ success: true, withdrawal })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// P2P transfers
router.post('/transfer/p2p', async (req, res) => {
  try {
    const { fromUserId, toUserId, amount, currency } = req.body
    await bankIntegration.transferP2P(fromUserId, toUserId, amount, currency)
    res.json({ success: true })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// Mining operations
router.post('/mine/learn', async (req, res) => {
  try {
    const { userId, hoursLearned, performance } = req.body
    const reward = await mintMine.mineThroughLearning(userId, hoursLearned, performance)
    res.json({ success: true, reward })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.post('/stake', async (req, res) => {
  try {
    const { userId, amount, lockDays } = req.body
    const expectedReward = await mintMine.autoStake(userId, amount, lockDays)
    res.json({ success: true, expectedReward })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// Financial reports
router.get('/summary/user/:userId', (req, res) => {
  try {
    const { userId } = req.params
    const summary = bankIntegration.getFinancialSummary(userId)
    res.json({ success: true, summary })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.get('/summary/founder', (req, res) => {
  try {
    const revenue = bankIntegration.getFounderRevenue()
    res.json({ success: true, revenue })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.get('/stats', (req, res) => {
  try {
    const stats = mintMine.getStats()
    res.json({ success: true, stats })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// Luno integration
router.get('/luno/balances', async (req, res) => {
  try {
    const balances = await lunoIntegration.getBalances()
    res.json({ success: true, balances })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.post('/luno/withdraw', async (req, res) => {
  try {
    const { amount, beneficiaryId } = req.body
    const withdrawal = await lunoIntegration.withdrawZAR(amount, beneficiaryId)
    res.json({ success: true, withdrawal })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

export default router
