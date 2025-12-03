'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function ReportsPage() {
    const reports = [
        { id: 1, name: 'Monthly Usage Summary', date: '2024-12-01', type: 'PDF' },
        { id: 2, name: 'Security Audit Log', date: '2024-11-28', type: 'CSV' },
        { id: 3, name: 'User Activity Report', date: '2024-11-25', type: 'XLSX' }
    ];

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Reports</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Generate and download system reports</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <AccessibleCard className="glass-card p-6">
                            <h2 className="text-xl font-bold mb-4">Generated Reports</h2>
                            <div className="space-y-4">
                                {reports.map((report) => (
                                    <div key={report.id} className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl">📄</div>
                                            <div>
                                                <h3 className="font-semibold">{report.name}</h3>
                                                <p className="text-sm text-muted-foreground">{report.date} • {report.type}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">Download</Button>
                                    </div>
                                ))}
                            </div>
                        </AccessibleCard>
                    </div>

                    <div className="space-y-6">
                        <AccessibleCard className="glass-card p-6">
                            <h2 className="text-xl font-bold mb-4">Generate New</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Report Type</label>
                                    <select className="w-full px-4 py-2 rounded-lg bg-card border border-border">
                                        <option>Usage Summary</option>
                                        <option>Security Audit</option>
                                        <option>Financial Statement</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Date Range</label>
                                    <select className="w-full px-4 py-2 rounded-lg bg-card border border-border">
                                        <option>Last 30 Days</option>
                                        <option>Last Quarter</option>
                                        <option>Year to Date</option>
                                    </select>
                                </div>
                                <Button className="w-full">Generate Report</Button>
                            </div>
                        </AccessibleCard>

                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-2">🤝 Ubuntu</h3>
                            <p className="text-sm text-muted-foreground">
                                Transparency in reporting builds trust and accountability within the organization.
                            </p>
                        </AccessibleCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
