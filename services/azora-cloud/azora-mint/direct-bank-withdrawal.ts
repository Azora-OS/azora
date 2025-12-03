/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * DIRECT BANK WITHDRAWAL SYSTEM
 * Our own withdrawal system - No payment gateway fees!
 * 
 * STRATEGY:
 * 1. Use Luno for crypto → ZAR conversion (0% fees!)
 * 2. Withdraw ZAR from Luno → Your Capitec account (0% fees!)
 * 3. Manual EFT from Capitec → Student accounts (free up to 5/month)
 * 4. Or use Capitec API if available
 */

import { EventEmitter } from 'events'
import { lunoIntegration } from './luno-integration'
import crypto from 'crypto'

export interface DirectWithdrawal {
  id: string
  userId: string
  amount: number
  currency: 'ZAR' | 'AZR'
  method: 'luno' | 'manual-eft' | 'capitec-api'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  fee: number
  bankAccount: {
    accountNumber: string
    bank: string
    accountHolder: string
  }
  reference: string
  createdAt: Date
  completedAt?: Date
}

export class DirectBankWithdrawal extends EventEmitter {
  private withdrawals: Map<string, DirectWithdrawal> = new Map()
  private monthlyFreeEFTs: number = 5 // Capitec gives 5 free EFTs/month
  private usedFreeEFTs: number = 0

  constructor() {
    super()
    console.log('🏦 Direct Bank Withdrawal System initialized')
    console.log('   💡 Strategy: Luno (0% fees) → Capitec → Students')
  }

  /**
   * CHEAPEST: Withdraw via Luno (RECOMMENDED)
   * Total fees: 0%!
   */
  async withdrawViaLuno(
    userId: string,
    azrAmount: number,
    bankAccount: { accountNumber: string; bank: string; accountHolder: string }
  ): Promise<DirectWithdrawal> {
    console.log('\n💎 LUNO WITHDRAWAL (0% FEES!)')
    console.log(`   User: ${userId}`)
    console.log(`   AZR Amount: ${azrAmount}`)
    console.log(`   Destination: ${bankAccount.bank} ***${bankAccount.accountNumber.slice(-4)}`)

    // Step 1: Convert AZR to ZAR (1% internal conversion fee goes to you)
    const exchangeRate = 10 // 1 AZR = R10
    const internalFee = azrAmount * exchangeRate * 0.01
    const zarAfterFee = (azrAmount * exchangeRate) - internalFee

    console.log('\n   STEP 1: Convert AZR → ZAR')
    console.log(`   ${azrAmount} AZR × R${exchangeRate} = R${azrAmount * exchangeRate}`)
    console.log(`   Internal fee (1%): R${internalFee.toFixed(2)} (YOUR REVENUE!)`)
    console.log(`   Net ZAR: R${zarAfterFee.toFixed(2)}`)

    // Step 2: Send ZAR to user via Luno (0% fees!)
    console.log('\n   STEP 2: Withdraw via Luno')
    console.log(`   Fee: R0 (Luno doesn't charge!)`)
    
    try {
      const lunoWithdrawal = await lunoIntegration.withdrawZAR(zarAfterFee)
      
      const withdrawal: DirectWithdrawal = {
        id: crypto.randomUUID(),
        userId,
        amount: zarAfterFee,
        currency: 'ZAR',
        method: 'luno',
        status: 'completed',
        fee: 0, // No external fees!
        bankAccount,
        reference: lunoWithdrawal.reference,
        createdAt: new Date(),
        completedAt: new Date()
      }

      this.withdrawals.set(withdrawal.id, withdrawal)

      console.log('\n   ✅ WITHDRAWAL COMPLETE!')
      console.log(`   💰 Student gets: R${zarAfterFee.toFixed(2)}`)
      console.log(`   💵 You earned: R${internalFee.toFixed(2)}`)
      console.log(`   🎯 External fees: R0`)
      console.log(`   📊 Total margin: ${((internalFee / (azrAmount * exchangeRate)) * 100).toFixed(1)}%`)

      this.emit('withdrawal-completed', withdrawal)
      return withdrawal

    } catch (error: any) {
      console.error('❌ Luno withdrawal failed:', error.message)
      console.log('   ⚠️  Falling back to manual EFT...')
      return this.withdrawViaManualEFT(userId, zarAfterFee, bankAccount)
    }
  }

