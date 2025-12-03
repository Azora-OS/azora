'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

export default function ProgressPage() {
    const [progressData, setProgressData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const ubuntuServices = useUbuntuServices();

    useEffect(() => {
        loadProgressData();
    }, []);

    const loadProgressData = async () => {
        try {
            setLoading(true);

            // Load user value profile for progress tracking
            const valueProfile = await ubuntuServices.proofOfValue.getUserValueProfile('demo-student-001');

            // Mock progress data
            const mockProgress = {
                overallProgress: 68,
                coursesInProgress: 3,
                coursesCompleted: 12,
                totalLearningHours: 240,
                streakDays: 15,
                azrTokensEarned: 1250,
                courses: [
                    {
                        id: 1,
                        name: 'Advanced Mathematics',
                        progress: 85,
                        grade: 92,
                        lessonsCompleted: 17,
                        totalLessons: 20,
                        timeSpent: 45,
                        nextMilestone: 'Final Exam',
                        color: 'from-blue-500 to-cyan-500'
                    },
                    {
                        id: 2,
                        name: 'Computer Science 101',
                        progress: 92,
                        grade: 98,
                        lessonsCompleted: 23,
                        totalLessons: 25,
                        timeSpent: 60,
                        nextMilestone: 'Capstone Project',
                        color: 'from-purple-500 to-pink-500'
                    },
                    {
                        id: 3,
                        name: 'Business Ethics',
                        progress: 40,
                        grade: 88,
                        lessonsCompleted: 8,
                        totalLessons: 20,
                        timeSpent: 25,
                        nextMilestone: 'Midterm Exam',
                        color: 'from-emerald-500 to-teal-500'
                    }
                ],
                achievements: [
                    { id: 1, title: '15 Day Streak', icon: '🔥', earned: true },
                    { id: 2, title: 'First Certificate', icon: '🎓', earned: true },
                    { id: 3, title: '1000 AZR Earned', icon: '💰', earned: true },
                    { id: 4, title: 'Top 10% Student', icon: '⭐', earned: false },
                    { id: 5, title: 'Community Helper', icon: '🤝', earned: true },
                    { id: 6, title: 'Perfect Score', icon: '💯', earned: false }
                ],
                weeklyActivity: [
                    { day: 'Mon', hours: 3.5 },
                    { day: 'Tue', hours: 4.2 },
                    { day: 'Wed', hours: 2.8 },
                    { day: 'Thu', hours: 5.1 },
                    { day: 'Fri', hours: 3.9 },
                    { day: 'Sat', hours: 6.2 },
                    { day: 'Sun', hours: 4.5 }
                ]
            };

            setProgressData(mockProgress);
        } catch (error) {
            console.error('Error loading progress data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !progressData) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="text-4xl mb-4">⏳</div>
                        <p className="text-muted-foreground">Loading your progress...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const maxHours = Math.max(...progressData.weeklyActivity.map((d: any) => d.hours));

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Export Report</Button>
                    <Button size="sm">Set Goals</Button>
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
                        <GradientText>Learning Progress</GradientText>
                    </h1>
                    <p className="text-muted-foreground">
                        Track your journey and celebrate your achievements
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-primary">{progressData.overallProgress}%</div>
                        <div className="text-sm text-muted-foreground">Overall Progress</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-blue-500">{progressData.totalLearningHours}h</div>
                        <div className="text-sm text-muted-foreground">Learning Hours</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-orange-500">{progressData.streakDays} 🔥</div>
                        <div className="text-sm text-muted-foreground">Day Streak</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-green-500">{progressData.azrTokensEarned} AZR</div>
                        <div className="text-sm text-muted-foreground">Tokens Earned</div>
                    </AccessibleCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Course Progress */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Course Progress</h2>
                            <div className="space-y-4">
                                {progressData.courses.map((course: any, index: number) => (
                                    <motion.div
                                        key={course.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <AccessibleCard className="glass-card p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="font-bold text-lg">{course.name}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {course.lessonsCompleted} of {course.totalLessons} lessons completed
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold">{course.grade}%</div>
                                                    <div className="text-xs text-muted-foreground">Current Grade</div>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mb-4">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-muted-foreground">Progress</span>
                                                    <span className="font-semibold">{course.progress}%</span>
                                                </div>
                                                <div className="h-3 bg-card rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${course.progress}%` }}
                                                        transition={{ duration: 1, delay: index * 0.2 }}
                                                        className={`h-full bg-gradient-to-r ${course.color}`}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-sm">
                                                <div className="text-muted-foreground">
                                                    ⏱️ {course.timeSpent}h spent
                                                </div>
                                                <div className="text-primary font-semibold">
                                                    Next: {course.nextMilestone}
                                                </div>
                                            </div>
                                        </AccessibleCard>
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        {/* Weekly Activity */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Weekly Activity</h2>
                            <AccessibleCard className="glass-card p-6">
                                <div className="flex items-end justify-between gap-2 h-48">
                                    {progressData.weeklyActivity.map((day: any, index: number) => (
                                        <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${(day.hours / maxHours) * 100}%` }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                                className="w-full bg-gradient-to-t from-primary to-primary/50 rounded-t-lg min-h-[20px]"
                                            />
                                            <div className="text-xs text-muted-foreground">{day.day}</div>
                                            <div className="text-xs font-semibold">{day.hours}h</div>
                                        </div>
                                    ))}
                                </div>
                            </AccessibleCard>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Achievements */}
                        <section>
                            <h2 className="text-xl font-bold mb-4">Achievements</h2>
                            <AccessibleCard className="glass-card p-6">
                                <div className="grid grid-cols-3 gap-3">
                                    {progressData.achievements.map((achievement: any) => (
                                        <div
                                            key={achievement.id}
                                            className={`aspect-square rounded-lg flex flex-col items-center justify-center ${achievement.earned
                                                    ? 'bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary'
                                                    : 'bg-card/50 border border-border opacity-50'
                                                }`}
                                        >
                                            <div className="text-3xl mb-1">{achievement.icon}</div>
                                            <div className="text-xs text-center px-1">{achievement.title}</div>
                                        </div>
                                    ))}
                                </div>
                            </AccessibleCard>
                        </section>

                        {/* Proof of Knowledge */}
                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-2">💎 Proof of Knowledge</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Earn AZR tokens through verified learning
                            </p>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">This Week:</span>
                                    <span className="font-semibold text-green-500">+125 AZR</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">This Month:</span>
                                    <span className="font-semibold text-green-500">+480 AZR</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">All Time:</span>
                                    <span className="font-semibold text-primary">{progressData.azrTokensEarned} AZR</span>
                                </div>
                            </div>
                        </AccessibleCard>

                        {/* Ubuntu Philosophy */}
                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                            <p className="text-sm text-muted-foreground italic mb-2">
                                "Ngiyakwazi ngoba sikwazi"
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Your progress contributes to the collective knowledge of the community.
                                Keep learning, keep growing!
                            </p>
                        </AccessibleCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
