'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { PremiumButton } from '../components/PremiumButton';
import { Navbar } from '../components/Navbar';

interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    instructorId: string;
    duration: string;
    level: string;
    category: string;
    image?: string;
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('http://localhost:4201/api/courses');
                if (!response.ok) throw new Error('Failed to fetch courses');
                const data = await response.json();

                // Add random emoji images if missing
                const coursesWithImages = data.map((course: any) => ({
                    ...course,
                    image: course.image || ['🐍', '🌐', '📊', '⚛️', '🎨', '📱', '🔒', '☁️'][Math.floor(Math.random() * 8)]
                }));

                setCourses(coursesWithImages);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const categories = ['All', ...Array.from(new Set(courses.map(c => c.category)))];

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <main className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black text-white pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Explore Courses
                    </h1>
                    <p className="text-blue-200 text-xl max-w-2xl mx-auto">
                        Expand your knowledge with our premium course catalog.
                    </p>
                </motion.div>

                {/* Search and Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                        />
                        <PremiumButton size="lg" className="md:w-48">
                            Search
                        </PremiumButton>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors border border-white/10 ${selectedCategory === category
                                    ? 'bg-blue-600 text-white border-blue-500'
                                    : 'bg-white/5 text-blue-200 hover:bg-white/10'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map((course, index) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 + 0.2 }}
                        >
                            <Link href={`/courses/${course.id}`}>
                                <GlassCard className="h-full flex flex-col group hover:border-blue-500/50 transition-all cursor-pointer overflow-hidden">
                                    <div className="h-48 bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center text-6xl relative overflow-hidden">
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                        <span className="relative z-10 transform group-hover:scale-110 transition-transform duration-500">
                                            {course.image}
                                        </span>
                                        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                                            {course.level}
                                        </div>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="text-xs text-blue-300 mb-2 uppercase tracking-wider font-semibold">
                                            {course.category}
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                                            {course.title}
                                        </h3>
                                        <p className="text-blue-200/70 text-sm mb-4 line-clamp-2 flex-1">
                                            {course.description}
                                        </p>

                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-2 text-sm text-blue-200">
                                                <span>⏱️</span> {course.duration}m
                                            </div>
                                            <div className="font-bold text-green-400">
                                                {course.price === 0 ? 'Free' : `$${course.price}`}
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </main>
    );
}