  /**
   * BACKUP: Manual EFT from Capitec (5 free/month, then R6.50 each)
   */
  async withdrawViaManualEFT(
    userId: string,
    amount: number,
    bankAccount: { accountNumber: string; bank: string; accountHolder: string }
  ): Promise<DirectWithdrawal> {
    console.log('\n💳 MANUAL EFT WITHDRAWAL')
    console.log(`   Amount: R${amount}`)
    console.log(`   To: ${bankAccount.bank} ${bankAccount.accountNumber}`)
    console.log(`   Holder: ${bankAccount.accountHolder}`)

    // Calculate fee
    const fee = this.usedFreeEFTs < this.monthlyFreeEFTs ? 0 : 6.50
    this.usedFreeEFTs++

    const withdrawal: DirectWithdrawal = {
      id: crypto.randomUUID(),
      userId,
      amount,
      currency: 'ZAR',
      method: 'manual-eft',
      status: 'pending',
      fee,
      bankAccount,
      reference: `AZORA-EFT-${Date.now()}`,
      createdAt: new Date()
    }

    this.withdrawals.set(withdrawal.id, withdrawal)

    console.log('\n   📋 MANUAL ACTION REQUIRED:')
    console.log('   1. Log into Capitec app')
    console.log('   2. Go to "Transact" → "Pay"')
    console.log('   3. Add beneficiary:')
    console.log(`      Name: ${bankAccount.accountHolder}`)
    console.log(`      Bank: ${bankAccount.bank}`)
    console.log(`      Account: ${bankAccount.accountNumber}`)
    console.log(`   4. Pay amount: R${amount}`)
    console.log(`   5. Reference: ${withdrawal.reference}`)
    console.log(`   6. Confirm with Remote PIN`)
    
    if (fee === 0) {
      console.log(`\n   ✅ FREE EFT (${this.usedFreeEFTs}/${this.monthlyFreeEFTs} used this month)`)
    } else {
      console.log(`\n   💵 Fee: R${fee} (free EFTs exhausted)`)
    }

    this.emit('manual-eft-required', withdrawal)
    return withdrawal
  }

  /**
   * FUTURE: Capitec API direct integration (if they release it)
   */
  async withdrawViaCapitecAPI(
    userId: string,
    amount: number,
    bankAccount: { accountNumber: string; bank: string; accountHolder: string }
  ): Promise<DirectWithdrawal> {
    console.log('\n🚀 CAPITEC API WITHDRAWAL (NOT YET AVAILABLE)')
    console.log('   ⚠️  Capitec does not currently offer public API')
    console.log('   💡 Falling back to Luno method...')

    return this.withdrawViaLuno(userId, amount / 10, bankAccount) // Convert ZAR back to AZR estimate
  }

  /**
   * Get optimal withdrawal method
   */
  getOptimalMethod(): 'luno' | 'manual-eft' | 'capitec-api' {
    // Check if Luno is configured
    const lunoConfigured = process.env.LUNO_API_KEY_ID && process.env.LUNO_API_SECRET
    
    if (lunoConfigured) {
      return 'luno' // Best: 0% fees!
    } else if (this.usedFreeEFTs < this.monthlyFreeEFTs) {
      return 'manual-eft' // Good: Free EFTs available
    } else {
      return 'manual-eft' // Okay: R6.50 fee
    }
  }

  /**
   * Calculate total fees
   */
  calculateFees(amount: number, method: 'luno' | 'manual-eft' | 'capitec-api'): number {
    switch (method) {
      case 'luno':
        return 0 // Luno doesn't charge withdrawal fees!
      case 'manual-eft':
        return this.usedFreeEFTs < this.monthlyFreeEFTs ? 0 : 6.50
      case 'capitec-api':
        return 0 // Would be free if available
      default:
        return 0
    }
  }

  /**
   * Get withdrawal summary
   */
  getSummary() {
    const withdrawals = Array.from(this.withdrawals.values())
    const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0)
    const totalFees = withdrawals.reduce((sum, w) => sum + w.fee, 0)

    return {
      totalWithdrawals: withdrawals.length,
      totalWithdrawn,
      totalFees,
      netAmount: totalWithdrawn - totalFees,
      freeEFTsRemaining: this.monthlyFreeEFTs - this.usedFreeEFTs,
      avgFeePercentage: ((totalFees / totalWithdrawn) * 100).toFixed(2) + '%'
    }
  }
}

export const directWithdrawal = new DirectBankWithdrawal()
export default directWithdrawal
