'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

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
                {!lesson.videoUrl && (
                    <div className="bg-white/5 rounded-lg p-12 text-center mb-6">
                        <div className="text-6xl mb-4">🚧</div>
                        <h3 className="text-2xl font-bold mb-2">Content Coming Soon</h3>
                        <p className="text-blue-200">This lesson will be available soon!</p>
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
