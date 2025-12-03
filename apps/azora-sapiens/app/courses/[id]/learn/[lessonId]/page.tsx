'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AzStudio } from '@azora/shared-design';

export default function LessonPlayer() {
    const params = useParams();
    const router = useRouter();
    const { id: courseId, lessonId } = params;
    const [lesson, setLesson] = useState<any>(null);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        // Fetch lesson data
        fetch(`/api/lessons/${lessonId}`)
            .then(r => r.json())
            .then(setLesson);
    }, [lessonId]);

    const markComplete = async () => {
        await fetch(`/api/lessons/${lessonId}/complete`, {
            method: 'POST',
            body: JSON.stringify({ completed: true })
        });
        setCompleted(true);
    };

    if (!lesson) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e3a8a] text-white p-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => router.push(`/courses/${courseId}`)} className="mb-4 text-blue-300">
                    ← Back to Course
                </button>

                <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>

                {/* Video Player */}
                {lesson.type === 'video' && lesson.videoUrl && (
                    <div className="aspect-video bg-black rounded-lg mb-6">
                        <iframe
                            src={lesson.videoUrl}
                            className="w-full h-full rounded-lg"
                            allowFullScreen
                        />
                    </div>
                )}

                {/* Coming Soon */}
                {!lesson.videoUrl && lesson.type !== 'code' && (
                    <div className="bg-white/5 rounded-lg p-12 text-center mb-6">
                        <div className="text-6xl mb-4">🚧</div>
                        <h3 className="text-2xl font-bold mb-2">Content Coming Soon</h3>
                        <p className="text-blue-200">This lesson will be available soon!</p>
                    </div>
                )}

                {/* AzStudio Coding Environment */}
                {lesson.type === 'code' && (
                    <div className="h-[600px] bg-black/40 rounded-lg border border-white/10 overflow-hidden mb-6 flex flex-col">
                        <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex justify-between items-center">
                            <span className="font-mono text-sm text-blue-300">Interactive Lab</span>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 bg-green-600/20 text-green-400 text-xs rounded hover:bg-green-600/30 transition-colors">
                                    Run Code
                                </button>
                                <button className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs rounded hover:bg-blue-600/30 transition-colors">
                                    Reset
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <AzStudio
                                code={lesson.initialCode || '// Write your solution here\n\nfunction solve() {\n  return true;\n}'}
                                language="typescript"
                                onChange={(val) => console.log(val)}
                            />
                        </div>
                    </div>
                )}

                <div className="flex justify-between">
                    <button className="px-6 py-3 bg-white/10 rounded-lg">← Previous</button>
                    <button onClick={markComplete} className="px-6 py-3 bg-purple-600 rounded-lg">
                        {completed ? 'Next Lesson →' : 'Mark Complete'}
                    </button>
                </div>
            </div>
        </div>
    );
}
