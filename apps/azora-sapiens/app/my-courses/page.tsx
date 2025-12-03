'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { UbuntuServices, useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

const ENROLLED_COURSES = [
    {
        id: '1',
        title: 'Advanced Mathematics',
        progress: 75,
        nextLesson: 'Calculus: Derivatives',
        image: '📐',
        lastAccessed: '2 hours ago'
    },
    {
        id: '2',
        title: 'Computer Science 101',
        progress: 45,
        nextLesson: 'Python: Lists and Dictionaries',
        image: '💻',
        lastAccessed: 'Yesterday'
    },
    {
        id: '3',
        title: 'Business Ethics',
        progress: 10,
        nextLesson: 'Introduction to Ethics',
        image: '⚖️',
        lastAccessed: '3 days ago'
    }
];

export default function MyCoursesPage() {
    const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const ubuntuServices = useUbuntuServices();

    useEffect(() => {
        const loadEnrolledCourses = async () => {
            try {
                // Get user's enrolled courses from Ubuntu education service
                const userProgress = await ubuntuServices.education.getUserProgress('demo-student-001');
                
                if (userProgress.courses && userProgress.courses.length > 0) {
                    setEnrolledCourses(userProgress.courses);
                } else {
                    // Fallback to mock data
                    setEnrolledCourses([
                        {
                            id: '1',
                            title: 'Ubuntu Philosophy 101',
                            progress: 75,
                            nextLesson: 'Community Principles',
                            image: '🌍',
                            lastAccessed: '2 hours ago'
                        },
                        {
                            id: '2',
                            title: 'Advanced Mathematics',
                            progress: 45,
                            nextLesson: 'Calculus: Derivatives',
                            image: '📐',
                            lastAccessed: 'Yesterday'
                        },
                        {
                            id: '3',
                            title: 'Computer Science Fundamentals',
                            progress: 10,
                            nextLesson: 'Python: Lists and Dictionaries',
                            image: '💻',
                            lastAccessed: '3 days ago'
                        }
                    ]);
                }
            } catch (error) {
                console.error('Error loading enrolled courses:', error);
                // Fallback to mock data
                setEnrolledCourses([
                    {
                        id: '1',
                        title: 'Ubuntu Philosophy 101',
                        progress: 75,
                        nextLesson: 'Community Principles',
                        image: '🌍',
                        lastAccessed: '2 hours ago'
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        loadEnrolledCourses();
    }, [ubuntuServices]);

    if (loading) {
        return (
            <AppLayout appName="Azora Sapiens" userName="Azora Citizen">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading Ubuntu courses...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout appName="Azora Sapiens" userName="Azora Citizen">
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <h1 className="text-4xl font-bold">
                        <GradientText>My Ubuntu Learning</GradientText>
                    </h1>
                    <p className="text-gray-400">Continue your journey of "I am because we are"</p>
                </motion.div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledCourses.map((course, index) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <AccessibleCard className="p-6 h-full">
                                <div className="space-y-4">
                                    <div className="text-4xl text-center">{course.image}</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                                        <p className="text-gray-400 mb-4">Next: {course.nextLesson}</p>
                                    </div>
                                    
                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Progress</span>
                                            <span className="text-green-400">{course.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div 
                                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${course.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>Last accessed: {course.lastAccessed}</span>
                                    </div>
                                    
                                    <Link href={`/learn/${course.id}`}>
                                        <Button className="w-full">
                                            Continue Learning
                                        </Button>
                                    </Link>
                                </div>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>

                {/* Empty State */}
                {enrolledCourses.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-bold text-white mb-2">No courses yet</h3>
                        <p className="text-gray-400 mb-4">Start your Ubuntu learning journey</p>
                        <Link href="/courses">
                            <Button>Browse Ubuntu Courses</Button>
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl mb-4 text-purple-400">
                                    +
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-center">Find More Courses</h3>
                                <p className="text-blue-200 text-center text-sm">
                                    Browse our catalog and enroll in new classes
                                </p>
                            </GlassCard>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
