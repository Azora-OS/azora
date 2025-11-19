const wallets = new Map();
const transactions = new Map();

const createWallet = async (req, res) => {
  try {
    const { userId, currency = 'USD' } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'UserId is required' });
    }

    const wallet = {
      id: `wallet_${Date.now()}`,
      userId,
      currency,
      balance: 0,
      createdAt: new Date().toISOString()
    };

    wallets.set(wallet.id, wallet);

    res.status(201).json({
      message: 'Wallet created successfully',
      wallet
    });
  } catch (error) {
    console.error('Wallet creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userWallets = Array.from(wallets.values()).filter(w => w.userId === userId);
    
    if (userWallets.length === 0) {
      return res.status(404).json({ error: 'No wallets found for user' });
    }

    res.json({
      wallets: userWallets,
      totalBalance: userWallets.reduce((sum, w) => sum + w.balance, 0)
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createTransaction = async (req, res) => {
  try {
    const { fromUserId, toUserId, amount, type, description } = req.body;
    
    if (!amount || !type) {
      return res.status(400).json({ error: 'Amount and type are required' });
    }

    const transaction = {
      id: `txn_${Date.now()}`,
      fromUserId,
      toUserId,
      amount,
      type,
      description: description || '',
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    transactions.set(transaction.id, transaction);

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createWallet,
  getBalance,
  createTransaction
};