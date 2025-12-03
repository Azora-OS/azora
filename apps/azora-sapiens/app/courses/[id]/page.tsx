'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { GlassCard } from '../../components/GlassCard';
import { PremiumButton } from '../../components/PremiumButton';
import EnrollmentButton from '../../components/EnrollmentButton';
import CourseProgress from '../../components/CourseProgress';
import { Navbar } from '../../components/Navbar';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe (use env var in real app)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

export default function CourseDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;


    const [isEnrolled, setIsEnrolled] = useState(false);
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch course details
    React.useEffect(() => {
        const fetchCourse = async () => {
            if (!id) return;

            try {
                const response = await fetch(`http://localhost:4201/api/courses/${id}`);
                if (!response.ok) throw new Error('Failed to fetch course details');
                const data = await response.json();

                // Map API modules to syllabus structure
                if (data.modules && data.modules.length > 0) {
                    data.syllabus = data.modules.map((module: any) => {
                        let topics = [];
                        try {
                            const content = JSON.parse(module.content);
                            if (content.lessons) {
                                topics = content.lessons.map((l: any) => l.title);
                            }
                        } catch (e) {
                            // If content isn't JSON or lessons missing, use description
                            topics = [module.description];
                        }
                        return {
                            title: module.title,
                            topics: topics.length > 0 ? topics : ['No lessons available']
                        };
                    });
                } else if (!data.syllabus) {
                    // Fallback mock syllabus
                    data.syllabus = [
                        { title: 'Module 1: Getting Started', topics: ['Introduction', 'Setup', 'Basics'] },
                        { title: 'Module 2: Core Concepts', topics: ['Fundamentals', 'Deep Dive', 'Practice'] },
                        { title: 'Module 3: Advanced Topics', topics: ['Optimization', 'Security', 'Deployment'] },
                    ];
                }

                // Add emoji if missing
                if (!data.image) {
                    data.image = ['🐍', '🌐', '📊', '⚛️', '🎨', '📱', '🔒', '☁️'][Math.floor(Math.random() * 8)];
                }

                setCourse(data);
            } catch (err) {
                console.error('Error fetching course:', err);
                setError('Failed to load course details');
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [id]);



    if (loading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e3a8a] text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
            </main>
        );
    }

    if (error || !course) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e3a8a] text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
                    <p className="text-blue-200 mb-8">{error || 'The requested course could not be found.'}</p>
                    <PremiumButton onClick={() => router.push('/courses')}>
                        Back to Courses
                    </PremiumButton>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e3a8a] text-white pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <GlassCard className="p-8 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">
                                    {course.image}
                                </div>
                                <div className="relative z-10">
                                    <div className="flex gap-2 mb-4">
                                        <span className="bg-purple-500/20 text-purple-200 px-3 py-1 rounded-full text-sm font-medium">
                                            {course.category || 'General'}
                                        </span>
                                        <span className="bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                                            {course.level || 'All Levels'}
                                        </span>
                                    </div>
                                    <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                                    <p className="text-xl text-blue-200 mb-6">{course.description}</p>

                                    <div className="flex items-center gap-6 text-sm text-blue-300">
                                        <div className="flex items-center gap-2">
                                            <span>👨‍🏫</span> {course.instructorId || 'Azora Instructor'}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span>⏱️</span> {course.duration || 'Self-paced'} minutes
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span>🎓</span> Certificate of Completion
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h2 className="text-2xl font-bold mb-4">Course Syllabus</h2>
                            <div className="space-y-4">
                                {course.syllabus && course.syllabus.map((week: any, index: number) => (
                                    <GlassCard key={index} className="p-6">
                                        <h3 className="text-lg font-bold mb-2 text-purple-300">{week.title}</h3>
                                        <ul className="list-disc list-inside text-blue-200 space-y-1">
                                            {week.topics.map((topic: string, i: number) => (
                                                <li key={i}>{topic}</li>
                                            ))}
                                        </ul>
                                    </GlassCard>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <GlassCard className="p-6 sticky top-24">
                                <div className="text-3xl font-bold mb-2">
                                    {course.price === 0 ? 'Free' : `$${course.price}`}
                                </div>
                                <p className="text-blue-200 text-sm mb-6">One-time payment. Lifetime access.</p>

                                {isEnrolled ? (
                                    <CourseProgress
                                        progress={course.progress || 0}
                                        totalModules={course.syllabus?.length || 0}
                                        completedModules={course.completedModules || 0}
                                    />
                                ) : (
                                    <EnrollmentButton
                                        courseId={id}
                                        userId="user_123" // TODO: Replace with real user ID
                                        isEnrolled={isEnrolled}
                                    />
                                )}

                                <div className="space-y-3 text-sm text-blue-200">
                                    <div className="flex items-center gap-2">
                                        <span>✅</span> Full lifetime access
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>✅</span> Access on mobile and TV
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>✅</span> Certificate of completion
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>✅</span> 30-Day Money-Back Guarantee
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    );
}
