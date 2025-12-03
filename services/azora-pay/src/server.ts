import express from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import axios from 'axios';
import { payRepository } from './pay-repository';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(compression());
app.use(express.json());

// Ubuntu Rate Limiting for financial operations
const ubuntuLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Ubuntu rate limit exceeded',
        ubuntu: 'Please slow down for financial harmony'
    }
});
app.use(ubuntuLimiter);

// Middleware to get user ID from header
const getUserId = (req: any) => {
    return req.headers['x-user-id'] || req.user?.id || 'user_123456789';
};

// Health check
app.get('/health', (req, res) => {
    res.json({
        service: 'azora-pay',
        status: 'healthy',
        ubuntu: 'I transact because we prosper together',
        timestamp: new Date().toISOString(),
        port: PORT,
        stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing',
        blockchain: process.env.BLOCKCHAIN_RPC_URL ? 'connected' : 'local',
        features: {
            payments: '✅ Active',
            wallet: '✅ Active',
            staking: '✅ Active',
            transactions: '✅ Active',
            paymentMethods: '✅ Active'
        }
    });
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
    res.json({
        philosophy: 'Ngiyakwazi ngoba sikwazi - I can because we can',
        principles: [
            'My transactions build our prosperity',
            'My trust strengthens our economy',
            'My security protects our community',
            'My growth fuels our collective success'
        ],
        service: 'azora-pay',
        ubuntu: 'Ubuntu financial empowerment'
    });
});

// ========== WALLET ENDPOINTS ==========

// GET /api/wallet/:userId - Get user wallet
app.get('/api/wallet/:userId', async (req: any, res: any) => {
    try {
        const { userId } = req.params;
        const requesterId = getUserId(req);

        // Users can only view their own wallets
        if (userId !== requesterId) {
            return res.status(403).json({
                error: 'Access denied - can only view own wallet',
                ubuntu: 'Ubuntu respect: Honor financial privacy'
            });
        }

        let wallet = await payRepository.getWallet(userId);

        if (!wallet) {
            // Create new wallet for user
            wallet = await payRepository.createWallet({
                userId,
                balance: 0,
                currency: 'AZR',
                available: 0,
                status: 'active'
            });

            // Log wallet creation to blockchain
            await logPaymentEvent('WALLET_CREATED', {
                walletId: wallet.id,
                userId,
                ubuntu: 'Ubuntu wallet creation'
            });
        }

        // Get wallet transactions
        const walletTransactions = await payRepository.getUserTransactions(userId);

        res.json({
            wallet,
            transactions: walletTransactions,
            ubuntu: 'Your wallet reflects Ubuntu prosperity'
        });
    } catch (error) {
        console.error('Error fetching wallet:', error);
        res.status(500).json({
            error: 'Failed to fetch wallet',
            ubuntu: 'We handle financial errors with Ubuntu grace'
        });
    }
});

