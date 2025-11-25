'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Video, Users, Calendar, Filter, Search } from 'lucide-react';

export default function SessionsPage() {
    const router = useRouter();

    const sessions = [
        { id: 1, title: 'Advanced Mathematics', instructor: 'Dr. Smith', participants: 24, date: 'Today, 2:00 PM', status: 'upcoming', category: 'Math' },
        { id: 2, title: 'Physics Lab', instructor: 'Prof. Johnson', participants: 18, date: 'Today, 4:00 PM', status: 'upcoming', category: 'Science' },
        { id: 3, title: 'Chemistry 101', instructor: 'Dr. Lee', participants: 30, date: 'Tomorrow, 10:00 AM', status: 'upcoming', category: 'Science' },
        { id: 4, title: 'Biology Seminar', instructor: 'Prof. Davis', participants: 25, date: 'Tomorrow, 2:00 PM', status: 'upcoming', category: 'Science' },
    ];

    return (
        <AppLayout appName="Azora Classroom" userName="Educator">
            <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>All Sessions</GradientText>
                    </h1>
                    <p className="text-gray-400">Browse and join live classroom sessions</p>
                </motion.div>

                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search sessions..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-card/50 border border-border focus:border-primary outline-none"
                        />
                    </div>
                    <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sessions.map((session, i) => (
                        <motion.div key={session.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}>
                            <AccessibleCard className="p-6 hover:border-primary/50 transition-all cursor-pointer">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-2">{session.title}</h3>
                                        <p className="text-gray-400 text-sm mb-3">{session.instructor}</p>
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400">
                                            {session.category}
                                        </span>
                                    </div>
                                    <Video className="h-6 w-6 text-green-400" />
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            {session.participants}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {session.date}
                                        </span>
                                    </div>
                                    <Button variant="primary" size="sm">Join</Button>
                                </div>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
