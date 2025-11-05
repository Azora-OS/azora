/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 💰 AZORA PAY - UI
 * 
 * "For the worker deserves his wages." - 1 Timothy 5:18
 */

'use client';

import React, { useState } from 'react';
import { Wallet, Send, TrendingUp, Shield, Globe, Zap, Heart } from 'lucide-react';

export default function AzoraPayPage() {
  const [activeTab, setActiveTab] = useState<'wallet' | 'send' | 'receive' | 'exchange'>('wallet');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a]">
      {/* Header */}
      <header className="border-b border-[#FFD700]/30 bg-black/20 backdrop-blur-2xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#33ff92] to-[#00c2ff] flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Azora Pay</h1>
                <p className="text-sm text-[#87CEEB]">Financial Freedom for All</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-full bg-[#33ff92]/20 border border-[#33ff92]/30">
                <span className="text-sm text-[#33ff92] font-semibold">✓ Verified</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Balance Card */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative p-8 rounded-3xl bg-gradient-to-br from-[#8a2aff]/20 to-[#00c2ff]/20 border border-[#FFD700]/30 backdrop-blur-xl overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full"
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0, 194, 255, 0.3) 0%, transparent 50%)`
                }}
              />
            </div>

            <div className="relative">
              <p className="text-[#87CEEB] mb-2">Total Balance</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold text-white">$0.00</span>
                <span className="text-xl text-[#33ff92]">USD</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-[#87CEEB] mb-1">Crypto</p>
                  <p className="text-lg font-bold text-white">$0.00</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-[#87CEEB] mb-1">Mobile Money</p>
                  <p className="text-lg font-bold text-white">$0.00</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-[#87CEEB] mb-1">Learning Credits</p>
                  <p className="text-lg font-bold text-[#33ff92]">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex gap-4 p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            {[
              { id: 'wallet', label: 'Wallet', icon: Wallet },
              { id: 'send', label: 'Send', icon: Send },
              { id: 'receive', label: 'Receive', icon: TrendingUp },
              { id: 'exchange', label: 'Exchange', icon: Globe },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#33ff92] to-[#00c2ff] text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'wallet' && <WalletTab />}
          {activeTab === 'send' && <SendTab />}
          {activeTab === 'receive' && <ReceiveTab />}
          {activeTab === 'exchange' && <ExchangeTab />}
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Azora Pay?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'No Minimums',
                description: 'Send $0.01 or $1M. We serve everyone, especially the poor.',
                color: 'from-[#33ff92] to-[#00c2ff]',
              },
              {
                icon: Zap,
                title: 'Instant',
                description: 'Crypto transactions in seconds. Mobile money in minutes.',
                color: 'from-[#00c2ff] to-[#8a2aff]',
              },
              {
                icon: Globe,
                title: 'Global',
                description: '195 countries. 50+ currencies. Works everywhere.',
                color: 'from-[#8a2aff] to-[#ff6b9d]',
              },
              {
                icon: Heart,
                title: 'Fair Fees',
                description: '0.1% transaction fee. NO hidden charges. Transparent.',
                color: 'from-[#ff6b9d] to-[#FFD700]',
              },
              {
                icon: Wallet,
                title: 'Learn & Earn',
                description: 'Earn credits by learning. Convert to real money.',
                color: 'from-[#FFD700] to-[#33ff92]',
              },
              {
                icon: Shield,
                title: 'Constitutional',
                description: 'Every transaction validated against Ten Commandments.',
                color: 'from-[#33ff92] to-[#8a2aff]',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:scale-105 transition-transform"
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-[#87CEEB]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Biblical Foundation */}
        <div className="max-w-4xl mx-auto mt-16 p-8 rounded-3xl bg-gradient-to-br from-[#FFD700]/20 to-[#8a2aff]/20 border border-[#FFD700]/30 backdrop-blur-xl">
          <div className="text-center">
            <p className="text-2xl text-[#FFD700] italic font-semibold mb-4">
              "For the worker deserves his wages."
            </p>
            <p className="text-lg text-[#87CEEB]">- 1 Timothy 5:18</p>
            <p className="mt-6 text-white/80 max-w-2xl mx-auto">
              Financial freedom is a basic human right. Azora Pay exists to serve the <span className="text-[#33ff92] font-bold">4 billion unbanked</span>, 
              not to extract profit from the poor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wallet Tab
function WalletTab() {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <h3 className="text-xl font-bold text-white mb-4">Payment Methods</h3>
        
        <div className="space-y-4">
          {[
            { type: 'Crypto Wallet', status: 'Not Connected', color: 'text-white/50' },
            { type: 'Mobile Money', status: 'Not Connected', color: 'text-white/50' },
            { type: 'Bank Account', status: 'Not Connected', color: 'text-white/50' },
            { type: 'Learning Credits', status: 'Active', color: 'text-[#33ff92]' },
          ].map((method, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div>
                <p className="text-white font-semibold">{method.type}</p>
                <p className={`text-sm ${method.color}`}>{method.status}</p>
              </div>
              <button className="px-4 py-2 rounded-full bg-gradient-to-r from-[#33ff92] to-[#00c2ff] text-white font-semibold hover:scale-105 transition-transform">
                {method.status === 'Active' ? 'Manage' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Send Tab
function SendTab() {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
      <h3 className="text-xl font-bold text-white mb-6">Send Money</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-[#87CEEB] mb-2">Recipient</label>
          <input
            type="text"
            placeholder="Phone, email, or wallet address"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#33ff92]"
          />
        </div>

        <div>
          <label className="block text-sm text-[#87CEEB] mb-2">Amount</label>
          <input
            type="number"
            placeholder="0.00"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#33ff92]"
          />
        </div>

        <div>
          <label className="block text-sm text-[#87CEEB] mb-2">Currency</label>
          <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#33ff92]">
            <option>USD</option>
            <option>BTC</option>
            <option>ETH</option>
            <option>USDC</option>
          </select>
        </div>

        <button className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#33ff92] to-[#00c2ff] text-white font-bold text-lg hover:scale-105 transition-transform">
          Send Payment
        </button>

        <p className="text-center text-sm text-white/50">
          Fee: 0.1% • No minimum amount
        </p>
      </div>
    </div>
  );
}

// Receive Tab
function ReceiveTab() {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-center">
      <h3 className="text-xl font-bold text-white mb-6">Receive Money</h3>
      
      <div className="max-w-sm mx-auto space-y-6">
        <div className="w-64 h-64 mx-auto rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
          <p className="text-white/50">QR Code</p>
        </div>

        <div>
          <p className="text-sm text-[#87CEEB] mb-2">Your Wallet Address</p>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white font-mono text-sm break-all">
              0x1234...5678
            </p>
          </div>
        </div>

        <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#33ff92] to-[#00c2ff] text-white font-semibold hover:scale-105 transition-transform">
          Copy Address
        </button>
      </div>
    </div>
  );
}

// Exchange Tab
function ExchangeTab() {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
      <h3 className="text-xl font-bold text-white mb-6">Exchange Currency</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-[#87CEEB] mb-2">From</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="0.00"
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#33ff92]"
            />
            <select className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#33ff92]">
              <option>USD</option>
              <option>BTC</option>
              <option>ETH</option>
            </select>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#33ff92] to-[#00c2ff] flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-[#87CEEB] mb-2">To</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="0.00"
              readOnly
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30"
            />
            <select className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#33ff92]">
              <option>BTC</option>
              <option>ETH</option>
              <option>USD</option>
            </select>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[#87CEEB]">Exchange Rate</span>
            <span className="text-white font-semibold">1 BTC = $45,000</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#87CEEB]">Fee (0.1%)</span>
            <span className="text-white font-semibold">$0.00</span>
          </div>
        </div>

        <button className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#33ff92] to-[#00c2ff] text-white font-bold text-lg hover:scale-105 transition-transform">
          Exchange
        </button>
      </div>
    </div>
  );
}