// POST /api/wallet/:userId/fund - Fund wallet with AZR tokens
app.post('/api/wallet/:userId/fund', async (req: any, res: any) => {
    try {
        const { userId } = req.params;
        const requesterId = getUserId(req);
        const { amount, source = 'external' } = req.body;

        if (userId !== requesterId) {
            return res.status(403).json({
                error: 'Access denied - can only fund own wallet',
                ubuntu: 'Ubuntu respect: Honor financial permissions'
            });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({
                error: 'Valid amount required',
                ubuntu: 'Ubuntu clarity: Provide complete information'
            });
        }

        const wallet = await payRepository.getWallet(userId);
        if (!wallet) {
            return res.status(404).json({
                error: 'Wallet not found',
                ubuntu: 'Ubuntu guidance: Create wallet first'
            });
        }

        // Process funding through blockchain
        const fundingResult = await processWalletFunding(userId, amount, source);

        if (fundingResult.success) {
            // Update wallet balance
            const updatedWallet = await payRepository.updateWallet(userId, {
                balance: wallet.balance + amount,
                available: wallet.available + amount
            });

            // Record transaction
            const transaction = await payRepository.createTransaction({
                fromUserId: 'system',
                toUserId: userId,
                amount,
                currency: 'AZR',
                type: 'wallet_funding',
                status: 'completed',
                source,
                blockchainTxHash: fundingResult.transactionHash
            });

            // Log to blockchain
            await logPaymentEvent('WALLET_FUNDED', {
                transactionId: transaction.id,
                userId,
                amount,
                source,
                transactionHash: fundingResult.transactionHash
            });

            console.log(`💰 Wallet funded: ${userId} - Amount: ${amount} AZR`);

            res.json({
                success: true,
                wallet: updatedWallet,
                transaction,
                ubuntu: 'Wallet funded with Ubuntu prosperity'
            });
        } else {
            res.status(500).json({
                error: 'Failed to fund wallet',
                ubuntu: 'We handle funding errors with Ubuntu grace'
            });
        }
    } catch (error) {
        console.error('Error funding wallet:', error);
        res.status(500).json({
            error: 'Failed to fund wallet',
            ubuntu: 'We handle financial errors with Ubuntu grace'
        });
    }
});

// POST /api/wallet/:userId/withdraw - Withdraw from wallet
app.post('/api/wallet/:userId/withdraw', async (req: any, res: any) => {
    try {
        const { userId } = req.params;
        const requesterId = getUserId(req);
        const { amount, destination } = req.body;

        if (userId !== requesterId) {
            return res.status(403).json({
                error: 'Access denied - can only withdraw from own wallet',
                ubuntu: 'Ubuntu respect: Honor financial permissions'
            });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({
                error: 'Valid amount required',
                ubuntu: 'Ubuntu clarity: Provide complete information'
            });
        }

        const wallet = await payRepository.getWallet(userId);
        if (!wallet) {
            return res.status(404).json({
                error: 'Wallet not found',
                ubuntu: 'Ubuntu guidance: Create wallet first'
            });
        }

        if (wallet.available < amount) {
            return res.status(400).json({
                error: 'Insufficient balance',
                ubuntu: 'Ubuntu wisdom: Spend within your means'
            });
        }

        // Process withdrawal through blockchain
        const withdrawalResult = await processWalletWithdrawal(userId, amount, destination);

        if (withdrawalResult.success) {
            // Update wallet balance
            const updatedWallet = await payRepository.updateWallet(userId, {
                balance: wallet.balance - amount,
                available: wallet.available - amount
            });

            // Record transaction
            const transaction = await payRepository.createTransaction({
                fromUserId: userId,
                toUserId: destination,
                amount,
                currency: 'AZR',
                type: 'wallet_withdrawal',
                status: 'completed',
                blockchainTxHash: withdrawalResult.transactionHash
            });

            // Log to blockchain
            await logPaymentEvent('WALLET_WITHDRAWAL', {
                transactionId: transaction.id,
                userId,
                amount,
                destination,
                transactionHash: withdrawalResult.transactionHash
            });

            console.log(`💸 Wallet withdrawal: ${userId} - Amount: ${amount} AZR to ${destination}`);

            res.json({
                success: true,
                wallet: updatedWallet,
                transaction,
                ubuntu: 'Withdrawal completed with Ubuntu integrity'
            });
        } else {
            res.status(500).json({
                error: 'Failed to process withdrawal',
                ubuntu: 'We handle withdrawal errors with Ubuntu grace'
            });
        }
    } catch (error) {
        console.error('Error processing withdrawal:', error);
        res.status(500).json({
            error: 'Failed to process withdrawal',
            ubuntu: 'We handle financial errors with Ubuntu grace'
        });
    }
});

// ========== STAKING ENDPOINTS ==========

