/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

PROGRESS DASHBOARD COMPONENT
Student progress analytics and visualization
*/

import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Award, BookOpen, Target, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api-client';

interface CourseProgress {
    courseId: string;
    courseTitle: string;
    progress: number;
    timeSpent: number;
    lastAccessed: Date;
    completed: boolean;
}

interface ProgressStats {
    totalCourses: number;
    completedCourses: number;
    totalTimeSpent: number;
    averageScore: number;
    streak: number;
}

interface ProgressDashboardProps {
    onClose?: () => void;
}

export function ProgressDashboard({ onClose }: ProgressDashboardProps) {
    const [stats, setStats] = useState<ProgressStats>({
        totalCourses: 0,
        completedCourses: 0,
        totalTimeSpent: 0,
        averageScore: 0,
        streak: 0,
    });
    const [courses, setCourses] = useState<CourseProgress[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadProgress();
    }, []);

    const loadProgress = async () => {
        try {
            const enrollments = await apiClient.getMyEnrollments();

            // Calculate stats
            const totalCourses = enrollments.length;
            const completedCourses = enrollments.filter((e: any) => e.status === 'completed').length;
            const totalTimeSpent = enrollments.reduce((sum: number, e: any) => sum + (e.timeSpent || 0), 0);
            const averageScore = enrollments.reduce((sum: number, e: any) => sum + (e.score || 0), 0) / (totalCourses || 1);

            setStats({
                totalCourses,
                completedCourses,
                totalTimeSpent,
                averageScore: Math.round(averageScore),
                streak: 7, // Mock data
            });

            // Transform enrollments to course progress
            const courseProgress: CourseProgress[] = enrollments.map((e: any) => ({
                courseId: e.courseId,
                courseTitle: e.course?.title || 'Unknown Course',
                progress: e.progress || 0,
                timeSpent: e.timeSpent || 0,
                lastAccessed: new Date(e.lastAccessed || Date.now()),
                completed: e.status === 'completed',
            }));

            setCourses(courseProgress);
        } catch (error) {
            console.error('Failed to load progress:', error);
            // Mock data fallback
            setStats({
                totalCourses: 5,
                completedCourses: 2,
                totalTimeSpent: 1200,
                averageScore: 85,
                streak: 7,
            });
            setCourses(getMockCourses());
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-blue-500/30 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-4 border-b border-blue-500/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Learning Progress</h3>
                            <p className="text-xs text-blue-300">Track your educational journey</p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-2 animate-pulse" />
                            <p className="text-gray-400">Loading progress...</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard
                                icon={<BookOpen className="w-5 h-5" />}
                                label="Total Courses"
                                value={stats.totalCourses.toString()}
                                color="from-blue-500 to-cyan-500"
                            />
                            <StatCard
                                icon={<Award className="w-5 h-5" />}
                                label="Completed"
                                value={stats.completedCourses.toString()}
                                color="from-green-500 to-emerald-500"
                            />
                            <StatCard
                                icon={<Clock className="w-5 h-5" />}
                                label="Time Spent"
                                value={formatTime(stats.totalTimeSpent)}
                                color="from-purple-500 to-pink-500"
                            />
                            <StatCard
                                icon={<Target className="w-5 h-5" />}
                                label="Avg Score"
                                value={`${stats.averageScore}%`}
                                color="from-yellow-500 to-amber-500"
                            />
                        </div>

                        {/* Streak */}
                        <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">🔥</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Learning Streak</p>
                                        <p className="text-2xl font-bold text-white">{stats.streak} days</p>
                                    </div>
                                </div>
                                <p className="text-sm text-orange-300">Keep it up!</p>
                            </div>
                        </div>

                        {/* Course Progress */}
                        <div>
                            <h4 className="text-lg font-bold text-white mb-4">Course Progress</h4>
                            <div className="space-y-3">
                                {courses.length === 0 ? (
                                    <div className="text-center py-8">
                                        <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                                        <p className="text-gray-400">No courses enrolled yet</p>
                                    </div>
                                ) : (
                                    courses.map((course) => (
                                        <motion.div
                                            key={course.courseId}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-700/50 rounded-xl p-4 hover:border-blue-500/50 transition-all"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex-1">
                                                    <h5 className="font-bold text-white mb-1">{course.courseTitle}</h5>
                                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {formatTime(course.timeSpent)}
                                                        </span>
                                                        <span>
                                                            Last: {course.lastAccessed.toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                {course.completed && (
                                                    <div className="flex items-center gap-1 text-green-400 text-sm font-semibold">
                                                        <Award className="w-4 h-4" />
                                                        Completed
                                                    </div>
                                                )}
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${course.progress}%` }}
                                                    transition={{ duration: 0.5, delay: 0.2 }}
                                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1 text-right">{course.progress}% complete</p>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
    return (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-700/50 rounded-xl p-4">
            <div className={`w-10 h-10 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center mb-3`}>
                <div className="text-white">{icon}</div>
            </div>
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    );
}

// Mock data fallback
function getMockCourses(): CourseProgress[] {
    return [
        {
            courseId: '1',
            courseTitle: 'Introduction to Physics',
            progress: 75,
            timeSpent: 300,
            lastAccessed: new Date(),
            completed: false,
        },
        {
            courseId: '2',
            courseTitle: 'Advanced Mathematics',
            progress: 100,
            timeSpent: 450,
            lastAccessed: new Date(Date.now() - 86400000),
            completed: true,
        },
        {
            courseId: '3',
            courseTitle: 'Chemistry Fundamentals',
            progress: 45,
            timeSpent: 180,
            lastAccessed: new Date(Date.now() - 172800000),
            completed: false,
        },
    ];
}
