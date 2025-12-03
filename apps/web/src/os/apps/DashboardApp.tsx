import React from 'react';
import { TrendingUp, BookOpen, Briefcase, Coins, Award, Users, Activity, Zap } from 'lucide-react';
import {
    useWalletQuery,
    useEnrollmentsQuery,
    useApplicationsQuery,
    useDashboardOverviewQuery
} from '@azora/api-client/react-query-hooks';

export const DashboardApp: React.FC = () => {
    // Fetch data using React Query hooks
    const { data: walletData, isLoading: isWalletLoading } = useWalletQuery('current-user');
    const { data: enrollmentsData, isLoading: isEnrollmentsLoading } = useEnrollmentsQuery();
    const { data: applicationsData, isLoading: isApplicationsLoading } = useApplicationsQuery();
    const { data: overviewData, isLoading: isOverviewLoading } = useDashboardOverviewQuery();

    const loading = isWalletLoading || isEnrollmentsLoading || isApplicationsLoading || isOverviewLoading;

    // Compute stats from fetched data
    const stats = {
        tokenBalance: walletData?.data?.balance || 0,
        tokensEarned: walletData?.data?.earned || 0,
        coursesCompleted: enrollmentsData?.data?.filter((e: any) => e.progress === 100).length || 0,
        coursesInProgress: enrollmentsData?.data?.filter((e: any) => e.progress > 0 && e.progress < 100).length || 0,
        jobsApplied: applicationsData?.data?.length || 0,
        leaderboardRank: overviewData?.data?.rank || 0,
        studySpaces: 0
    };


    const StatCard: React.FC<{
        icon: React.ReactNode;
        title: string;
        value: string | number;
        subtitle: string;
        color: string;
        trend?: string;
    }> = ({ icon, title, value, subtitle, color, trend }) => (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200 group">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${color}-500/20 text-${color}-400 group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-green-400 text-sm">
                        <TrendingUp size={14} />
                        <span>{trend}</span>
                    </div>
                )}
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
            <p className="text-sm text-white/60 mb-1">{title}</p>
            <p className="text-xs text-white/40">{subtitle}</p>
        </div>
    );

    const QuickAction: React.FC<{
        icon: React.ReactNode;
        title: string;
        description: string;
        onClick: () => void;
    }> = ({ icon, title, description, onClick }) => (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-200 text-left group"
        >
            <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
                <p className="text-xs text-white/40">{description}</p>
            </div>
        </button>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Activity className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                    <p className="text-white/60">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-6 bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-900">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back! 👋</h1>
                <p className="text-white/60">Here's what's happening with your learning journey</p>
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
                    <p className="text-sm text-white/80 italic">"Ngiyakwazi ngoba sikwazi" - I can because we can</p>
                    <p className="text-xs text-white/40 mt-1">Ubuntu Philosophy</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon={<Coins size={24} />}
                    title="AZR Balance"
                    value={`${stats.tokenBalance.toFixed(2)} AZR`}
                    subtitle={`${stats.tokensEarned.toFixed(2)} earned total`}
                    color="yellow"
                    trend="+12%"
                />
                <StatCard
                    icon={<BookOpen size={24} />}
                    title="Courses"
                    value={stats.coursesCompleted}
                    subtitle={`${stats.coursesInProgress} in progress`}
                    color="blue"
                />
                <StatCard
                    icon={<Briefcase size={24} />}
                    title="Job Applications"
                    value={stats.jobsApplied}
                    subtitle="Active applications"
                    color="green"
                />
                <StatCard
                    icon={<Award size={24} />}
                    title="Leaderboard"
                    value={`#${stats.leaderboardRank}`}
                    subtitle="Global ranking"
                    color="purple"
                    trend="+5"
                />
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <QuickAction
                        icon={<BookOpen size={20} />}
                        title="Continue Learning"
                        description="Resume your current courses"
                        onClick={() => console.log('Open Learn app')}
                    />
                    <QuickAction
                        icon={<Briefcase size={20} />}
                        title="Find Jobs"
                        description="Browse job opportunities"
                        onClick={() => console.log('Open Forge app')}
                    />
                    <QuickAction
                        icon={<Users size={20} />}
                        title="Join Study Space"
                        description="Collaborate with peers"
                        onClick={() => console.log('Open Spaces app')}
                    />
                    <QuickAction
                        icon={<Coins size={20} />}
                        title="Manage Wallet"
                        description="View tokens and transactions"
                        onClick={() => console.log('Open Mint app')}
                    />
                </div>
            </div>

            {/* Recent Activity */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="space-y-4">
                        <ActivityItem
                            icon={<Coins size={16} className="text-yellow-400" />}
                            title="Earned 10 AZR"
                            description="Completed Python Fundamentals course"
                            time="2 hours ago"
                        />
                        <ActivityItem
                            icon={<BookOpen size={16} className="text-blue-400" />}
                            title="Started new course"
                            description="Advanced React Patterns"
                            time="1 day ago"
                        />
                        <ActivityItem
                            icon={<Briefcase size={16} className="text-green-400" />}
                            title="Applied to job"
                            description="Senior Frontend Developer at TechCorp"
                            time="2 days ago"
                        />
                        <ActivityItem
                            icon={<Users size={16} className="text-purple-400" />}
                            title="Joined study space"
                            description="JavaScript Mastery Group"
                            time="3 days ago"
                        />
                    </div>
                </div>
            </div>

            {/* System Status */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">System Status</h2>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-white/80">All systems operational</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/40">
                            <Zap size={14} />
                            <span>99.9% uptime</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActivityItem: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    time: string;
}> = ({ icon, title, description, time }) => (
    <div className="flex items-start gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0">
        <div className="p-2 bg-white/5 rounded-lg mt-1">
            {icon}
        </div>
        <div className="flex-1">
            <h4 className="text-sm font-medium text-white mb-1">{title}</h4>
            <p className="text-xs text-white/40">{description}</p>
        </div>
        <span className="text-xs text-white/30">{time}</span>
    </div>
);
