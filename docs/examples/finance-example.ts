/**
 * Azora OS Finance Service Examples
 * Ubuntu Principle: "My success enables your success"
 */

import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

// ============================================
// 1. GET WALLET BALANCE
// ============================================

async function getWalletBalance() {
  try {
    const response = await axios.get(`${API_BASE}/wallet/balance`);

    console.log('✅ Balance:', response.data.balance, 'AZR');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get balance:', error.response?.data);
    throw error;
  }
}

// ============================================
// 2. GET TRANSACTIONS
// ============================================

async function getTransactions(limit = 50) {
  try {
    const response = await axios.get(`${API_BASE}/transactions`, {
      params: { limit }
    });

    console.log(`✅ Retrieved ${response.data.length} transactions`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get transactions:', error.response?.data);
    throw error;
  }
}

// ============================================
// 3. START MINING
// ============================================

async function startMining(activityId: string, activityType: string) {
  try {
    const response = await axios.post(`${API_BASE}/mining/start`, {
      activityId,
      activityType
    });

    console.log('✅ Mining started. Earned:', response.data.tokensEarned, 'AZR');
    return response.data;
  } catch (error) {
    console.error('❌ Mining failed:', error.response?.data);
    throw error;
  }
}

// ============================================
// 4. STAKE TOKENS
// ============================================

async function stakeTokens(amount: number) {
  try {
    const response = await axios.post(`${API_BASE}/wallet/stake`, {
      amount
    });

    console.log('✅ Staked:', amount, 'AZR');
    return response.data;
  } catch (error) {
    console.error('❌ Staking failed:', error.response?.data);
    throw error;
  }
}

export {
  getWalletBalance,
  getTransactions,
  startMining,
  stakeTokens
};
