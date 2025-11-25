'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Workflow, Play, Pause, Settings, Plus, Clock, CheckCircle } from 'lucide-react';

export default function WorkflowsPage() {
    const router = useRouter();

    const workflows = [
        {
            id: 1,
            name: 'Customer Onboarding Automation',
            description: 'Automatically send welcome emails, create accounts, and schedule follow-ups',
            status: 'active',
            runs: 234,
            successRate: 98,
            lastRun: '5 min ago',
            triggers: ['New customer signup'],
            actions: ['Send welcome email', 'Create CRM record', 'Schedule follow-up']
        },
        {
            id: 2,
            name: 'Invoice Processing',
            description: 'Extract data from invoices, validate, and update accounting system',
            status: 'active',
            runs: 1247,
            successRate: 95,
            lastRun: '1 hour ago',
            triggers: ['New invoice received'],
            actions: ['Extract data', 'Validate amounts', 'Update QuickBooks']
        },
        {
            id: 3,
            name: 'Lead Scoring & Routing',
            description: 'Score leads based on behavior and route to appropriate sales rep',
            status: 'paused',
            runs: 567,
            successRate: 92,
            lastRun: '2 days ago',
            triggers: ['Form submission', 'Email engagement'],
            actions: ['Calculate score', 'Assign to rep', 'Send notification']
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
                            <GradientText>Workflows</GradientText>
                        </h1>
                        <p className="text-gray-400">Automate business processes with AI</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="primary">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Workflow
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/')}>
                            Back to Dashboard
                        </Button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <AccessibleCard className="p-6 border-green-500/50">
                            <div className="text-gray-400 text-sm mb-1">Active Workflows</div>
                            <div className="text-3xl font-bold text-green-400">{workflows.filter(w => w.status === 'active').length}</div>
                        </AccessibleCard>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <AccessibleCard className="p-6 border-blue-500/50">
                            <div className="text-gray-400 text-sm mb-1">Total Runs (30 days)</div>
                            <div className="text-3xl font-bold text-blue-400">{workflows.reduce((sum, w) => sum + w.runs, 0).toLocaleString()}</div>
                        </AccessibleCard>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <AccessibleCard className="p-6 border-purple-500/50">
                            <div className="text-gray-400 text-sm mb-1">Avg Success Rate</div>
                            <div className="text-3xl font-bold text-purple-400">
                                {Math.round(workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length)}%
                            </div>
                        </AccessibleCard>
                    </motion.div>
                </div>

                <div className="space-y-4">
                    {workflows.map((workflow, index) => (
                        <motion.div
                            key={workflow.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 + (index * 0.1) }}
                        >
                            <AccessibleCard className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`p-3 rounded-xl ${workflow.status === 'active' ? 'bg-green-500/20' : 'bg-gray-500/20'
                                            }`}>
                                            <Workflow className={`h-6 w-6 ${workflow.status === 'active' ? 'text-green-400' : 'text-gray-400'
                                                }`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold">{workflow.name}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${workflow.status === 'active'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    {workflow.status}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-sm mb-4">{workflow.description}</p>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <div className="text-gray-400 mb-1">Triggers</div>
                                                    {workflow.triggers.map((trigger, i) => (
                                                        <div key={i} className="text-gray-300">• {trigger}</div>
                                                    ))}
                                                </div>
                                                <div>
                                                    <div className="text-gray-400 mb-1">Actions</div>
                                                    {workflow.actions.map((action, i) => (
                                                        <div key={i} className="text-gray-300">• {action}</div>
                                                    ))}
                                                </div>
                                                <div>
                                                    <div className="text-gray-400 mb-1">Stats</div>
                                                    <div className="text-gray-300">Runs: {workflow.runs}</div>
                                                    <div className="text-green-400">Success: {workflow.successRate}%</div>
                                                    <div className="text-gray-400 text-xs mt-1">
                                                        <Clock className="h-3 w-3 inline mr-1" />
                                                        {workflow.lastRun}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                        <Button variant={workflow.status === 'active' ? 'outline' : 'primary'} size="sm">
                                            {workflow.status === 'active' ? (
                                                <><Pause className="h-4 w-4 mr-1" /> Pause</>
                                            ) : (
                                                <><Play className="h-4 w-4 mr-1" /> Start</>
                                            )}
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
