'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, StatsCard, GradientText, Button, UbuntuPhilosophyCard } from '@azora/shared-design';
import { ChatWidget } from '../components/ChatWidget';
import { UbuntuServices, useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

export default function StudentDashboard() {
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [citadelBalance, setCitadelBalance] = useState<any>(null);
    const [userValueProfile, setUserValueProfile] = useState<any>(null);
    const [userNFTs, setUserNFTs] = useState<any[]>([]);
    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const ubuntuServices = useUbuntuServices();

    useEffect(() => {
        loadUbuntuData();
    }, []);

    const loadUbuntuData = async () => {
        try {
            setLoading(true);

            // Load Citadel Fund balance
            const citadelData = await ubuntuServices.citadelFund.getCitadelBalance();
            setCitadelBalance(citadelData);

            // Load user value profile
            const valueProfile = await ubuntuServices.proofOfValue.getUserValueProfile('demo-student-001');
            setUserValueProfile(valueProfile);

            // Load user NFTs
            const nfts = await ubuntuServices.nftMinting.getUserNFTs('demo-student-001');
            setUserNFTs(nfts.nfts || []);

            // Load governance proposals
            const proposalsData = await ubuntuServices.governance.getProposals();
            setProposals(proposalsData.proposals || []);

            // Publish dashboard visit event
            await ubuntuServices.events.publishEvent('dashboard.visited', {
                userId: 'demo-student-001',
                timestamp: new Date().toISOString()
            }, 'azora-sapiens');

        } catch (error) {
            console.error('Error loading Ubuntu data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (message: string) => {
        const userMessage = {
            id: Date.now().toString(),
            content: message,
            sender: 'user',
            timestamp: new Date(),
        };
        setChatMessages((prev: any[]) => [...prev, userMessage]);

        // Validate message with Constitutional AI
        try {
            const validation = await ubuntuServices.constitutionalAI.validateContent(message);
            if (!validation.compliant) {
                const aiMessage = {
                    id: (Date.now() + 1).toString(),
                    content: "I notice that message may not align with our Ubuntu principles. Could we rephrase that in a way that strengthens our community?",
                    sender: 'ai',
                    timestamp: new Date(),
                    aiMember: 'Elara',
                };
                setChatMessages(prev => [...prev, aiMessage]);
                return;
            }
        } catch (error) {
            console.error('Constitutional AI validation error:', error);
        }

        // Simulate AI response
        setTimeout(() => {
            const aiMessage = {
                id: (Date.now() + 1).toString(),
                content: "I can help you with that assignment! Let's break it down step by step, following Ubuntu principles of collaborative learning.",
                sender: 'ai',
                timestamp: new Date(),
                aiMember: 'Elara',
            };
            setChatMessages(prev => [...prev, aiMessage]);
        }, 1000);
    };

    const courses = [
        {
            id: 1,
            title: 'Advanced Mathematics',
            grade: '92%',
            nextAssignment: 'Calculus Quiz',
            dueDate: 'Tomorrow',
            color: 'from-blue-500 to-cyan-500',
            icon: '📐'
        },
        {
            id: 2,
            title: 'Computer Science 101',
            grade: '98%',
            nextAssignment: 'Python Project',
            dueDate: 'In 2 days',
            color: 'from-purple-500 to-pink-500',
            icon: '💻'
        },
        {
            id: 3,
            title: 'Business Ethics',
            grade: '88%',
            nextAssignment: 'Case Study',
            dueDate: 'Next Week',
            color: 'from-emerald-500 to-teal-500',
            icon: '⚖️'
        }
    ];

    const assignments = [
        { id: 1, title: 'Calculus Quiz', course: 'Math', due: 'Tomorrow', status: 'Pending' },
        { id: 2, title: 'Python Project', course: 'CS 101', due: 'In 2 days', status: 'In Progress' },
        { id: 3, title: 'History Essay', course: 'History', due: 'Completed', status: 'Done' },
    ];

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Help</Button>
                    <Button size="sm">Profile</Button>
                </div>
            }
        >
            <div className="max-w-7xl mx-auto py-8">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl font-bold mb-2">
                        Hello, <GradientText>Alex</GradientText>
                    </h1>
                    <p className="text-muted-foreground">You have 2 assignments due this week.</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatsCard
                                label="GPA"
                                value="3.8"
                                className="glass-card"
                            />
                            <StatsCard
                                label="Credits"
                                value="24"
                                className="glass-card"
                            />
                            <StatsCard
                                label="Attendance"
                                value="95%"
                                className="glass-card"
                            />
                        </div>

                        {/* Current Courses */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Current Courses</h2>
                            <div className="grid gap-4">
                                {courses.map((course, index) => (
                                    <motion.div
                                        key={course.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <AccessibleCard className="glass-card p-6 flex items-center justify-between group cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center text-2xl`}>
                                                    {course.icon}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{course.title}</h3>
                                                    <p className="text-sm text-muted-foreground">Next: {course.nextAssignment}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-foreground">{course.grade}</div>
                                                <div className="text-xs text-muted-foreground">Current Grade</div>
                                            </div>
                                        </AccessibleCard>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Upcoming Assignments */}
                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-xl font-bold mb-4">Upcoming Due Dates</h3>
                            <div className="space-y-4">
                                {assignments.map((assignment) => (
                                    <div key={assignment.id} className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border">
                                        <div>
                                            <div className="font-semibold">{assignment.title}</div>
                                            <div className="text-xs text-muted-foreground">{assignment.course}</div>
                                        </div>
                                        <div className={`text-xs px-2 py-1 rounded-full ${assignment.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                            assignment.status === 'In Progress' ? 'bg-blue-500/20 text-blue-500' :
                                                'bg-green-500/20 text-green-500'
                                            }`}>
                                            {assignment.due}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" size="sm" className="w-full mt-4">
                                View All Assignments
                            </Button>
                        </AccessibleCard>

                        {/* Ubuntu Philosophy - Constitutional Requirement */}
                        <UbuntuPhilosophyCard
                            collectiveImpact={userValueProfile?.collectiveImpact || 85}
                            communityBenefit={92}
                            ubuntuAlignment={userValueProfile?.ubuntuScore || 88}
                        />

                        {/* Quick Actions */}
                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <Button variant="secondary" className="w-full justify-start">
                                    📅 View Calendar
                                </Button>
                                <Button variant="secondary" className="w-full justify-start">
                                    📝 Request Transcript
                                </Button>
                                <Button variant="secondary" className="w-full justify-start">
                                    💳 Pay Tuition
                                </Button>
                            </div>
                        </AccessibleCard>
                    </div>
                </div>
            </div>

            <ChatWidget
                onSendMessage={handleSendMessage}
                messages={chatMessages}
                aiMember="Elara"
            />
        </AppLayout>
    );
}
