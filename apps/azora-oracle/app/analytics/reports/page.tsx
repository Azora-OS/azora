'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Filter } from 'lucide-react';

export default function AnalyticsReportsPage() {
    const router = useRouter();

    const reports = [
        { id: 1, name: 'Monthly Revenue Report', type: 'Revenue', lastRun: '2025-11-24', status: 'ready' },
        { id: 2, name: 'Customer Churn Analysis', type: 'Retention', lastRun: '2025-11-23', status: 'ready' },
        { id: 3, name: 'Marketing ROI Dashboard', type: 'Marketing', lastRun: '2025-11-22', status: 'processing' },
    ];

    return (
        <AppLayout appName="Azora Oracle" userName="Business Leader">
            <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Button variant="outline" onClick={() => router.push('/analytics')} className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Analytics
                    </Button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                <GradientText>Custom Reports</GradientText>
                            </h1>
                            <p className="text-gray-400">Build and schedule custom analytics reports</p>
                        </div>
                        <Button variant="primary">
                            <Filter className="h-4 w-4 mr-2" />
                            Create Report
                        </Button>
                    </div>
                </motion.div>

                <div className="space-y-4">
                    {reports.map((report, i) => (
                        <motion.div key={report.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}>
                            <AccessibleCard className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold mb-1">{report.name}</h3>
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <span>{report.type}</span>
                                            <span>•</span>
                                            <span>Last run: {report.lastRun}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${report.status === 'ready' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {report.status}
                                        </span>
                                        <Button variant="outline" size="sm" disabled={report.status !== 'ready'}>
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
