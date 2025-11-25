'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GlassCard } from '../../components/GlassCard';
import { PremiumButton } from '../../components/PremiumButton';

// Mock data
const COURSE_CONTENT = {
    id: '1',
    title: 'Introduction to Python',
    modules: [
        {
            id: 'm1',
            title: 'Module 1: Getting Started',
            lessons: [
                { id: 'l1', title: 'Welcome to the Course', duration: '5:00', type: 'video', completed: true, hasAudio: true },
                { id: 'l2', title: 'Installing Python', duration: '10:00', type: 'video', completed: true, hasAudio: true },
                { id: 'l3', title: 'Your First Script', duration: '15:00', type: 'video', completed: false, hasAudio: true },
                { id: 'q1', title: 'Setup Quiz', duration: '5 min', type: 'quiz', completed: false, hasAudio: false },
            ]
        },
        {
            id: 'm2',
            title: 'Module 2: Variables & Data Types',
            lessons: [
                { id: 'l4', title: 'Variables', duration: '12:00', type: 'video', completed: false, hasAudio: true },
                { id: 'l5', title: 'Strings and Numbers', duration: '18:00', type: 'video', completed: false, hasAudio: true },
            ]
        }
    ]
};

export default function CourseViewerPage({ params }: { params: { courseId: string } }) {
    const [activeLesson, setActiveLesson] = useState(COURSE_CONTENT.modules[0].lessons[2]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(450); // 7:30 in seconds
    const audioRef = useRef<HTMLAudioElement>(null);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
            {/* Header */}
            <header className="h-16 bg-[#1e293b] border-b border-white/10 flex items-center justify-between px-4 z-20">
                <div className="flex items-center gap-4">
                    <Link href="/my-courses" className="text-blue-300 hover:text-white">
                        ← Back
                    </Link>
                    <h1 className="font-bold truncate">{COURSE_CONTENT.title}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:block text-sm text-blue-300">
                        Progress: 35%
                    </div>
                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden hidden md:block">
                        <div className="h-full bg-green-500 w-[35%]" />
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-black relative">
                    <div className="aspect-video w-full bg-black flex items-center justify-center">
                        {activeLesson.type === 'video' ? (
                            <div className="text-center w-full px-4">
                                <div className="text-6xl mb-4">🎧</div>
                                <h2 className="text-2xl font-bold mb-2">{activeLesson.title}</h2>
                                <p className="text-blue-300 mb-8">Audio Lesson by Elara AI</p>

                                {/* Audio Player */}
                                {activeLesson.hasAudio && (
                                    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/30 backdrop-blur-lg">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={togglePlay}
                                                className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                                            >
                                                <span className="text-2xl">{isPlaying ? '⏸️' : '▶️'}</span>
                                            </button>
                                            <div className="flex-1">
                                                <div className="text-sm text-purple-200 mb-2 font-medium">Narrated by Elara</div>
                                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                                                        style={{ width: `${(currentTime / duration) * 100}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-xs text-purple-300 mt-1">
                                                    <span>{formatTime(currentTime)}</span>
                                                    <span>{formatTime(duration)}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                                    <span className="text-lg">🔊</span>
                                                </button>
                                                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                                    <span className="text-lg">⚙️</span>
                                                </button>
                                            </div>
                                        </div>
                                        <audio
                                            ref={audioRef}
                                            src="/audio/sample-lesson.mp3"
                                            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                                            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                                            className="hidden"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="text-6xl mb-4">📝</div>
                                <h2 className="text-2xl font-bold">{activeLesson.title}</h2>
                                <PremiumButton className="mt-4">Start Quiz</PremiumButton>
                            </div>
                        )}
                    </div>

                    <div className="p-8 max-w-4xl mx-auto">
                        <h1 className="text-2xl font-bold mb-4">{activeLesson.title}</h1>
                        <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-6">
                            <h3 className="font-bold mb-2 text-purple-300">📝 Transcript</h3>
                            <p className="text-blue-200 leading-relaxed">
                                Welcome to this lesson on {activeLesson.title}. In this comprehensive tutorial,
                                we'll explore the fundamental concepts and practical applications.
                                You'll learn through clear explanations, code examples, and hands-on exercises.
                                [Full AI-generated transcript would appear here]
                            </p>
                        </div>

                        <div className="mt-8 flex justify-between">
                            <PremiumButton variant="secondary">Previous Lesson</PremiumButton>
                            <PremiumButton>Next Lesson</PremiumButton>
                        </div>
                    </div>
                </main>

                {/* Sidebar */}
                <aside className={`w-80 bg-[#1e293b] border-l border-white/10 overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full absolute right-0 h-full'}`}>
                    <div className="p-4 font-bold border-b border-white/10 flex justify-between items-center">
                        <span>Course Content</span>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden">✕</button>
                    </div>

                    <div className="p-4 space-y-6">
                        {COURSE_CONTENT.modules.map((module) => (
                            <div key={module.id}>
                                <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wider mb-3">
                                    {module.title}
                                </h3>
                                <div className="space-y-1">
                                    {module.lessons.map((lesson) => (
                                        <button
                                            key={lesson.id}
                                            onClick={() => setActiveLesson(lesson)}
                                            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeLesson.id === lesson.id
                                                ? 'bg-blue-600 text-white'
                                                : 'hover:bg-white/5 text-blue-200'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${lesson.completed
                                                ? 'border-green-500 bg-green-500 text-black'
                                                : 'border-blue-400'
                                                }`}>
                                                {lesson.completed && '✓'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium">{lesson.title}</div>
                                                <div className="text-xs opacity-70 flex items-center gap-1">
                                                    {lesson.duration}
                                                    {lesson.hasAudio && <span className="text-purple-400">🎧</span>}
                                                </div>
                                            </div>
                                            <div className="text-xs">
                                                {lesson.type === 'video' ? '📺' : '📝'}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
}
