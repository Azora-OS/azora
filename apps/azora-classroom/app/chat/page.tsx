'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function ChatPage() {
    const [messages, setMessages] = useState([
        { id: 1, user: 'Dr. Johnson', message: 'Welcome everyone! Feel free to ask questions.', time: '10:00 AM', role: 'instructor' },
        { id: 2, user: 'Sarah M.', message: 'Can you explain the substitution method again?', time: '10:05 AM', role: 'student' },
        { id: 3, user: 'Dr. Johnson', message: 'Of course! Let me share my screen.', time: '10:06 AM', role: 'instructor' },
        { id: 4, user: 'James K.', message: 'This is making more sense now, thank you!', time: '10:10 AM', role: 'student' }
    ]);

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Class Chat</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Real-time classroom communication</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                        <AccessibleCard className="glass-card p-6 h-[600px] flex flex-col">
                            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`p-4 rounded-lg ${msg.role === 'instructor'
                                                ? 'bg-primary/10 border-l-4 border-primary'
                                                : 'bg-card border border-border'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold">{msg.user}</span>
                                            {msg.role === 'instructor' && (
                                                <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
                                                    Instructor
                                                </span>
                                            )}
                                            <span className="text-xs text-muted-foreground ml-auto">{msg.time}</span>
                                        </div>
                                        <p className="text-sm">{msg.message}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <Button>Send</Button>
                            </div>
                        </AccessibleCard>
                    </div>

                    <div className="space-y-6">
                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-4">Participants (24)</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span>Dr. Johnson (Instructor)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span>Sarah M.</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span>James K.</span>
                                </div>
                                <div className="text-muted-foreground">+ 21 more</div>
                            </div>
                        </AccessibleCard>

                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-4">Chat Rules</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>• Be respectful</li>
                                <li>• Stay on topic</li>
                                <li>• Use raise hand for questions</li>
                                <li>• No spam</li>
                            </ul>
                        </AccessibleCard>

                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-2">🤝 Ubuntu</h3>
                            <p className="text-sm text-muted-foreground">
                                Respectful communication builds collective knowledge.
                            </p>
                        </AccessibleCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