// GET /api/staking/pools - Get available staking pools
app.get('/api/staking/pools', async (req, res) => {
    try {
        const pools = await payRepository.getStakingPools();

        res.json({
            pools,
            ubuntu: 'Staking pools for Ubuntu collective growth'
        });
    } catch (error) {
        console.error('Error fetching staking pools:', error);
        res.status(500).json({
            error: 'Failed to fetch staking pools',
            ubuntu: 'We handle staking errors with Ubuntu grace'
        });
    }
});

// POST /api/staking/:userId/stake - Stake AZR tokens
app.post('/api/staking/:userId/stake', async (req: any, res: any) => {
    try {
        const { userId } = req.params;
        const requesterId = getUserId(req);
        const { amount, poolId, duration = 30 } = req.body; // duration in days

        if (userId !== requesterId) {
            return res.status(403).json({
                error: 'Access denied - can only stake own tokens',
                ubuntu: 'Ubuntu respect: Honor financial permissions'
            });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({
                error: 'Valid amount required',
                ubuntu: 'Ubuntu clarity: Provide complete information'
            });
        }

        const wallet = await payRepository.getWallet(userId);
        if (!wallet || wallet.available < amount) {
            return res.status(400).json({
                error: 'Insufficient balance',
                ubuntu: 'Ubuntu wisdom: Stake within your means'
            });
        }

        const pool = await payRepository.getStakingPool(poolId);
        if (!pool) {
            return res.status(404).json({
                error: 'Staking pool not found',
                ubuntu: 'Ubuntu guidance: Choose available pool'
            });
        }

        // Process staking through blockchain
        const stakingResult = await processStaking(userId, amount, poolId, duration);

        if (stakingResult.success) {
            // Update wallet
            const updatedWallet = await payRepository.updateWallet(userId, {
                available: wallet.available - amount,
                staked: wallet.staked + amount
            });

            // Create staking record
            const stakingRecord = await payRepository.createStakingRecord({
                userId,
                poolId,
                amount,
                duration,
                apr: pool.apr,
                endsAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
                blockchainTxHash: stakingResult.transactionHash
            });

            // Record transaction
            const transaction = await payRepository.createTransaction({
                fromUserId: userId,
                toUserId: poolId,
                amount,
                currency: 'AZR',
                type: 'staking',
                status: 'completed',
                blockchainTxHash: stakingResult.transactionHash
            });

            // Log to blockchain
            await logPaymentEvent('TOKENS_STAKED', {
                transactionId: transaction.id,
                userId,
                amount,
                poolId,
                duration,
                transactionHash: stakingResult.transactionHash
            });

            console.log(`🌱 Tokens staked: ${userId} - Amount: ${amount} AZR in pool ${poolId}`);

            res.json({
                success: true,
                staking: stakingRecord,
                wallet: updatedWallet,
                transaction,
                ubuntu: 'Tokens staked for Ubuntu collective growth'
            });
        } else {
            res.status(500).json({
                error: 'Failed to stake tokens',
                ubuntu: 'We handle staking errors with Ubuntu grace'
            });
        }
    } catch (error) {
        console.error('Error staking tokens:', error);
        res.status(500).json({
            error: 'Failed to stake tokens',
            ubuntu: 'We handle financial errors with Ubuntu grace'
        });
    }
});

