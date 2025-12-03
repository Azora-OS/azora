'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FlaskConical, Users, DollarSign, Plus, Filter } from 'lucide-react';

export default function ProjectsPage() {
    const router = useRouter();

    const projects = [
        { id: 1, title: 'Quantum Computing Research', status: 'active', team: 8, progress: 65, funding: '$250K', category: 'Physics' },
        { id: 2, title: 'AI Ethics Framework', status: 'active', team: 5, progress: 42, funding: '$180K', category: 'Computer Science' },
        { id: 3, title: 'Climate Change Modeling', status: 'review', team: 12, progress: 88, funding: '$500K', category: 'Environmental' },
        { id: 4, title: 'Biomedical Engineering', status: 'active', team: 6, progress: 55, funding: '$320K', category: 'Biology' },
    ];

    return (
        <AppLayout appName="Azora Research Center" userName="Researcher">
            <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                <GradientText>Research Projects</GradientText>
                            </h1>
                            <p className="text-gray-400">Browse and manage research projects</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </Button>
                            <Button variant="primary">
                                <Plus className="h-4 w-4 mr-2" />
                                New Project
                            </Button>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 gap-6">
                    {projects.map((project, i) => (
                        <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}>
                            <AccessibleCard className="p-6 hover:border-primary/50 transition-all cursor-pointer">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="p-3 rounded-xl bg-blue-500/20">
                                            <FlaskConical className="h-6 w-6 text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold">{project.title}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${project.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {project.status}
                                                </span>
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400">
                                                    {project.category}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-6 text-sm text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    {project.team} members
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <DollarSign className="h-4 w-4" />
                                                    {project.funding}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-primary">{project.progress}%</div>
                                        <div className="text-gray-400 text-xs">complete</div>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                                </div>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
