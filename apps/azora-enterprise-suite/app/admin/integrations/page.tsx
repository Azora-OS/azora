'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function IntegrationsPage() {
    const integrations = [
        { id: 1, name: 'Slack', status: 'connected', description: 'Receive alerts and reports in Slack channels' },
        { id: 2, name: 'GitHub', status: 'connected', description: 'Sync repositories and deployment workflows' },
        { id: 3, name: 'Jira', status: 'disconnected', description: 'Create tickets from issue reports automatically' },
        { id: 4, name: 'Salesforce', status: 'disconnected', description: 'Sync customer data and billing information' }
    ];

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Integrations</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Connect your favorite tools</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {integrations.map((integration, index) => (
                        <motion.div
                            key={integration.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <AccessibleCard className="glass-card p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-card border border-border flex items-center justify-center text-2xl">
                                            🔌
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{integration.name}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${integration.status === 'connected' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
                                                }`}>
                                                {integration.status}
                                            </span>
                                        </div>
                                    </div>
                                    <Button variant={integration.status === 'connected' ? 'outline' : 'default'} size="sm">
                                        {integration.status === 'connected' ? 'Configure' : 'Connect'}
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">{integration.description}</p>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>

                <AccessibleCard className="glass-card p-6 mt-8">
                    <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                    <p className="text-sm text-muted-foreground">
                        Interoperability fosters a connected ecosystem. By integrating with other tools, we create a seamless experience that empowers collaboration across platforms.
                    </p>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
