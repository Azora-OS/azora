import React, { useEffect, useState } from 'react';
import { WalletService, WalletBalance, Transaction } from '../services/wallet-service';
import { SendReceive } from '../components/SendReceive';

export const Dashboard: React.FC = () => {
    const [balance, setBalance] = useState<WalletBalance>({ azr: 0, usd: 0, eth: 0 });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [walletAddress, setWalletAddress] = useState('');

    const walletService = new WalletService();

    useEffect(() => {
        loadWalletData();
    }, []);

    const loadWalletData = async () => {
        setLoading(true);
        const address = await walletService.getWalletAddress();
        setWalletAddress(address);

        const bal = await walletService.getBalance(address);
        setBalance(bal);

        const txs = await walletService.getTransactionHistory(address);
        setTransactions(txs);

        setLoading(false);
    };

    const handleTransactionComplete = () => {
        loadWalletData(); // Refresh data after transaction
    };

    if (loading) {
        return <div className="dashboard loading">Loading wallet...</div>;
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Azora Pay Wallet</h1>
                <p className="wallet-address">
                    Address: {walletAddress.substring(0, 10)}...{walletAddress.substring(walletAddress.length - 8)}
                </p>
            </header>

            <div className="balance-section">
                <div className="balance-card primary">
                    <span className="balance-label">AZR Balance</span>
                    <span className="balance-amount">{balance.azr.toLocaleString()}</span>
                    <span className="balance-currency">AZR</span>
                </div>
                <div className="balance-card">
                    <span className="balance-label">USD Value</span>
                    <span className="balance-amount">${balance.usd.toLocaleString()}</span>
                </div>
                <div className="balance-card">
                    <span className="balance-label">ETH Value</span>
                    <span className="balance-amount">{balance.eth.toFixed(4)} ETH</span>
                </div>
            </div>

            <SendReceive onTransactionComplete={handleTransactionComplete} />

            <div className="transactions-section">
                <h2>Transaction History</h2>
                {transactions.length === 0 ? (
                    <p className="no-transactions">No transactions yet</p>
                ) : (
                    <div className="transactions-list">
                        {transactions.map(tx => (
                            <div key={tx.id} className={`transaction-item ${tx.type}`}>
                                <div className="tx-icon">{tx.type === 'send' ? '↑' : '↓'}</div>
                                <div className="tx-details">
                                    <span className="tx-type">{tx.type.toUpperCase()}</span>
                                    <span className="tx-address">
                                        {tx.type === 'send' ? `To: ${tx.to.substring(0, 10)}...` : `From: ${tx.from.substring(0, 10)}...`}
                                    </span>
                                    <span className="tx-time">{new Date(tx.timestamp).toLocaleString()}</span>
                                </div>
                                <div className="tx-amount">
                                    <span className={tx.type === 'send' ? 'negative' : 'positive'}>
                                        {tx.type === 'send' ? '-' : '+'}{tx.amount} AZR
                                    </span>
                                    <span className={`tx-status ${tx.status}`}>{tx.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
        .dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .dashboard-header {
          margin-bottom: 30px;
        }

        .dashboard-header h1 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .wallet-address {
          font-family: monospace;
          color: #666;
          font-size: 14px;
        }

        .balance-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .balance-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .balance-card.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .balance-label {
          font-size: 14px;
          opacity: 0.8;
        }

        .balance-amount {
          font-size: 32px;
          font-weight: bold;
        }

        .balance-currency {
          font-size: 12px;
          opacity: 0.7;
        }

        .transactions-section {
          margin-top: 40px;
        }

        .transactions-section h2 {
          margin-bottom: 20px;
          color: #333;
        }

        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .transaction-item {
          background: white;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .tx-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          background: #f0f0f0;
        }

        .transaction-item.send .tx-icon {
          background: #fee;
          color: #c00;
        }

        .transaction-item.receive .tx-icon {
          background: #efe;
          color: #0c0;
        }

        .tx-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .tx-type {
          font-weight: bold;
          font-size: 14px;
        }

        .tx-address {
          font-size: 12px;
          color: #666;
          font-family: monospace;
        }

        .tx-time {
          font-size: 11px;
          color: #999;
        }

        .tx-amount {
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .tx-amount span:first-child {
          font-weight: bold;
          font-size: 16px;
        }

        .negative {
          color: #c00;
        }

        .positive {
          color: #0c0;
        }

        .tx-status {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 12px;
          text-transform: uppercase;
        }

        .tx-status.confirmed {
          background: #d4edda;
          color: #155724;
        }

        .tx-status.pending {
          background: #fff3cd;
          color: #856404;
        }

        .tx-status.failed {
          background: #f8d7da;
          color: #721c24;
        }

        .no-transactions {
          text-align: center;
          color: #999;
          padding: 40px;
        }

        .loading {
          text-align: center;
          padding: 60px;
          color: #666;
        }
      `}</style>
        </div>
    );
};
