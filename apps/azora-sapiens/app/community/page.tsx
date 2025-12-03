'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

export default function CommunityPage() {
    const [activeTab, setActiveTab] = useState<'discussions' | 'study-groups' | 'leaderboard'>('discussions');
    const ubuntuServices = useUbuntuServices();

    const discussions = [
        {
            id: 1,
            title: 'Help with Calculus Assignment',
            author: 'Sarah M.',
            replies: 12,
            views: 156,
            category: 'Mathematics',
            timestamp: '2 hours ago',
            icon: '📐'
        },
        {
            id: 2,
            title: 'Python Study Group - Week 3',
            author: 'James K.',
            replies: 24,
            views: 289,
            category: 'Computer Science',
            timestamp: '5 hours ago',
            icon: '💻'
        },
        {
            id: 3,
            title: 'Ubuntu Philosophy in Business',
            author: 'Thabo N.',
            replies: 18,
            views: 203,
            category: 'Business Ethics',
            timestamp: '1 day ago',
            icon: '⚖️'
        }
    ];

    const studyGroups = [
        {
            id: 1,
            name: 'Advanced Math Study Circle',
            members: 15,
            nextSession: 'Tomorrow, 6:00 PM',
            description: 'Collaborative learning for advanced mathematics',
            icon: '📐',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            id: 2,
            name: 'CS 101 Project Team',
            members: 8,
            nextSession: 'Today, 8:00 PM',
            description: 'Working on final projects together',
            icon: '💻',
            color: 'from-purple-500 to-pink-500'
        },
        {
            id: 3,
            name: 'Ubuntu Philosophy Discussion',
            members: 22,
            nextSession: 'Friday, 5:00 PM',
            description: 'Exploring collective prosperity principles',
            icon: '🤝',
            color: 'from-emerald-500 to-teal-500'
        }
    ];

    const leaderboard = [
        { rank: 1, name: 'Alex Johnson', points: 2450, badge: '🥇', contributions: 156 },
        { rank: 2, name: 'Maria Garcia', points: 2380, badge: '🥈', contributions: 142 },
        { rank: 3, name: 'Chen Wei', points: 2210, badge: '🥉', contributions: 138 },
        { rank: 4, name: 'Aisha Patel', points: 2050, badge: '⭐', contributions: 125 },
        { rank: 5, name: 'You', points: 1890, badge: '⭐', contributions: 112, isCurrentUser: true }
    ];

    const handleJoinGroup = async (groupId: number) => {
        await ubuntuServices.events.publishEvent('study-group.joined', {
            userId: 'demo-student-001',
            groupId,
            timestamp: new Date().toISOString()
        }, 'azora-sapiens');
        alert('Joined study group! (Feature coming soon)');
    };

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Create Discussion</Button>
                    <Button size="sm">Start Study Group</Button>
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
                        <GradientText>Community</GradientText>
                    </h1>
                    <p className="text-muted-foreground">
                        Ubuntu-based peer learning and collaboration
                    </p>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-primary">1,247</div>
                        <div className="text-sm text-muted-foreground">Active Members</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-blue-500">89</div>
                        <div className="text-sm text-muted-foreground">Study Groups</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-green-500">456</div>
                        <div className="text-sm text-muted-foreground">Discussions</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-orange-500">3.2k</div>
                        <div className="text-sm text-muted-foreground">Contributions</div>
                    </AccessibleCard>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {[
                        { id: 'discussions', label: 'Discussions', icon: '💬' },
                        { id: 'study-groups', label: 'Study Groups', icon: '👥' },
                        { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' }
                    ].map((tab) => (
                        <Button
                            key={tab.id}
                            variant={activeTab === tab.id ? 'default' : 'outline'}
                            onClick={() => setActiveTab(tab.id as any)}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </Button>
                    ))}
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {activeTab === 'discussions' && (
                            <div className="space-y-4">
                                {discussions.map((discussion, index) => (
                                    <motion.div
                                        key={discussion.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <AccessibleCard className="glass-card p-6 hover:shadow-lg transition-shadow cursor-pointer">
                                            <div className="flex items-start gap-4">
                                                <div className="text-4xl">{discussion.icon}</div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg mb-1">{discussion.title}</h3>
                                                    <p className="text-sm text-muted-foreground mb-3">
                                                        by {discussion.author} • {discussion.timestamp}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <span className="text-muted-foreground">
                                                            💬 {discussion.replies} replies
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            👁️ {discussion.views} views
                                                        </span>
                                                        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                                                            {discussion.category}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </AccessibleCard>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'study-groups' && (
                            <div className="space-y-4">
                                {studyGroups.map((group, index) => (
                                    <motion.div
                                        key={group.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <AccessibleCard className="glass-card p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${group.color} flex items-center justify-center text-2xl`}>
                                                        {group.icon}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg">{group.name}</h3>
                                                        <p className="text-sm text-muted-foreground">{group.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1 text-sm">
                                                    <div className="text-muted-foreground">
                                                        👥 {group.members} members
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        📅 Next: {group.nextSession}
                                                    </div>
                                                </div>
                                                <Button onClick={() => handleJoinGroup(group.id)}>
                                                    Join Group
                                                </Button>
                                            </div>
                                        </AccessibleCard>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'leaderboard' && (
                            <AccessibleCard className="glass-card p-6">
                                <h2 className="text-xl font-bold mb-4">Top Contributors</h2>
                                <div className="space-y-3">
                                    {leaderboard.map((user, index) => (
                                        <motion.div
                                            key={user.rank}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`flex items-center justify-between p-4 rounded-lg ${user.isCurrentUser
                                                    ? 'bg-primary/10 border-2 border-primary'
                                                    : 'bg-card border border-border'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-2xl">{user.badge}</div>
                                                <div>
                                                    <div className="font-bold">{user.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {user.contributions} contributions
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-primary">{user.points}</div>
                                                <div className="text-xs text-muted-foreground">points</div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </AccessibleCard>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Ubuntu Philosophy */}
                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                            <p className="text-sm text-muted-foreground italic mb-2">
                                "Ngiyakwazi ngoba sikwazi"
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Our community thrives on collective learning. When you help others, you strengthen the entire ecosystem.
                            </p>
                        </AccessibleCard>

                        {/* Community Guidelines */}
                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-3">📜 Community Guidelines</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>✓ Be respectful and supportive</li>
                                <li>✓ Share knowledge freely</li>
                                <li>✓ Collaborate, don't compete</li>
                                <li>✓ Give credit where due</li>
                                <li>✓ Uphold Ubuntu values</li>
                            </ul>
                        </AccessibleCard>

                        {/* Your Impact */}
                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-3">Your Impact</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Discussions Started:</span>
                                    <span className="font-semibold">8</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Replies Given:</span>
                                    <span className="font-semibold">104</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">People Helped:</span>
                                    <span className="font-semibold text-green-500">67</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">AZR Earned:</span>
                                    <span className="font-semibold text-primary">+320 AZR</span>
                                </div>
                            </div>
                        </AccessibleCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
