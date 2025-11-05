'use client';

import { useState, useEffect } from 'react';

// MetaMask type declarations
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
    google?: any;
  }
}

interface MetaMaskAccount {
  address: string;
  balance: string;
  network: string;
}

interface WithdrawalRecord {
  id: string;
  amount: number;
  currency: string;
  fiatAmount: number;
  fiatCurrency: string;
  destination: string;
  walletAddress: string;
  status: string;
  description: string;
  exchangeRate: number;
  createdAt: string;
  virtualCard?: {
    number: string;
    expiry: string;
    cvv: string;
    status: string;
    funded: boolean;
  };
  ledger?: {
    transactionId: string;
    blockHash: string;
    timestamp: string;
    status: string;
  };
}

export default function AzoraWorkspace() {
  const [metaMaskAccount, setMetaMaskAccount] = useState<MetaMaskAccount | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [description, setDescription] = useState('');

  // Connect to MetaMask
  const connectMetaMask = async () => {
    if (!window.ethereum) {
      alert('MetaMask not detected. Please install MetaMask.');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [account, 'latest']
      });
      const network = await window.ethereum.request({ method: 'net_version' });

      setMetaMaskAccount({
        address: account,
        balance: (parseInt(balance, 16) / 1e18).toFixed(4),
        network: network === '1' ? 'Ethereum Mainnet' : `Network ${network}`
      });
    } catch (error) {
      console.error('MetaMask connection error:', error);
    }
  };

  // Handle withdrawal
  const handleWithdrawal = async () => {
    if (!withdrawalAmount || !walletAddress) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/withdraw/azr-to-google-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawalAmount),
          walletAddress,
          description: description || 'AZR Withdrawal via Azora Workspace'
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Withdrawal successful! Transaction ID: ${result.transactionId}`);
        setWithdrawals(prev => [result, ...prev]);
        setWithdrawalAmount('');
        setWalletAddress('');
        setDescription('');
      } else {
        alert(`Withdrawal failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert('Withdrawal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load withdrawal history
  useEffect(() => {
    const loadWithdrawals = async () => {
      try {
        const response = await fetch('/api/withdrawals');
        if (response.ok) {
          const data = await response.json();
          setWithdrawals(data.withdrawals || []);
        }
      } catch (error) {
        console.error('Failed to load withdrawals:', error);
      }
    };

    loadWithdrawals();
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] overflow-x-hidden">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="azora-card mb-8 text-center p-8">
          <h1 className="azora-logo mb-4">Azora OS</h1>
          <p className="text-[hsl(var(--muted-foreground))]">GitHub Workspace • Dark Mode • AI-Powered</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* G20 Prep */}
          <div className="azora-card">
            <div className="azora-header">G20 Preparation</div>
            <div className="azora-value">92%</div>
            <div className="azora-progress-circle">
              <span>92%</span>
            </div>
            <div className="azora-label">Policy Alignment Complete</div>
          </div>

          {/* Meetings */}
          <div className="azora-card">
            <div className="azora-header">Meetings Held</div>
            <div className="azora-value">15</div>
            <div className="azora-label">This Month</div>
          </div>

          {/* AZR Escrow */}
          <div className="azora-card text-center">
            <div className="azora-header">AZR Escrow</div>
            <div className="azora-protea"></div>
            <div className="azora-value text-xl">125.75 AZR</div>
            <div className="azora-label">Proof-of-Knowledge Rewards</div>
          </div>

          {/* Ky Performance */}
          <div className="azora-card md:col-span-2">
            <div className="azora-header">Ky Performance (Sapiens)</div>
            <div className="azora-value">67%</div>
            <div className="azora-chart-line"></div>
            <div className="azora-wave"></div>
            <div className="azora-label">AI Model Accuracy • Real-time</div>
          </div>

          {/* Elara Voss Insights */}
          <div className="azora-card">
            <div className="azora-header">Elara Voss Insights</div>
            <div className="azora-chart-line" style={{background: 'url(\'data:image/svg+xml;utf8,<svg viewBox="0 0 200 80"><path d="M0,40 Q50,20 100,40 T200,40" stroke="%23FF6B35" stroke-width="3" fill="none" opacity="0.6"/></svg>\') center/contain no-repeat'}}></div>
            <div className="azora-label">Ethical AI Sentiment • +12%</div>
          </div>

          {/* Economic Velocity */}
          <div className="azora-card">
            <div className="azora-header">Economic Velocity</div>
            <div className="azora-chart-line" style={{background: 'linear-gradient(90deg, transparent 0%, hsl(var(--primary)) 30%, transparent 100%), url(\'data:image/svg+xml;utf8,<svg viewBox="0 0 200 100"><path d="M0,80 Q50,60 100,40 T200,20" stroke="%2300D9FF" stroke-width="4" fill="none"/>\') center/contain no-repeat'}}></div>
            <div className="azora-label">AZR/s • 1,240</div>
          </div>

          {/* Proof-of-Knowledge Stream */}
          <div className="azora-card md:col-span-2">
            <div className="azora-header">Proof-of-Knowledge Reward Stream</div>
            <div className="flex justify-around my-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] rounded-full azora-pulse"></div>
              <div className="w-9 h-9 bg-gradient-to-br from-[hsl(var(--primary))] to-blue-400 rounded-full azora-pulse" style={{animationDelay: '0.3s'}}></div>
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] rounded-full azora-pulse" style={{animationDelay: '0.6s'}}></div>
              <div className="w-8 h-8 bg-gradient-to-br from-[hsl(var(--primary))] to-blue-400 rounded-full azora-pulse" style={{animationDelay: '0.9s'}}></div>
            </div>
            <button className="azora-btn w-full mt-4">Claim Rewards</button>
          </div>

          {/* AI Integration Panel */}
          <div className="azora-card lg:col-span-3 text-center p-8">
            <h2 className="azora-logo text-2xl mb-4">AI Integration: Grok Fast + Azora OS</h2>
            <p className="mb-4 text-[hsl(var(--muted-foreground))]">Real-time code execution • Ethical AI • Proof-of-Knowledge</p>
            <button className="azora-btn">Open in GitHub Workspace</button>
          </div>
        </div>

        {/* Withdrawal Section */}
        <div className="azora-card p-6">
          <h3 className="azora-header mb-4">AZR Withdrawal System</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="block azora-label mb-2">Withdrawal Amount (AZR)</label>
                <input
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  className="w-full p-3 bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))]"
                  placeholder="1000"
                />
              </div>
              <div className="mb-4">
                <label className="block azora-label mb-2">Wallet Address</label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full p-3 bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))]"
                  placeholder="your@email.com or wallet address"
                />
              </div>
              <div className="mb-4">
                <label className="block azora-label mb-2">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))]"
                  placeholder="Purpose of withdrawal"
                />
              </div>
              <button
                onClick={handleWithdrawal}
                disabled={loading}
                className="azora-btn w-full"
              >
                {loading ? 'Processing...' : 'Withdraw AZR'}
              </button>
            </div>

            <div>
              <h4 className="azora-header mb-4">MetaMask Connection</h4>
              {!metaMaskAccount ? (
                <button onClick={connectMetaMask} className="azora-btn w-full">
                  Connect MetaMask
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="azora-label">Address: {metaMaskAccount.address.slice(0, 10)}...</p>
                  <p className="azora-label">Balance: {metaMaskAccount.balance} ETH</p>
                  <p className="azora-label">Network: {metaMaskAccount.network}</p>
                </div>
              )}
            </div>
          </div>

          {/* Withdrawal History */}
          <div className="mt-6">
            <h4 className="azora-header mb-4">Recent Withdrawals</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {withdrawals.slice(0, 5).map((withdrawal) => (
                <div key={withdrawal.id} className="p-3 bg-[hsl(var(--muted))] rounded-lg">
                  <div className="flex justify-between">
                    <span className="font-medium">{withdrawal.amount} AZR</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      withdrawal.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      withdrawal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {withdrawal.status}
                    </span>
                  </div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">{withdrawal.description}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{new Date(withdrawal.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}