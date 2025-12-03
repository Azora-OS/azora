'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

export default function JoinSessionPage({ params }: { params: { id: string } }) {
    const [isJoining, setIsJoining] = useState(false);
    const ubuntuServices = useUbuntuServices();

    const session = {
        id: params.id,
        title: 'Advanced Mathematics - Calculus II',
        instructor: 'Dr. Sarah Johnson',
        participants: 24,
        startTime: new Date(Date.now() + 10 * 60 * 1000),
        duration: '90 minutes',
        description: 'Deep dive into integration techniques and applications'
    };

    const handleJoin = async () => {
        setIsJoining(true);
        await ubuntuServices.events.publishEvent('classroom.joined', {
            userId: 'demo-student-001',
            sessionId: params.id,
            timestamp: new Date().toISOString()
        }, 'azora-classroom');
        
        setTimeout(() => {
            alert('Joining session... (Feature coming soon)');
            setIsJoining(false);
        }, 2000);
    };

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Join Live Session</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Connect to virtual classroom</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <AccessibleCard className="glass-card p-8">
                            <div className="text-center mb-8">
                                <div className="text-6xl mb-4">🎓</div>
                                <h2 className="text-3xl font-bold mb-2">{session.title}</h2>
                                <p className="text-lg text-muted-foreground mb-4">with {session.instructor}</p>
                                <p className="text-sm text-muted-foreground">{session.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 rounded-lg bg-card border border-border text-center">
                                    <div className="text-2xl font-bold text-primary">{session.participants}</div>
                                    <div className="text-sm text-muted-foreground">Participants</div>
                                </div>
                                <div className="p-4 rounded-lg bg-card border border-border text-center">
                                    <div className="text-2xl font-bold text-blue-500">{session.duration}</div>
                                    <div className="text-sm text-muted-foreground">Duration</div>
                                </div>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-500 font-semibold mb-1">⏰ Session starts in 10 minutes</p>
                                <p className="text-sm text-muted-foreground">
                                    {session.startTime.toLocaleTimeString()} - Please join a few minutes early to test your connection
                                </p>
                            </div>

                            <Button 
                                size="lg" 
                                className="w-full" 
                                onClick={handleJoin}
                                disabled={isJoining}
                            >
                                {isJoining ? 'Joining...' : '🎥 Join Session Now'}
                            </Button>
                        </AccessibleCard>
                    </div>

                    <div className="space-y-6">
                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-4">Session Features</h3>
                            <ul className="space-y-2 text-sm">
                                <li>✓ HD video & audio</li>
                                <li>✓ Interactive whiteboard</li>
                                <li>✓ Screen sharing</li>
                                <li>✓ Breakout rooms</li>
                                <li>✓ Live polls & quizzes</li>
                                <li>✓ Chat & Q&A</li>
                            </ul>
                        </AccessibleCard>

                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-4">Technical Requirements</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>• Stable internet connection</li>
                                <li>• Webcam (optional)</li>
                                <li>• Microphone</li>
                                <li>• Modern browser</li>
                            </ul>
                        </AccessibleCard>

                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                            <p className="text-sm text-muted-foreground">
                                Collaborative learning strengthens the entire community. Your participation enriches everyone's experience.
                            </p>
                        </AccessibleCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