// POST /api/staking/:userId/unstake - Unstake AZR tokens
app.post('/api/staking/:userId/unstake', async (req: any, res: any) => {
    try {
        const { userId } = req.params;
        const requesterId = getUserId(req);
        const { stakingId } = req.body;

        if (userId !== requesterId) {
            return res.status(403).json({
                error: 'Access denied - can only unstake own tokens',
                ubuntu: 'Ubuntu respect: Honor financial permissions'
            });
        }

        const wallet = await payRepository.getWallet(userId);
        if (!wallet) {
            return res.status(404).json({
                error: 'Wallet not found',
                ubuntu: 'Ubuntu guidance: Create wallet first'
            });
        }

        const stakingRecord = await payRepository.getStakingRecord(stakingId);
        if (!stakingRecord || stakingRecord.userId !== userId) {
            return res.status(404).json({
                error: 'Staking record not found',
                ubuntu: 'Ubuntu guidance: Check staking ID'
            });
        }

        if (stakingRecord.status !== 'active') {
            return res.status(400).json({
                error: 'Staking record already completed or unstaked',
                ubuntu: 'Ubuntu clarity: Check staking status'
            });
        }

        // Process unstaking through blockchain
        const unstakingResult = await processUnstaking(userId, stakingId);

        if (unstakingResult.success) {
            const unstakedAmount = stakingRecord.amount;
            const rewards = unstakingResult.rewards || 0;

            // Update wallet
            const updatedWallet = await payRepository.updateWallet(userId, {
                staked: wallet.staked - unstakedAmount,
                available: wallet.available + unstakedAmount + rewards,
                balance: wallet.balance + rewards
            });

            // Update staking record
            await payRepository.updateStakingRecord(stakingId, {
                status: 'unstaked',
                rewards,
                blockchainTxHash: unstakingResult.transactionHash
            });

            // Record transaction
            const transaction = await payRepository.createTransaction({
                fromUserId: 'staking_pool',
                toUserId: userId,
                amount: unstakedAmount + rewards,
                currency: 'AZR',
                type: 'unstaking',
                status: 'completed',
                blockchainTxHash: unstakingResult.transactionHash,
                metadata: { rewards }
            });

            // Log to blockchain
            await logPaymentEvent('TOKENS_UNSTAKED', {
                transactionId: transaction.id,
                userId,
                amount: unstakedAmount,
                rewards,
                transactionHash: unstakingResult.transactionHash
            });

            console.log(`🌿 Tokens unstaked: ${userId} - Amount: ${unstakedAmount} AZR + ${rewards} rewards`);

            res.json({
                success: true,
                wallet: updatedWallet,
                transaction,
                unstakedAmount,
                rewards,
                ubuntu: 'Tokens unstaked with Ubuntu rewards'
            });
        } else {
            res.status(500).json({
                error: 'Failed to unstake tokens',
                ubuntu: 'We handle unstaking errors with Ubuntu grace'
            });
        }
    } catch (error) {
        console.error('Error unstaking tokens:', error);
        res.status(500).json({
            error: 'Failed to unstake tokens',
            ubuntu: 'We handle financial errors with Ubuntu grace'
        });
    }
});

// ========== PAYMENT METHODS ENDPOINTS ==========

// GET /api/payment-methods/:userId - Get user payment methods
app.get('/api/payment-methods/:userId', async (req: any, res: any) => {
    try {
        const { userId } = req.params;
        const requesterId = getUserId(req);

        if (userId !== requesterId) {
            return res.status(403).json({
                error: 'Access denied - can only view own payment methods',
                ubuntu: 'Ubuntu respect: Honor financial privacy'
            });
        }

        const userPaymentMethods = await payRepository.getUserPaymentMethods(userId);

        res.json({
            paymentMethods: userPaymentMethods,
            ubuntu: 'Payment methods managed with Ubuntu care'
        });
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        res.status(500).json({
            error: 'Failed to fetch payment methods',
            ubuntu: 'We handle financial errors with Ubuntu grace'
        });
    }
});

