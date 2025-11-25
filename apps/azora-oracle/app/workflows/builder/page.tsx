'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Play, Mail, Database, Zap } from 'lucide-react';

export default function WorkflowBuilderPage() {
    const router = useRouter();

    const triggers = [
        { id: 1, name: 'New Customer Signup', icon: Mail, color: 'blue' },
        { id: 2, name: 'Form Submission', icon: Database, color: 'green' },
        { id: 3, name: 'Email Opened', icon: Mail, color: 'purple' },
    ];

    const actions = [
        { id: 1, name: 'Send Email', icon: Mail, color: 'blue' },
        { id: 2, name: 'Update Database', icon: Database, color: 'green' },
        { id: 3, name: 'Trigger Webhook', icon: Zap, color: 'yellow' },
    ];

    return (
        <AppLayout appName="Azora Oracle" userName="Business Leader">
            <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Button variant="outline" onClick={() => router.push('/workflows')} className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Workflows
                    </Button>
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Workflow Builder</GradientText>
                    </h1>
                    <p className="text-gray-400">Create automated workflows with drag-and-drop</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1 space-y-4">
                        <AccessibleCard className="p-4">
                            <h3 className="font-bold mb-4">Triggers</h3>
                            <div className="space-y-2">
                                {triggers.map(trigger => {
                                    const Icon = trigger.icon;
                                    return (
                                        <div key={trigger.id} className="p-3 rounded-lg bg-card/30 border border-border cursor-move hover:border-primary/50 transition-all">
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4 text-primary" />
                                                <span className="text-sm font-bold">{trigger.name}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </AccessibleCard>

                        <AccessibleCard className="p-4">
                            <h3 className="font-bold mb-4">Actions</h3>
                            <div className="space-y-2">
                                {actions.map(action => {
                                    const Icon = action.icon;
                                    return (
                                        <div key={action.id} className="p-3 rounded-lg bg-card/30 border border-border cursor-move hover:border-primary/50 transition-all">
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4 text-primary" />
                                                <span className="text-sm font-bold">{action.name}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </AccessibleCard>
                    </div>

                    <div className="lg:col-span-3">
                        <AccessibleCard className="p-8 min-h-[600px]">
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <Plus className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold mb-2">Drag & Drop to Build</h3>
                                    <p className="text-gray-400">Drag triggers and actions here to create your workflow</p>
                                </div>
                            </div>
                        </AccessibleCard>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button variant="outline" className="flex-1">Save Draft</Button>
                    <Button variant="primary" className="flex-1">
                        <Play className="h-4 w-4 mr-2" />
                        Test Workflow
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
