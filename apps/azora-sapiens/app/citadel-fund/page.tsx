'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button, StatsCard } from '@azora/shared-design';
import { UbuntuServices, useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

export default function CitadelFundPage() {
  const [balance, setBalance] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const ubuntuServices = useUbuntuServices();

  useEffect(() => {
    loadCitadelData();
  }, []);

  const loadCitadelData = async () => {
    try {
      setLoading(true);
      
      // Load Citadel Fund balance
      const balanceData = await ubuntuServices.citadelFund.getCitadelBalance();
      setBalance(balanceData);

      // Load transactions
      const transactionsData = await ubuntuServices.citadelFund.getTransactions();
      setTransactions(transactionsData.transactions || []);

      // Load scholarships
      const scholarshipsData = await ubuntuServices.citadelFund.getScholarships();
      setScholarships(scholarshipsData.scholarships || []);

    } catch (error) {
      console.error('Error loading Citadel Fund data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectRevenue = async (amount: string, source: string) => {
    try {
      await ubuntuServices.citadelFund.collectRevenue(amount, source);
      
      // Refresh data
      await loadCitadelData();
      
    } catch (error) {
      console.error('Error collecting revenue:', error);
    }
  };

  const handleGrantScholarship = async (studentId: string, amount: string, reason: string) => {
    try {
      await ubuntuServices.citadelFund.grantScholarship(studentId, amount, reason);
      
      // Refresh data
      await loadCitadelData();
      
    } catch (error) {
      console.error('Error granting scholarship:', error);
    }
  };

  if (loading) {
    return (
      <AppLayout appName="Azora Sapiens" userName="Azora Citizen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading Ubuntu Citadel Fund...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout appName="Azora Sapiens" userName="Azora Citizen">
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold">
            <GradientText>Ubuntu Citadel Fund</GradientText>
          </h1>
          <p className="text-gray-400 text-lg">
            "My success enables your success" - 10% revenue sharing for community education
          </p>
        </motion.div>

        {/* Fund Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Current Balance"
            value={balance?.balance || '0'}
            subtitle="AZR tokens"
            icon="💰"
            color="from-green-500 to-emerald-500"
          />
          
          <StatsCard
            title="Total Collected"
            value={balance?.collected || '0'}
            subtitle="Lifetime revenue"
            icon="📈"
            color="from-blue-500 to-cyan-500"
          />
          
          <StatsCard
            title="Scholarships Granted"
            value={balance?.distributed || '0'}
            subtitle="Community support"
            icon="🎓"
            color="from-purple-500 to-pink-500"
          />
        </div>

        {/* Revenue Collection */}
        <AccessibleCard title="Collect Ubuntu Revenue" className="p-6">
          <div className="space-y-4">
            <p className="text-gray-400">
              Contribute 10% of your revenue to the Ubuntu Citadel Fund to support community education.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (AZR)
                </label>
                <input
                  type="number"
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="100"
                  id="revenue-amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Source
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="Course sales"
                  id="revenue-source"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    const amount = (document.getElementById('revenue-amount') as HTMLInputElement).value;
                    const source = (document.getElementById('revenue-source') as HTMLInputElement).value;
                    handleCollectRevenue(amount, source);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Collect Revenue
                </Button>
              </div>
            </div>
          </div>
        </AccessibleCard>

        {/* Scholarship Grants */}
        <AccessibleCard title="Ubuntu Scholarship Grants" className="p-6">
          <div className="space-y-4">
            <p className="text-gray-400">
              Grant scholarships to deserving Ubuntu community members for educational opportunities.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Student ID
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="student-001"
                  id="scholarship-student"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (AZR)
                </label>
                <input
                  type="number"
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="500"
                  id="scholarship-amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="Excellence in Ubuntu studies"
                  id="scholarship-reason"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    const studentId = (document.getElementById('scholarship-student') as HTMLInputElement).value;
                    const amount = (document.getElementById('scholarship-amount') as HTMLInputElement).value;
                    const reason = (document.getElementById('scholarship-reason') as HTMLInputElement).value;
                    handleGrantScholarship(studentId, amount, reason);
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Grant Scholarship
                </Button>
              </div>
            </div>
          </div>
        </AccessibleCard>

        {/* Recent Transactions */}
        <AccessibleCard title="Recent Ubuntu Transactions" className="p-6">
          <div className="space-y-2">
            {transactions.slice(0, 10).map((transaction: any, index: number) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <span className="text-white font-medium">{transaction.type}</span>
                  <p className="text-sm text-gray-400">{transaction.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">{transaction.amount} AZR</div>
                  <div className="text-sm text-gray-400">{new Date(transaction.timestamp).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
            
            {transactions.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">💰</div>
                <p className="text-gray-400">No transactions yet. Start contributing to Ubuntu education!</p>
              </div>
            )}
          </div>
        </AccessibleCard>

        {/* Recent Scholarships */}
        <AccessibleCard title="Recent Ubuntu Scholarships" className="p-6">
          <div className="space-y-2">
            {scholarships.slice(0, 10).map((scholarship: any, index: number) => (
              <div key={scholarship.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <span className="text-white font-medium">{scholarship.studentId}</span>
                  <p className="text-sm text-gray-400">{scholarship.reason}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-400">{scholarship.amount} AZR</div>
                  <div className="text-sm text-gray-400">{new Date(scholarship.grantedAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
            
            {scholarships.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎓</div>
                <p className="text-gray-400">No scholarships granted yet. Support Ubuntu learners!</p>
              </div>
            )}
          </div>
        </AccessibleCard>

        {/* Ubuntu Philosophy */}
        <AccessibleCard title="Ubuntu Philosophy in Action" className="p-6">
          <div className="space-y-4">
            <div className="p-4 bg-green-900 bg-opacity-50 rounded-lg">
              <h3 className="text-lg font-bold text-green-400 mb-2">10% Revenue Sharing</h3>
              <p className="text-gray-300">
                Every successful community member contributes 10% of their revenue to support the next generation of Ubuntu learners.
              </p>
            </div>
            <div className="p-4 bg-purple-900 bg-opacity-50 rounded-lg">
              <h3 className="text-lg font-bold text-purple-400 mb-2">Community Scholarships</h3>
              <p className="text-gray-300">
                Funds are distributed as scholarships to deserving community members, ensuring education remains accessible to all.
              </p>
            </div>
            <div className="p-4 bg-blue-900 bg-opacity-50 rounded-lg">
              <h3 className="text-lg font-bold text-blue-400 mb-2">Transparent Governance</h3>
              <p className="text-gray-300">
                All transactions and scholarship grants are publicly visible, ensuring trust and accountability in the Ubuntu ecosystem.
              </p>
            </div>
          </div>
        </AccessibleCard>
      </div>
    </AppLayout>
  );
}
