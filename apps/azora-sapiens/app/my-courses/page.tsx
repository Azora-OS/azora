'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { PremiumButton } from '../components/PremiumButton';
import { Navbar } from '../components/Navbar';

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
    return (
        <main className="min-h-screen bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e3a8a] text-white pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold mb-4">My Learning</h1>
                    <p className="text-blue-200">Continue where you left off.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ENROLLED_COURSES.map((course, index) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <GlassCard className="h-full flex flex-col p-6 group hover:border-purple-500/50 transition-colors">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-2xl">
                                        {course.image}
                                    </div>
                                    <div className="text-xs text-blue-300 bg-white/5 px-2 py-1 rounded-full">
                                        {course.lastAccessed}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-2 group-hover:text-purple-300 transition-colors">
                                    {course.title}
                                </h3>

                                <div className="mb-4">
                                    <div className="flex justify-between text-sm text-blue-200 mb-1">
                                        <span>Progress</span>
                                        <span>{course.progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                            style={{ width: `${course.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <p className="text-sm text-blue-300 mb-4">
                                        Next: <span className="text-white">{course.nextLesson}</span>
                                    </p>
                                    <Link href={`/courses/${course.id}`}>
                                        <PremiumButton variant="secondary" className="w-full justify-center">
                                            Continue Learning
                                        </PremiumButton>
                                    </Link>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}

                    {/* Add New Course Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: ENROLLED_COURSES.length * 0.1 }}
                    >
                        <Link href="/courses">
                            <GlassCard className="h-full flex flex-col items-center justify-center p-6 border-dashed border-2 border-white/10 hover:border-purple-500/50 hover:bg-white/5 transition-all cursor-pointer min-h-[250px]">
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
