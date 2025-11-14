import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '../lib/api-provider';

const Finance: React.FC = () => {
  const api = useApi();

  const { data: financialData, isLoading } = useQuery({
    queryKey: ['financial-overview'],
    queryFn: async () => {
      const response: any = await api.request('/api/analytics/financial');
      return response?.data || {
        totalRevenue: 0,
        transactionVolume: 0,
        tokenCirculation: 0,
        growthRate: 0
      };
    }
  });

  const MetricCard = ({ title, value, subtitle, icon, color }: any) => (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        <span className="text-sm text-green-600 dark:text-green-400 font-medium">+12.5%</span>
      </div>
      <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Financial Overview</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Platform revenue and token economics</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/70 dark:bg-slate-800/70 rounded-2xl p-6 animate-pulse">
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Revenue"
              value={`$${((financialData?.totalRevenue || 0) / 1000).toFixed(1)}K`}
              subtitle="All-time earnings"
              icon="💰"
              color="bg-gradient-to-r from-green-500 to-emerald-500"
            />
            <MetricCard
              title="Transaction Volume"
              value={(financialData?.transactionVolume || 0).toLocaleString()}
              subtitle="Total transactions"
              icon="📊"
              color="bg-gradient-to-r from-blue-500 to-cyan-500"
            />
            <MetricCard
              title="Token Circulation"
              value={`${((financialData?.tokenCirculation || 0) / 1000).toFixed(1)}K AZR`}
              subtitle="In circulation"
              icon="🪙"
              color="bg-gradient-to-r from-purple-500 to-pink-500"
            />
            <MetricCard
              title="Growth Rate"
              value={`${(financialData?.growthRate || 0).toFixed(1)}%`}
              subtitle="Monthly growth"
              icon="📈"
              color="bg-gradient-to-r from-orange-500 to-red-500"
            />
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Recent Transactions</h2>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
                      💳
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">Course Enrollment</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">2 minutes ago</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600 dark:text-green-400">+50 AZR</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">$25.00</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Finance;
