'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertCircle, Lightbulb, Download } from 'lucide-react';

export default function InsightsPage() {
    const router = useRouter();

    const insights = [
        {
            id: 1,
            title: 'Revenue Growth Opportunity',
            category: 'Revenue',
            priority: 'high',
            impact: '+$45K/month',
            description: 'Analysis shows 23% of customers are ready to upgrade to premium tier. Targeted campaign could generate $45K additional monthly revenue.',
            recommendations: [
                'Create personalized upgrade offers',
                'Highlight premium features in email campaign',
                'Offer limited-time discount (15% off first 3 months)'
            ],
            confidence: 87,
            date: '2 hours ago'
        },
        {
            id: 2,
            title: 'Cost Optimization - Cloud Infrastructure',
            category: 'Cost',
            priority: 'medium',
            impact: '-$12K/month',
            description: 'Current cloud usage analysis reveals 40% of resources are underutilized during off-peak hours.',
            recommendations: [
                'Implement auto-scaling policies',
                'Move non-critical workloads to spot instances',
                'Archive old data to cheaper storage tiers'
            ],
            confidence: 92,
            date: '5 hours ago'
        },
        {
            id: 3,
            title: 'Customer Churn Risk Alert',
            category: 'Retention',
            priority: 'high',
            impact: '15 at-risk customers',
            description: 'Machine learning model identified 15 customers showing early churn signals based on usage patterns.',
            recommendations: [
                'Reach out with personalized retention offers',
                'Schedule check-in calls with account managers',
                'Provide additional training resources'
            ],
            confidence: 78,
            date: '1 day ago'
        }
    ];

    return (
        <AppLayout appName="Azora Oracle" userName="Business Leader">
            <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-4xl font-bold mb-2">
                            <GradientText>AI Insights</GradientText>
                        </h1>
                        <p className="text-gray-400">AI-generated business insights and recommendations</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/')}>
                            Back to Dashboard
                        </Button>
                    </div>
                </motion.div>

                {insights.map((insight, index) => (
                    <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + (index * 0.1) }}
                    >
                        <AccessibleCard className="p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${insight.priority === 'high' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                                        }`}>
                                        <Sparkles className={`h-6 w-6 ${insight.priority === 'high' ? 'text-red-400' : 'text-yellow-400'
                                            }`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-2xl font-bold">{insight.title}</h2>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${insight.priority === 'high'
                                                    ? 'bg-red-500/20 text-red-400'
                                                    : 'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {insight.priority} priority
                                            </span>
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400">
                                                {insight.category}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm">{insight.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-primary">{insight.impact}</div>
                                    <div className="text-gray-400 text-sm">Potential Impact</div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5 text-blue-400" />
                                        Analysis
                                    </h3>
                                    <p className="text-gray-300">{insight.description}</p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                        <Lightbulb className="h-5 w-5 text-yellow-400" />
                                        Recommendations
                                    </h3>
                                    <ul className="space-y-2">
                                        {insight.recommendations.map((rec, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-primary text-sm font-bold">{i + 1}</span>
                                                </div>
                                                <span className="text-gray-300">{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-green-400" />
                                        <span className="text-gray-400">Confidence Score:</span>
                                        <span className="font-bold text-green-400">{insight.confidence}%</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">Dismiss</Button>
                                        <Button variant="primary" size="sm">Create Action Plan</Button>
                                    </div>
                                </div>
                            </div>
                        </AccessibleCard>
                    </motion.div>
                ))}
            </div>
        </AppLayout>
    );
}
