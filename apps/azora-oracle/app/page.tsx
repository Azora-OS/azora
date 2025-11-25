'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Zap, BarChart3, Workflow, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const insights = [
    { id: 1, title: 'Revenue Opportunity', value: '+$45K', trend: '+12%', color: 'text-green-400', icon: TrendingUp },
    { id: 2, title: 'Efficiency Gain', value: '23%', trend: '+5%', color: 'text-blue-400', icon: Zap },
    { id: 3, title: 'Market Position', value: 'Top 15%', trend: '+3 ranks', color: 'text-purple-400', icon: BarChart3 },
  ];

  const recentInsights = [
    { id: 1, title: 'Customer Retention Analysis', description: 'Identified 3 key factors improving retention by 18%', time: '2 hours ago', priority: 'high' },
    { id: 2, title: 'Cost Optimization', description: 'Found $12K monthly savings in cloud infrastructure', time: '5 hours ago', priority: 'medium' },
    { id: 3, title: 'Market Trend Alert', description: 'New competitor entering market - strategic response needed', time: '1 day ago', priority: 'high' },
  ];

  return (
    <AppLayout appName="Azora Oracle" userName="Business Leader">
      <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Brain className="h-12 w-12 text-purple-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tighter">
            <GradientText>Azora Oracle</GradientText>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            AI-Powered Business Intelligence & Automation
          </p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (index * 0.05) }}
              >
                <AccessibleCard className="p-6 border-primary/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary/20">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-sm text-green-400">{insight.trend}</div>
                  </div>
                  <div className="text-gray-400 text-sm mb-1">{insight.title}</div>
                  <div className={`text-3xl font-bold ${insight.color}`}>{insight.value}</div>
                </AccessibleCard>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <AccessibleCard
              className="p-6 hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => router.push('/chat')}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <MessageSquare className="h-6 w-6 text-purple-400" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Chat</h3>
              <p className="text-gray-400 text-sm">
                Ask Oracle anything about your business
              </p>
            </AccessibleCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AccessibleCard
              className="p-6 hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => router.push('/insights')}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <Sparkles className="h-6 w-6 text-blue-400" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-2">Insights</h3>
              <p className="text-gray-400 text-sm">
                AI-generated business insights and recommendations
              </p>
            </AccessibleCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <AccessibleCard
              className="p-6 hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => router.push('/workflows')}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-green-500/20">
                  <Workflow className="h-6 w-6 text-green-400" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-2">Workflows</h3>
              <p className="text-gray-400 text-sm">
                Automate business processes with AI
              </p>
            </AccessibleCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <AccessibleCard
              className="p-6 hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => router.push('/analytics')}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-orange-500/20">
                  <BarChart3 className="h-6 w-6 text-orange-400" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-2">Analytics</h3>
              <p className="text-gray-400 text-sm">
                Predictive analytics and forecasting
              </p>
            </AccessibleCard>
          </motion.div>
        </div>

        {/* Recent Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <AccessibleCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recent AI Insights</h2>
              <Button variant="outline" onClick={() => router.push('/insights')}>
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {recentInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (index * 0.05) }}
                  className="p-4 rounded-xl bg-card/30 hover:bg-card/50 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{insight.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${insight.priority === 'high'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                          {insight.priority}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{insight.description}</p>
                    </div>
                    <div className="text-gray-500 text-xs">{insight.time}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AccessibleCard>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <AccessibleCard className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">How Oracle Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Analyze</h3>
                <p className="text-gray-400 text-sm">
                  Oracle continuously analyzes your business data, market trends, and competitor activity
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Generate Insights</h3>
                <p className="text-gray-400 text-sm">
                  AI generates actionable insights, identifies opportunities, and predicts future trends
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Workflow className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Automate</h3>
                <p className="text-gray-400 text-sm">
                  Create automated workflows to execute strategies and optimize operations
                </p>
              </div>
            </div>
          </AccessibleCard>
        </motion.div>
      </div>
    </AppLayout>
  );
}
