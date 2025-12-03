'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function BreakoutPage() {
    const rooms = [
        { id: 1, name: 'Group A - Problem Set 1', participants: 5, topic: 'Integration by parts' },
        { id: 2, name: 'Group B - Problem Set 2', participants: 6, topic: 'Substitution method' },
        { id: 3, name: 'Group C - Problem Set 3', participants: 5, topic: 'Partial fractions' },
        { id: 4, name: 'Group D - Problem Set 4', participants: 8, topic: 'Trigonometric integrals' }
    ];

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Create Room</Button>
                    <Button size="sm">Return to Main</Button>
                </div>
            }
        >
            <div className="max-w-6xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Breakout Rooms</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Small group collaboration spaces</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rooms.map((room, index) => (
                        <motion.div
                            key={room.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <AccessibleCard className="glass-card p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">{room.name}</h3>
                                        <p className="text-sm text-muted-foreground">{room.topic}</p>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                                        {room.participants} people
                                    </div>
                                </div>
                                <Button className="w-full">Join Room</Button>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>

                <AccessibleCard className="glass-card p-6 mt-8">
                    <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                    <p className="text-sm text-muted-foreground">
                        Breakout rooms enable peer-to-peer learning where students teach and learn from each other, strengthening collective understanding.
                    </p>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
