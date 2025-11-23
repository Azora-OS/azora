import React, { useState } from 'react';
import { GlassCard } from './components/GlassCard';
import { PremiumButton } from './components/PremiumButton';
import { ChatWidget } from './components/ChatWidget';
import { motion } from 'framer-motion';

function App() {
    const [activeTab, setActiveTab] = useState('courses');
    const [chatMessages, setChatMessages] = useState([]);

    const handleSendMessage = async (message) => {
        // Add user message
        const userMessage = {
            id: Date.now().toString(),
            content: message,
            sender: 'user',
            timestamp: new Date(),
        };
        setChatMessages(prev => [...prev, userMessage]);

        // Simulate AI response (mock for now)
        setTimeout(() => {
            const aiMessage = {
                id: (Date.now() + 1).toString(),
                content: "I'm here to help you learn! That's a great question about " + message,
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
            title: 'Python for Finance',
            instructor: 'Dr. Sarah Chen',
            progress: 45,
            image: '🐍',
            color: 'from-blue-500 to-cyan-500',
            level: 'Intermediate'
        },
        {
            id: 2,
            title: 'Web Development Bootcamp',
            instructor: 'Mark Johnson',
            progress: 12,
            image: '💻',
            color: 'from-purple-500 to-pink-500',
            level: 'Beginner'
        },
        {
            id: 3,
            title: 'AI & Machine Learning',
            instructor: 'Elara AI',
            progress: 0,
            image: '🤖',
            color: 'from-emerald-500 to-teal-500',
            level: 'Advanced'
        }
    ];

    return (
        <div className="min-h-screen pb-20">
            {/* Navigation */}
            <nav className="sticky top-0 z-40 bg-[#1e1b4b]/80 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                L
                            </div>
                            <span className="text-xl font-bold text-white">Azora Learn</span>
                        </div>
                        <div className="flex gap-4">
                            <PremiumButton variant="ghost" size="sm">My Courses</PremiumButton>
                            <PremiumButton variant="ghost" size="sm">Catalog</PremiumButton>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                👤
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-4">
                        Welcome back, <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Student</span>
                    </h1>
                    <p className="text-blue-200">Continue your learning journey today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <GlassCard className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl">
                                📚
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">12</div>
                                <div className="text-sm text-blue-200">Hours Learned</div>
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-2xl">
                                🏆
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">3</div>
                                <div className="text-sm text-blue-200">Certificates</div>
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl">
                                🔥
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">5</div>
                                <div className="text-sm text-blue-200">Day Streak</div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Continue Learning */}
                <h2 className="text-2xl font-bold mb-6">Continue Learning</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {courses.map((course) => (
                        <GlassCard key={course.id} className="overflow-hidden group cursor-pointer">
                            <div className={`h-32 bg-gradient-to-br ${course.color} p-6 relative`}>
                                <div className="text-4xl">{course.image}</div>
                                <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white">
                                    {course.level}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-sm text-blue-200 mb-4">{course.instructor}</p>

                                <div className="mb-4">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-blue-200">Progress</span>
                                        <span className="text-white">{course.progress}%</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                            style={{ width: `${course.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <PremiumButton variant="outline" size="sm" className="w-full">
                                    {course.progress > 0 ? 'Continue' : 'Start Course'}
                                </PremiumButton>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                {/* Recommended Section */}
                <h2 className="text-2xl font-bold mb-6">Recommended for You</h2>
                <GlassCard className="p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Master Full Stack Development</h3>
                            <p className="text-blue-200 mb-6 max-w-xl">
                                Learn to build modern web applications from scratch. Includes React, Node.js, and Database design.
                            </p>
                            <div className="flex gap-4">
                                <PremiumButton>Enroll Now</PremiumButton>
                                <PremiumButton variant="ghost">View Syllabus</PremiumButton>
                            </div>
                        </div>
                        <div className="text-6xl">🚀</div>
                    </div>
                </GlassCard>
            </main>

            <ChatWidget
                onSendMessage={handleSendMessage}
                messages={chatMessages}
                aiMember="Elara"
            />
        </div>
    );
}

export default App;