// POST /api/payment-methods/:userId - Add payment method
app.post('/api/payment-methods/:userId', async (req: any, res: any) => {
    try {
        const { userId } = req.params;
        const requesterId = getUserId(req);
        const { type, details, isDefault = false } = req.body;

        if (userId !== requesterId) {
            return res.status(403).json({
                error: 'Access denied - can only add own payment methods',
                ubuntu: 'Ubuntu respect: Honor financial permissions'
            });
        }

        if (!type || !details) {
            return res.status(400).json({
                error: 'Payment method type and details required',
                ubuntu: 'Ubuntu clarity: Provide complete information'
            });
        }

        // Create payment method
        const paymentMethod = await payRepository.createPaymentMethod({
            userId,
            type,
            details,
            isDefault
        });

        // Log to blockchain
        await logPaymentEvent('PAYMENT_METHOD_ADDED', {
            paymentMethodId: paymentMethod.id,
            userId,
            type,
            ubuntu: 'Ubuntu payment method creation'
        });

        console.log(`💳 Payment method added: ${paymentMethod.id} for user ${userId}`);

        res.status(201).json({
            success: true,
            paymentMethod,
            ubuntu: 'Payment method added with Ubuntu security'
        });
    } catch (error) {
        console.error('Error adding payment method:', error);
        res.status(500).json({
            error: 'Failed to add payment method',
            ubuntu: 'We handle financial errors with Ubuntu grace'
        });
    }
});

// ========== UTILITY FUNCTIONS ==========

async function processWalletFunding(userId: string, amount: number, source: string) {
    try {
        // Process funding through blockchain service
        // In a real implementation, this would call the blockchain service
        // For now, we simulate a successful transaction hash
        return {
            success: true,
            transactionHash: '0x' + uuidv4().replace(/-/g, '')
        };
    } catch (error: any) {
        console.error('Wallet funding failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

async function processWalletWithdrawal(userId: string, amount: number, destination: string) {
    try {
        return {
            success: true,
            transactionHash: '0x' + uuidv4().replace(/-/g, '')
        };
    } catch (error: any) {
        console.error('Wallet withdrawal failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

async function processStaking(userId: string, amount: number, poolId: string, duration: number) {
    try {
        return {
            success: true,
            transactionHash: '0x' + uuidv4().replace(/-/g, '')
        };
    } catch (error: any) {
        console.error('Staking failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

async function processUnstaking(userId: string, stakingId: string) {
    try {
        return {
            success: true,
            transactionHash: '0x' + uuidv4().replace(/-/g, ''),
            amount: 100, // Mock amount
            rewards: 5    // Mock rewards
        };
    } catch (error: any) {
        console.error('Unstaking failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

async function logPaymentEvent(eventType: string, data: any) {
    try {
        // Log to blockchain service for immutable audit trail
        await axios.post('http://localhost:3029/api/blockchain/transaction', {
            from: 'azora-pay',
            to: 'pay-audit',
            amount: 0,
            currency: 'AZR',
            type: 'PaymentEvent',
            data: { eventType, ...data, ubuntu: 'Ubuntu payment logging' }
        }, { timeout: 5000 });
    } catch (error) {
        console.warn('Blockchain logging failed:', (error as Error).message);
    }
}

// Ubuntu Error Handling
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Ubuntu Pay Service Error:', error);
    res.status(500).json({
        error: 'Ubuntu pay service error',
        ubuntu: 'We handle financial errors with Ubuntu grace',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Payment endpoint not found',
        ubuntu: 'Ubuntu guidance: Check available payment endpoints',
        availableEndpoints: [
            '/api/wallet/:userId',
            '/api/wallet/:userId/fund',
            '/api/wallet/:userId/withdraw',
            '/api/staking/pools',
            '/api/staking/:userId/stake',
            '/api/staking/:userId/unstake',
            '/api/payment-methods/:userId'
        ]
    });
});

app.listen(PORT, () => {
    console.log(`💳 Azora Pay Service running on port ${PORT}`);
    console.log('⚡ Ubuntu: "I transact because we prosper together!"');
    console.log(`🔗 Blockchain: ${process.env.BLOCKCHAIN_RPC_URL || 'Local'}`);
    console.log(`💰 Wallet: Active`);
    console.log(`🌱 Staking: Active`);
    console.log(`🛡️ Ubuntu: Financial security through community trust`);
});

export default app;
