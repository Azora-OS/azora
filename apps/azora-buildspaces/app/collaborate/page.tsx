'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '../../components/AppLayout';
import { AccessibleCard, GradientText, Button } from '../../components';

export default function CollaboratePage() {
    const sessions = [
        { id: 1, name: 'Smart Contract Audit', participants: ['Alex', 'Sarah', 'Mike'], active: true },
        { id: 2, name: 'UI Design Review', participants: ['Jessica', 'Tom'], active: true },
        { id: 3, name: 'Backend Architecture', participants: ['David', 'Emma', 'Chris', 'Sophie'], active: false }
    ];

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button size="sm">New Session</Button>
                    <Button variant="outline" size="sm">Join by ID</Button>
                </div>
            }
        >
            <div className="max-w-6xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Collaborate</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Real-time pair programming and team workspaces</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AccessibleCard className="glass-card p-6">
                        <h2 className="text-xl font-bold mb-4">Active Sessions</h2>
                        <div className="space-y-4">
                            {sessions.filter(s => s.active).map(session => (
                                <div key={session.id} className="p-4 rounded-lg bg-card border border-border flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold">{session.name}</h3>
                                        <p className="text-sm text-muted-foreground">{session.participants.length} participants</p>
                                    </div>
                                    <Button size="sm">Join</Button>
                                </div>
                            ))}
                        </div>
                    </AccessibleCard>

                    <AccessibleCard className="glass-card p-6">
                        <h2 className="text-xl font-bold mb-4">Recent Sessions</h2>
                        <div className="space-y-4">
                            {sessions.filter(s => !s.active).map(session => (
                                <div key={session.id} className="p-4 rounded-lg bg-card border border-border flex justify-between items-center opacity-75">
                                    <div>
                                        <h3 className="font-semibold">{session.name}</h3>
                                        <p className="text-sm text-muted-foreground">Ended 2h ago</p>
                                    </div>
                                    <Button variant="outline" size="sm">View Notes</Button>
                                </div>
                            ))}
                        </div>
                    </AccessibleCard>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <AccessibleCard className="glass-card p-6 text-center hover:bg-card/50 transition-colors cursor-pointer">
                        <div className="text-4xl mb-3">💻</div>
                        <h3 className="font-bold mb-2">Pair Programming</h3>
                        <p className="text-sm text-muted-foreground">Share code editor in real-time with voice chat</p>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6 text-center hover:bg-card/50 transition-colors cursor-pointer">
                        <div className="text-4xl mb-3">🎨</div>
                        <h3 className="font-bold mb-2">Design Huddle</h3>
                        <p className="text-sm text-muted-foreground">Collaborative whiteboard and design review</p>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6 text-center hover:bg-card/50 transition-colors cursor-pointer">
                        <div className="text-4xl mb-3">📊</div>
                        <h3 className="font-bold mb-2">Code Review</h3>
                        <p className="text-sm text-muted-foreground">Walk through pull requests together</p>
                    </AccessibleCard>
                </div>

                <AccessibleCard className="glass-card p-6 mt-8">
                    <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                    <p className="text-sm text-muted-foreground">
                        "Ngiyakwazi ngoba sikwazi" - I can because we can. Collaboration is the heart of innovation. We build better when we build together.
                    </p>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
