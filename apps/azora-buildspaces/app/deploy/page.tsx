'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, AccessibleCard, GradientText, Button } from '../../components';

export default function DeployPage() {
    const [isDeploying, setIsDeploying] = useState(false);

    const handleDeploy = async () => {
        setIsDeploying(true);
        // Simulate deployment process
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsDeploying(false);
    };

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Deployments</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Ship your applications to the Azora Network</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <AccessibleCard className="glass-card p-6">
                            <h2 className="text-xl font-bold mb-4">Active Deployments</h2>
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-card border border-border">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold">DeFi Lending Protocol</h3>
                                        <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs">Live</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>v1.2.0</span>
                                        <span>Deployed 2h ago</span>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <Button variant="outline" size="sm" className="text-xs">View Logs</Button>
                                        <Button variant="outline" size="sm" className="text-xs">Visit</Button>
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg bg-card border border-border">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold">Education DAO</h3>
                                        <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs">Staging</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>v0.8.5</span>
                                        <span>Deployed 1d ago</span>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <Button variant="outline" size="sm" className="text-xs">View Logs</Button>
                                        <Button variant="outline" size="sm" className="text-xs">Promote</Button>
                                    </div>
                                </div>
                            </div>
                        </AccessibleCard>

                        <AccessibleCard className="glass-card p-6">
                            <h2 className="text-xl font-bold mb-4">New Deployment</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Select Project</label>
                                    <select className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                                        <option>DeFi Lending Protocol</option>
                                        <option>Education DAO</option>
                                        <option>NFT Marketplace UI</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Environment</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="env" defaultChecked /> Production
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="env" /> Staging
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="env" /> Dev
                                        </label>
                                    </div>
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={handleDeploy}
                                    disabled={isDeploying}
                                >
                                    {isDeploying ? 'Deploying...' : '🚀 Deploy Now'}
                                </Button>
                            </div>
                        </AccessibleCard>
                    </div>

                    <div className="space-y-6">
                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-4">Resources</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Compute</span>
                                        <span>45%</span>
                                    </div>
                                    <div className="h-2 bg-card rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: '45%' }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Storage</span>
                                        <span>23%</span>
                                    </div>
                                    <div className="h-2 bg-card rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500" style={{ width: '23%' }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Bandwidth</span>
                                        <span>12%</span>
                                    </div>
                                    <div className="h-2 bg-card rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-500" style={{ width: '12%' }} />
                                    </div>
                                </div>
                            </div>
                        </AccessibleCard>

                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-2">🤝 Ubuntu</h3>
                            <p className="text-sm text-muted-foreground">
                                Responsible resource usage ensures availability for everyone. Our decentralized infrastructure is shared by the community.
                            </p>
                        </AccessibleCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
