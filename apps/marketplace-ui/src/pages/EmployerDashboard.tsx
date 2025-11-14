import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';

interface DashboardStats {
  activeJobs: number;
  totalApplications: number;
  shortlistedCandidates: number;
  hiredCandidates: number;
  averageMatchScore: number;
  responseRate: number;
}

interface RecentActivity {
  id: string;
  type: 'application' | 'hire' | 'job_posted' | 'shortlist';
  message: string;
  timestamp: string;
  jobTitle?: string;
  candidateName?: string;
}

const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    totalApplications: 0,
    shortlistedCandidates: 0,
    hiredCandidates: 0,
    averageMatchScore: 0,
    responseRate: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        fetch(`/api/employer/${user?.id}/stats`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        }),
        fetch(`/api/employer/${user?.id}/activity`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        })
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats || stats);
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.activities || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-all duration-300`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl">{icon}</span>
          <div className="text-right">
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-white/80 text-sm">{title}</p>
          </div>
        </div>
        {subtitle && (
          <p className="text-white/70 text-sm">{subtitle}</p>
        )}
      </div>
    </div>
  );

  const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
    const getActivityIcon = (type: string) => {
      switch (type) {
        case 'application': return '📝';
        case 'hire': return '🎉';
        case 'job_posted': return '📢';
        case 'shortlist': return '⭐';
        default: return '📋';
      }
    };

    const getActivityColor = (type: string) => {
      switch (type) {
        case 'application': return 'text-blue-600';
        case 'hire': return 'text-green-600';
        case 'job_posted': return 'text-purple-600';
        case 'shortlist': return 'text-yellow-600';
        default: return 'text-gray-600';
      }
    };

    return (
      <div className="flex items-start space-x-3 p-3 bg-slate-50/50 dark:bg-slate-700/50 rounded-xl hover:shadow-md transition-all">
        <span className="text-xl">{getActivityIcon(activity.type)}</span>
        <div className="flex-1">
          <p className={`text-sm font-medium ${getActivityColor(activity.type)}`}>
            {activity.message}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(activity.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          🏢 Employer Dashboard
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Your Ubuntu-powered hiring command center
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Active Jobs"
          value={stats.activeJobs}
          icon="📢"
          color="from-blue-500 to-purple-600"
          subtitle="Currently recruiting"
        />
        <StatCard
          title="Total Applications"
          value={stats.totalApplications}
          icon="📝"
          color="from-green-500 to-emerald-600"
          subtitle="Candidates interested"
        />
        <StatCard
          title="Shortlisted"
          value={stats.shortlistedCandidates}
          icon="⭐"
          color="from-yellow-500 to-orange-600"
          subtitle="Top candidates"
        />
        <StatCard
          title="Hired"
          value={stats.hiredCandidates}
          icon="🎉"
          color="from-purple-500 to-pink-600"
          subtitle="Successful placements"
        />
        <StatCard
          title="Avg AI Match"
          value={`${stats.averageMatchScore}%`}
          icon="🤖"
          color="from-indigo-500 to-blue-600"
          subtitle="Quality score"
        />
        <StatCard
          title="Response Rate"
          value={`${stats.responseRate}%`}
          icon="📊"
          color="from-teal-500 to-cyan-600"
          subtitle="Candidate engagement"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">⚡ Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl hover:shadow-lg transition-all duration-300 text-left">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Post New Job</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Create a new opportunity</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl hover:shadow-lg transition-all duration-300 text-left">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📋</span>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Review Applications</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Manage candidates</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl hover:shadow-lg transition-all duration-300 text-left">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">AI Talent Search</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Find perfect matches</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl hover:shadow-lg transition-all duration-300 text-left">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">View Analytics</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Hiring insights</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Ubuntu Impact */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">🌍 Ubuntu Impact</h3>
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">47</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Lives Impacted</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">12</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Communities Served</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">R2.3M</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Economic Impact</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">📋 Recent Activity</h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-slate-600 dark:text-slate-400">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </div>

          {/* Performance Chart */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">📈 Hiring Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">85%</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Job Fill Rate</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <p className="text-2xl font-bold text-green-600">12</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg Days to Hire</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <p className="text-2xl font-bold text-purple-600">92%</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Candidate Satisfaction</p>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <p className="text-2xl font-bold text-orange-600">4.8</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Employer Rating</p>
              </div>
            </div>
          </div>

          {/* Top Performing Jobs */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">🏆 Top Performing Jobs</h3>
            <div className="space-y-3">
              {[
                { title: 'Senior React Developer', applications: 47, matches: 94 },
                { title: 'AI/ML Engineer', applications: 32, matches: 89 },
                { title: 'Product Manager', applications: 28, matches: 87 },
                { title: 'DevOps Engineer', applications: 23, matches: 91 }
              ].map((job, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-700/50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{job.title}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{job.applications} applications</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{job.matches}%</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">AI Match</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;