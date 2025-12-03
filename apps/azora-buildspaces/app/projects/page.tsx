'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '../../components/AppLayout';
import { AccessibleCard, GradientText, Button } from '../../components';

export default function ProjectsPage() {
    const projects = [
        { id: 1, name: 'DeFi Lending Protocol', status: 'active', type: 'Smart Contract', lastUpdated: '2 hours ago', members: 4 },
        { id: 2, name: 'Education DAO', status: 'development', type: 'Full Stack', lastUpdated: '1 day ago', members: 6 },
        { id: 3, name: 'NFT Marketplace UI', status: 'testing', type: 'Frontend', lastUpdated: '3 days ago', members: 2 }
    ];

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button size="sm">New Project</Button>
                    <Button variant="outline" size="sm">Import</Button>
                </div>
            }
        >
            <div className="max-w-7xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>My Projects</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Manage your decentralized applications</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <AccessibleCard className="glass-card p-6 hover:shadow-lg transition-shadow cursor-pointer">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-lg bg-primary/10 text-2xl`}>
                                        {project.type === 'Smart Contract' ? '⛓️' : project.type === 'Frontend' ? '🎨' : '🚀'}
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs ${project.status === 'active' ? 'bg-green-500/10 text-green-500' :
                                            project.status === 'development' ? 'bg-blue-500/10 text-blue-500' :
                                                'bg-yellow-500/10 text-yellow-500'
                                        }`}>
                                        {project.status}
                                    </span>
                                </div>
                                <h3 className="font-bold text-xl mb-1">{project.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{project.type}</p>

                                <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-4">
                                    <span>Updated {project.lastUpdated}</span>
                                    <div className="flex -space-x-2">
                                        {[...Array(project.members)].map((_, i) => (
                                            <div key={i} className="w-6 h-6 rounded-full bg-gray-300 border-2 border-card" />
                                        ))}
                                    </div>
                                </div>
                            </AccessibleCard>
                        </motion.div>
                    ))}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <button className="w-full h-full min-h-[200px] rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                            <span className="text-4xl mb-2">+</span>
                            <span className="font-semibold">Create New Project</span>
                        </button>
                    </motion.div>
                </div>

                <AccessibleCard className="glass-card p-6 mt-8">
                    <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                    <p className="text-sm text-muted-foreground">
                        "I am because we are." Build open source, share your innovations, and contribute to the collective technological advancement of Azora.
                    </p>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
