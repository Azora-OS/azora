'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, MessageSquare, FileText, Video } from 'lucide-react';

export default function CollaboratePage() {
    const router = useRouter();

    const team = [
        { id: 1, name: 'Dr. Sarah Smith', role: 'Lead Researcher', avatar: 'SS', status: 'online' },
        { id: 2, name: 'Prof. Mike Johnson', role: 'Co-Investigator', avatar: 'MJ', status: 'offline' },
        { id: 3, name: 'Dr. Emily Lee', role: 'Research Assistant', avatar: 'EL', status: 'online' },
    ];

    return (
        <AppLayout appName="Azora Research Center" userName="Researcher">
            <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Collaboration Workspace</GradientText>
                    </h1>
                    <p className="text-gray-400">Work together with your research team</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <AccessibleCard className="p-6">
                            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="outline" className="justify-start">
                                    <MessageSquare className="h-5 w-5 mr-3" />
                                    Team Chat
                                </Button>
                                <Button variant="outline" className="justify-start">
                                    <FileText className="h-5 w-5 mr-3" />
                                    Shared Documents
                                </Button>
                                <Button variant="outline" className="justify-start">
                                    <Video className="h-5 w-5 mr-3" />
                                    Video Call
                                </Button>
                                <Button variant="outline" className="justify-start">
                                    <Users className="h-5 w-5 mr-3" />
                                    Meetings
                                </Button>
                            </div>
                        </AccessibleCard>
                    </div>

                    <div>
                        <AccessibleCard className="p-6">
                            <h2 className="text-xl font-bold mb-4">Team Members</h2>
                            <div className="space-y-3">
                                {team.map(member => (
                                    <div key={member.id} className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold">
                                                {member.avatar}
                                            </div>
                                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${member.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                                                }`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-sm">{member.name}</div>
                                            <div className="text-gray-400 text-xs">{member.role}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AccessibleCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
