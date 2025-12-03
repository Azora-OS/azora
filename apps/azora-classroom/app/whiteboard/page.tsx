'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function WhiteboardPage() {
    const [tool, setTool] = useState<'pen' | 'eraser' | 'text'>('pen');
    const [color, setColor] = useState('#3b82f6');

    const tools = [
        { id: 'pen', icon: '✏️', label: 'Pen' },
        { id: 'eraser', icon: '🧹', label: 'Eraser' },
        { id: 'text', icon: '📝', label: 'Text' }
    ];

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#000000'];

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Save</Button>
                    <Button size="sm">Share</Button>
                </div>
            }
        >
            <div className="max-w-7xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Interactive Whiteboard</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Collaborative drawing and note-taking</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Toolbar */}
                    <div className="space-y-6">
                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-4">Tools</h3>
                            <div className="space-y-2">
                                {tools.map((t) => (
                                    <Button
                                        key={t.id}
                                        variant={tool === t.id ? 'default' : 'outline'}
                                        className="w-full justify-start"
                                        onClick={() => setTool(t.id as any)}
                                    >
                                        <span className="mr-2">{t.icon}</span>
                                        {t.label}
                                    </Button>
                                ))}
                            </div>
                        </AccessibleCard>

                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-4">Colors</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {colors.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setColor(c)}
                                        className={`w-12 h-12 rounded-lg border-2 ${color === c ? 'border-primary' : 'border-border'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </AccessibleCard>

                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-2">🤝 Ubuntu</h3>
                            <p className="text-sm text-muted-foreground">
                                Collaborative whiteboard for collective learning.
                            </p>
                        </AccessibleCard>
                    </div>

                    {/* Canvas */}
                    <div className="lg:col-span-3">
                        <AccessibleCard className="glass-card p-6">
                            <div className="bg-white rounded-lg border-2 border-border h-[600px] flex items-center justify-center">
                                <div className="text-center text-muted-foreground">
                                    <div className="text-6xl mb-4">🎨</div>
                                    <p className="text-lg font-semibold mb-2">Interactive Canvas</p>
                                    <p className="text-sm">Whiteboard functionality coming soon</p>
                                    <p className="text-xs mt-4">Selected: {tool} | Color: {color}</p>
                                </div>
                            </div>
                        </AccessibleCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
