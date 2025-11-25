'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react';

export default function AnalyticsPage() {
    const router = useRouter();

    const metrics = [
        { label: 'Revenue', value: '$125K', change: '+12%', trend: 'up' },
        { label: 'Customers', value: '1,247', change: '+8%', trend: 'up' },
        { label: 'Churn Rate', value: '2.3%', change: '-0.5%', trend: 'down' },
        { label: 'LTV', value: '$4,250', change: '+15%', trend: 'up' }
    ];

    return (
        <AppLayout appName="Azora Oracle" userName="Business Leader">
            <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold mb-2"><GradientText>Analytics</GradientText></h1>
                            <p className="text-gray-400">Predictive analytics and forecasting</p>
                        </div>
                        <Button variant="outline" onClick={() => router.push('/')}>Back to Dashboard</Button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {metrics.map((metric, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}>
                            <AccessibleCard className="p-6">
                                <div className="text-gray-400 text-sm mb-1">{metric.label}</div>
                                <div className="text-3xl font-bold mb-2">{metric.value}</div>
                                <div className={`flex items-center gap-1 text-sm ${metric.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                                    {metric.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                    {metric.change}
                                </div>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <AccessibleCard className="p-8">
                        <h2 className="text-2xl font-bold mb-6">Revenue Forecast (Next 6 Months)</h2>
                        <div className="h-64 flex items-end justify-between gap-2">
                            {[145, 158, 172, 185, 198, 215].map((val, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full bg-gradient-to-t from-primary to-primary/50 rounded-t-lg transition-all hover:opacity-80"
                                        style={{ height: `${(val / 215) * 100}%` }}
                                    />
                                    <div className="text-sm text-gray-400">M{i + 1}</div>
                                    <div className="text-xs font-bold">${val}K</div>
                                </div>
                            ))}
                        </div>
                    </AccessibleCard>
                </motion.div>
            </div>
        </AppLayout>
    );
}
