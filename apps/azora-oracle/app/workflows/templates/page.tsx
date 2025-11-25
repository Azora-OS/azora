'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Zap } from 'lucide-react';

export default function WorkflowTemplatesPage() {
    const router = useRouter();

    const templates = [
        { id: 1, name: 'Customer Onboarding', description: 'Automate welcome emails and account setup', uses: 1234, category: 'Sales' },
        { id: 2, name: 'Lead Nurturing', description: 'Drip campaign for new leads', uses: 892, category: 'Marketing' },
        { id: 3, name: 'Invoice Processing', description: 'Extract and validate invoice data', uses: 756, category: 'Finance' },
        { id: 4, name: 'Support Ticket Routing', description: 'Auto-assign tickets to teams', uses: 645, category: 'Support' },
    ];

    return (
        <AppLayout appName="Azora Oracle" userName="Business Leader">
            <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Button variant="outline" onClick={() => router.push('/workflows')} className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Workflows
                    </Button>
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Workflow Templates</GradientText>
                    </h1>
                    <p className="text-gray-400">Pre-built workflows to get started quickly</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {templates.map((template, i) => (
                        <motion.div key={template.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}>
                            <AccessibleCard className="p-6 hover:border-primary/50 transition-all cursor-pointer">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                                        <p className="text-gray-400 text-sm mb-3">{template.description}</p>
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400">
                                            {template.category}
                                        </span>
                                    </div>
                                    <Zap className="h-6 w-6 text-yellow-400" />
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <div className="text-sm text-gray-400">{template.uses.toLocaleString()} uses</div>
                                    <Button variant="outline" size="sm">
                                        <Copy className="h-4 w-4 mr-2" />
                                        Use Template
                                    </Button>
                                </div>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
