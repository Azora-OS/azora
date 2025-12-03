'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Plus, Video } from 'lucide-react';

export default function SchedulePage() {
    const router = useRouter();

    const schedule = [
        { day: 'Monday', sessions: [{ time: '10:00 AM', title: 'Math 101', instructor: 'Dr. Smith' }] },
        { day: 'Tuesday', sessions: [{ time: '2:00 PM', title: 'Physics Lab', instructor: 'Prof. Johnson' }] },
        { day: 'Wednesday', sessions: [{ time: '11:00 AM', title: 'Chemistry', instructor: 'Dr. Lee' }] },
        { day: 'Thursday', sessions: [] },
        { day: 'Friday', sessions: [{ time: '3:00 PM', title: 'Biology', instructor: 'Prof. Davis' }] },
    ];

    return (
        <AppLayout appName="Azora Classroom" userName="Educator">
            <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                <GradientText>Schedule</GradientText>
                            </h1>
                            <p className="text-gray-400">Manage your classroom schedule</p>
                        </div>
                        <Button variant="primary" onClick={() => router.push('/create')}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Session
                        </Button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {schedule.map((day, i) => (
                        <motion.div key={day.day} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}>
                            <AccessibleCard className="p-4">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    {day.day}
                                </h3>
                                {day.sessions.length > 0 ? (
                                    <div className="space-y-3">
                                        {day.sessions.map((session, j) => (
                                            <div key={j} className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                                                <div className="text-xs text-gray-400 mb-1">{session.time}</div>
                                                <div className="font-bold text-sm">{session.title}</div>
                                                <div className="text-xs text-gray-400">{session.instructor}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 text-sm">No sessions</div>
                                )}
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
