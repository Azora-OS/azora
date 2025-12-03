'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { ChatWidget } from '../components/ChatWidget';
import { useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

export default function AITutorPage() {
    const [chatMessages, setChatMessages] = useState<any[]>([
        {
            id: '1',
            content: "Hello! I'm Elara, your AI tutor. I'm here to help you learn and grow. What would you like to work on today?",
            sender: 'ai',
            timestamp: new Date(),
            aiMember: 'Elara'
        }
    ]);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [tutorMode, setTutorMode] = useState<'homework' | 'concept' | 'practice' | null>(null);
    const ubuntuServices = useUbuntuServices();

    const subjects = [
        { id: 'math', name: 'Mathematics', icon: '📐', color: 'from-blue-500 to-cyan-500' },
        { id: 'cs', name: 'Computer Science', icon: '💻', color: 'from-purple-500 to-pink-500' },
        { id: 'science', name: 'Science', icon: '🔬', color: 'from-green-500 to-emerald-500' },
        { id: 'language', name: 'Language Arts', icon: '📚', color: 'from-orange-500 to-red-500' },
        { id: 'history', name: 'History', icon: '🏛️', color: 'from-yellow-500 to-amber-500' },
        { id: 'business', name: 'Business', icon: '💼', color: 'from-indigo-500 to-violet-500' }
    ];

    const tutorModes = [
        { id: 'homework', name: 'Homework Help', icon: '📝', description: 'Get help with assignments' },
        { id: 'concept', name: 'Explain Concept', icon: '💡', description: 'Understand difficult topics' },
        { id: 'practice', name: 'Practice Problems', icon: '🎯', description: 'Test your knowledge' }
    ];

    const quickActions = [
        { id: 1, text: 'Explain this concept to me', icon: '💡' },
        { id: 2, text: 'Help me with my homework', icon: '📝' },
        { id: 3, text: 'Give me practice problems', icon: '🎯' },
        { id: 4, text: 'Review for my exam', icon: '📖' }
    ];

    const handleSendMessage = async (message: string) => {
        const userMessage = {
            id: Date.now().toString(),
            content: message,
            sender: 'user',
            timestamp: new Date()
        };
        setChatMessages((prev) => [...prev, userMessage]);

        // Validate with Constitutional AI
        try {
            const validation = await ubuntuServices.constitutionalAI.validateContent(message);
            if (!validation.compliant) {
                const aiMessage = {
                    id: (Date.now() + 1).toString(),
                    content: "I notice that message may not align with our Ubuntu principles. Let's focus on collaborative learning that benefits everyone.",
                    sender: 'ai',
                    timestamp: new Date(),
                    aiMember: 'Elara'
                };
                setChatMessages(prev => [...prev, aiMessage]);
                return;
            }
        } catch (error) {
            console.error('Constitutional AI validation error:', error);
        }

        // Publish tutoring event
        await ubuntuServices.events.publishEvent('ai-tutor.message', {
            userId: 'demo-student-001',
            message,
            subject: selectedSubject,
            mode: tutorMode,
            timestamp: new Date().toISOString()
        }, 'azora-sapiens');

        // Simulate AI response
        setTimeout(() => {
            const responses = [
                "Great question! Let me break this down for you step by step...",
                "I can help you with that! Here's how we can approach this problem...",
                "That's an interesting topic! Let's explore it together using the Ubuntu approach of collaborative learning...",
                "Excellent! Let me guide you through this concept..."
            ];

            const aiMessage = {
                id: (Date.now() + 1).toString(),
                content: responses[Math.floor(Math.random() * responses.length)],
                sender: 'ai',
                timestamp: new Date(),
                aiMember: 'Elara'
            };
            setChatMessages(prev => [...prev, aiMessage]);
        }, 1000);
    };

    const handleQuickAction = (text: string) => {
        handleSendMessage(text);
    };

    const handleSubjectSelect = (subjectId: string) => {
        setSelectedSubject(subjectId);
        const subject = subjects.find(s => s.id === subjectId);
        const aiMessage = {
            id: Date.now().toString(),
            content: `Great! Let's work on ${subject?.name}. What would you like to do?`,
            sender: 'ai',
            timestamp: new Date(),
            aiMember: 'Elara'
        };
        setChatMessages(prev => [...prev, aiMessage]);
    };

    const handleModeSelect = (mode: 'homework' | 'concept' | 'practice') => {
        setTutorMode(mode);
        const modeInfo = tutorModes.find(m => m.id === mode);
        const aiMessage = {
            id: Date.now().toString(),
            content: `Perfect! I'm ready to help you with ${modeInfo?.name.toLowerCase()}. What's your question?`,
            sender: 'ai',
            timestamp: new Date(),
            aiMember: 'Elara'
        };
        setChatMessages(prev => [...prev, aiMessage]);
    };

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Tutoring History</Button>
                    <Button size="sm">Schedule Session</Button>
                </div>
            }
        >
            <div className="max-w-7xl mx-auto py-8">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>AI Tutor - Elara</GradientText>
                    </h1>
                    <p className="text-muted-foreground">
                        Personalized AI tutoring powered by Ubuntu philosophy
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Select Subject */}
                        <section>
                            <h2 className="text-xl font-bold mb-4">Select Subject</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {subjects.map((subject) => (
                                    <motion.button
                                        key={subject.id}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleSubjectSelect(subject.id)}
                                        className={`p-4 rounded-lg border-2 transition-all ${selectedSubject === subject.id
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border bg-card hover:border-primary/50'
                                            }`}
                                    >
                                        <div className="text-3xl mb-2">{subject.icon}</div>
                                        <div className="text-sm font-semibold">{subject.name}</div>
                                    </motion.button>
                                ))}
                            </div>
                        </section>

                        {/* Tutor Mode */}
                        <section>
                            <h2 className="text-xl font-bold mb-4">How Can I Help?</h2>
                            <div className="space-y-2">
                                {tutorModes.map((mode) => (
                                    <motion.button
                                        key={mode.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleModeSelect(mode.id as any)}
                                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${tutorMode === mode.id
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border bg-card hover:border-primary/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl">{mode.icon}</div>
                                            <div>
                                                <div className="font-semibold">{mode.name}</div>
                                                <div className="text-xs text-muted-foreground">{mode.description}</div>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </section>

                        {/* Ubuntu Philosophy */}
                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Learning</h3>
                            <p className="text-sm text-muted-foreground italic mb-2">
                                "Ngiyakwazi ngoba sikwazi"
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Elara uses collaborative teaching methods that strengthen both individual and collective understanding.
                            </p>
                        </AccessibleCard>
                    </div>

                    {/* Main Chat Area */}
                    <div className="lg:col-span-2">
                        <AccessibleCard className="glass-card p-6 h-[600px] flex flex-col">
                            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                                {chatMessages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] p-4 rounded-lg ${msg.sender === 'user'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-card border border-border'
                                                }`}
                                        >
                                            {msg.sender === 'ai' && (
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="text-2xl">🤖</div>
                                                    <div className="font-semibold text-sm">{msg.aiMember}</div>
                                                </div>
                                            )}
                                            <p className="text-sm">{msg.content}</p>
                                            <p className="text-xs opacity-70 mt-2">
                                                {msg.timestamp.toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Quick Actions */}
                            {chatMessages.length <= 1 && (
                                <div className="mb-4">
                                    <p className="text-sm text-muted-foreground mb-2">Quick actions:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {quickActions.map((action) => (
                                            <Button
                                                key={action.id}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleQuickAction(action.text)}
                                                className="justify-start"
                                            >
                                                <span className="mr-2">{action.icon}</span>
                                                {action.text}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Input Area */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Ask Elara anything..."
                                    className="flex-1 px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                            handleSendMessage(e.currentTarget.value);
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                />
                                <Button>Send</Button>
                            </div>
                        </AccessibleCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
