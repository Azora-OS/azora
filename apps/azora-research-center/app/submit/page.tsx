'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

export default function SubmitPage() {
    const [title, setTitle] = useState('');
    const [abstract, setAbstract] = useState('');
    const ubuntuServices = useUbuntuServices();

    const handleSubmit = async () => {
        await ubuntuServices.events.publishEvent('research.submit', {
            userId: 'demo-researcher-001',
            title,
            abstract,
            timestamp: new Date().toISOString()
        }, 'azora-research-center');

        alert('Research submitted for peer review! (Feature coming soon)');
    };

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" href="/research">Cancel</Button>
                    <Button size="sm" onClick={handleSubmit}>Submit</Button>
                </div>
            }
        >
            <div className="max-w-4xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Submit Research</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Contribute to the global knowledge base</p>
                </motion.div>

                <div className="space-y-6">
                    <AccessibleCard className="glass-card p-6">
                        <h2 className="text-xl font-bold mb-4">Paper Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Title *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Quantum Resistance in Blockchain Networks"
                                    className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Abstract *</label>
                                <textarea
                                    value={abstract}
                                    onChange={(e) => setAbstract(e.target.value)}
                                    placeholder="Summarize your research findings..."
                                    rows={6}
                                    className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Upload PDF *</label>
                                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                                    <div className="text-4xl mb-2">📄</div>
                                    <p className="text-sm text-muted-foreground">Click or drag to upload your paper</p>
                                </div>
                            </div>
                        </div>
                    </AccessibleCard>

                    <AccessibleCard className="glass-card p-6">
                        <h2 className="text-xl font-bold mb-4">Authors & Affiliations</h2>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Author Name"
                                    className="flex-1 px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <input
                                    type="text"
                                    placeholder="Affiliation (e.g. Azora University)"
                                    className="flex-1 px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <Button variant="outline">Add</Button>
                            </div>
                        </div>
                    </AccessibleCard>

                    <AccessibleCard className="glass-card p-6">
                        <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                        <p className="text-sm text-muted-foreground">
                            "I am because we are." Your research builds upon the work of others and lays the foundation for future discoveries. Open access ensures knowledge benefits all.
                        </p>
                    </AccessibleCard>
                </div>
            </div>
        </AppLayout>
    );
}
