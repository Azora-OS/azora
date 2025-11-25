'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Video } from 'lucide-react';
import { useState } from 'react';

export default function CreateSessionPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [duration, setDuration] = useState('60');

    return (
        <AppLayout appName="Azora Classroom" userName="Educator">
            <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Button variant="outline" onClick={() => router.push('/')} className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Create Session</GradientText>
                    </h1>
                    <p className="text-gray-400">Schedule a new live classroom session</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <AccessibleCard className="p-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold mb-2">Session Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Advanced Mathematics"
                                    className="w-full px-4 py-3 rounded-xl bg-card/50 border border-border focus:border-primary outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What will you cover in this session?"
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl bg-card/50 border border-border focus:border-primary outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2">Date</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-card/50 border border-border focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2">Time</label>
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-card/50 border border-border focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2">Duration (minutes)</label>
                                <select
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-card/50 border border-border focus:border-primary outline-none"
                                >
                                    <option value="30">30 minutes</option>
                                    <option value="60">1 hour</option>
                                    <option value="90">1.5 hours</option>
                                    <option value="120">2 hours</option>
                                </select>
                            </div>

                            <Button variant="primary" className="w-full" disabled={!title || !date || !time}>
                                <Video className="h-5 w-5 mr-2" />
                                Create Session
                            </Button>
                        </div>
                    </AccessibleCard>
                </motion.div>
            </div>
        </AppLayout>
    );
}
