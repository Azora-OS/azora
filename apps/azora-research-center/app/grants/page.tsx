'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, CheckCircle, Clock } from 'lucide-react';

export default function GrantsPage() {
    const router = useRouter();

    const grants = [
        { id: 1, title: 'NSF Research Grant', amount: '$500K', deadline: '2025-12-31', status: 'active', progress: 65 },
        { id: 2, title: 'NIH Biomedical Research', amount: '$750K', deadline: '2026-03-15', status: 'pending', progress: 30 },
        { id: 3, title: 'DOE Energy Research', amount: '$1.2M', deadline: '2025-11-30', status: 'submitted', progress: 100 },
    ];

    return (
        <AppLayout appName="Azora Research Center" userName="Researcher">
            <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Grant Tracking</GradientText>
                    </h1>
                    <p className="text-gray-400">Manage research grants and applications</p>
                </motion.div>

                <div className="space-y-4">
                    {grants.map((grant, i) => (
                        <motion.div key={grant.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}>
                            <AccessibleCard className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold">{grant.title}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${grant.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                    grant.status === 'submitted' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {grant.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
                                            <span className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4" />
                                                {grant.amount}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                Deadline: {grant.deadline}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="text-sm text-gray-400">Application Progress</div>
                                            <div className="text-sm font-bold text-primary">{grant.progress}%</div>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${grant.progress}%` }} />
                                        </div>
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
