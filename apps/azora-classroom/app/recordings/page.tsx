'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PlayCircle, Download, Clock } from 'lucide-react';

export default function RecordingsPage() {
    const router = useRouter();

    const recordings = [
        { id: 1, title: 'Advanced Mathematics - Lecture 5', instructor: 'Dr. Smith', duration: '1h 45m', date: '2025-11-20', views: 234 },
        { id: 2, title: 'Physics Lab - Quantum Mechanics', instructor: 'Prof. Johnson', duration: '2h 15m', date: '2025-11-18', views: 189 },
        { id: 3, title: 'Chemistry 101 - Organic Chemistry', instructor: 'Dr. Lee', duration: '1h 30m', date: '2025-11-15', views: 312 },
    ];

    return (
        <AppLayout appName="Azora Classroom" userName="Educator">
            <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Recordings</GradientText>
                    </h1>
                    <p className="text-gray-400">Access recorded classroom sessions</p>
                </motion.div>

                <div className="space-y-4">
                    {recordings.map((recording, i) => (
                        <motion.div key={recording.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}>
                            <AccessibleCard className="p-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-40 h-24 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                                        <PlayCircle className="h-12 w-12 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-1">{recording.title}</h3>
                                        <p className="text-gray-400 text-sm mb-2">{recording.instructor}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {recording.duration}
                                            </span>
                                            <span>{recording.date}</span>
                                            <span>{recording.views} views</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="primary">
                                            <PlayCircle className="h-4 w-4 mr-2" />
                                            Watch
                                        </Button>
                                        <Button variant="outline">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
