'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, Download, Filter, AlertCircle, CheckCircle } from 'lucide-react';

export default function AuditLogsPage() {
    const router = useRouter();

    const logs = [
        { id: 1, timestamp: '2025-11-25 03:30:15', level: 'info', service: 'azora-mint', message: 'User login successful', user: 'john@azora.com' },
        { id: 2, timestamp: '2025-11-25 03:28:42', level: 'warning', service: 'ai-family-service', message: 'High memory usage detected', user: 'system' },
        { id: 3, timestamp: '2025-11-25 03:25:10', level: 'error', service: 'azora-classroom', message: 'Failed to connect to database', user: 'system' },
        { id: 4, timestamp: '2025-11-25 03:20:05', level: 'info', service: 'azora-library', message: 'Resource downloaded', user: 'sarah@azora.com' },
    ];

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'error': return <AlertCircle className="h-4 w-4 text-red-400" />;
            case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-400" />;
            default: return <CheckCircle className="h-4 w-4 text-green-400" />;
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'error': return 'bg-red-500/20 text-red-400';
            case 'warning': return 'bg-yellow-500/20 text-yellow-400';
            default: return 'bg-green-500/20 text-green-400';
        }
    };

    return (
        <AppLayout appName="Azora Master" userName="System Admin">
            <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                <GradientText>Audit Logs</GradientText>
                            </h1>
                            <p className="text-gray-400">System activity and audit trail</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </Button>
                            <Button variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>
                </motion.div>

                <AccessibleCard className="p-6">
                    <div className="space-y-3">
                        {logs.map((log, i) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + (i * 0.05) }}
                                className="p-4 rounded-xl bg-card/30 border border-border"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        {getLevelIcon(log.level)}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${getLevelColor(log.level)}`}>
                                                    {log.level.toUpperCase()}
                                                </span>
                                                <span className="text-gray-400 text-sm">{log.timestamp}</span>
                                            </div>
                                            <div className="font-bold mb-1">{log.message}</div>
                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                <span>Service: {log.service}</span>
                                                <span>•</span>
                                                <span>User: {log.user}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
