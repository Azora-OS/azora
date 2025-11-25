'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Lightbulb, TrendingUp, Download } from 'lucide-react';

export default function InsightDetailPage() {
    const router = useRouter();

    const insight = {
        title: 'Revenue Growth Opportunity',
        category: 'Revenue',
        priority: 'high',
        impact: '+$45K/month',
        confidence: 87,
        date: '2 hours ago',
        description: 'Analysis shows 23% of customers are ready to upgrade to premium tier. Targeted campaign could generate $45K additional monthly revenue.',
        analysis: 'Our machine learning model analyzed customer behavior patterns over the past 90 days, identifying key signals that indicate upgrade readiness: increased feature usage (+45%), support ticket reduction (-30%), and positive NPS scores (9+). These customers represent a high-value segment with low churn risk.',
        recommendations: [
            { title: 'Create personalized upgrade offers', impact: 'High', effort: 'Medium', timeline: '1 week' },
            { title: 'Highlight premium features in email campaign', impact: 'High', effort: 'Low', timeline: '3 days' },
            { title: 'Offer limited-time discount (15% off first 3 months)', impact: 'Medium', effort: 'Low', timeline: '1 day' },
        ],
        metrics: [
            { label: 'Potential Revenue', value: '$45K/month', change: '+12%' },
            { label: 'Target Customers', value: '234', change: '+23%' },
            { label: 'Conversion Rate', value: '18%', change: '+5%' },
            { label: 'Expected ROI', value: '450%', change: '+120%' },
        ]
    };

    return (
        <AppLayout appName="Azora Oracle" userName="Business Leader">
            <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Button variant="outline" onClick={() => router.push('/insights')} className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Insights
                    </Button>
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-bold">
                                    <GradientText>{insight.title}</GradientText>
                                </h1>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400">
                                    {insight.priority} priority
                                </span>
                            </div>
                            <p className="text-gray-400">{insight.date}</p>
                        </div>
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {insight.metrics.map((metric, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}>
                            <AccessibleCard className="p-6">
                                <div className="text-gray-400 text-sm mb-1">{metric.label}</div>
                                <div className="text-2xl font-bold text-primary">{metric.value}</div>
                                <div className="text-green-400 text-sm mt-1">{metric.change}</div>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <AccessibleCard className="p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="h-6 w-6 text-blue-400" />
                            <h2 className="text-2xl font-bold">AI Analysis</h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed mb-6">{insight.analysis}</p>
                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-5 w-5 text-blue-400" />
                                <span className="font-bold">Confidence Score: {insight.confidence}%</span>
                            </div>
                            <p className="text-sm text-gray-400">Based on 90 days of customer behavior data and market trends</p>
                        </div>
                    </AccessibleCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <AccessibleCard className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Lightbulb className="h-6 w-6 text-yellow-400" />
                            <h2 className="text-2xl font-bold">Recommended Actions</h2>
                        </div>
                        <div className="space-y-4">
                            {insight.recommendations.map((rec, i) => (
                                <div key={i} className="p-6 rounded-xl bg-card/30 border border-border">
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="text-lg font-bold">{rec.title}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${rec.impact === 'High' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {rec.impact} Impact
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-gray-400">Effort</div>
                                            <div className="font-bold">{rec.effort}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400">Timeline</div>
                                            <div className="font-bold">{rec.timeline}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="primary" className="w-full mt-6">
                            Create Action Plan
                        </Button>
                    </AccessibleCard>
                </motion.div>
            </div>
        </AppLayout>
    );
}
