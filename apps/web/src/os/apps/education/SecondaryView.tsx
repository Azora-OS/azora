import React, { useEffect, useState } from 'react';
import { BookOpen, Compass, Target, Code } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { PremiumCard } from '@/components/education/PremiumCard';
import { CardSkeleton } from '@/components/education/LoadingSkeleton';
import { motion } from 'framer-motion';
import { staggerContainer } from '@/lib/animations';

export const SecondaryView: React.FC = () => {
    const [grades, setGrades] = useState<any[]>([]);
    const [streams, setStreams] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'grades' | 'streams'>('grades');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [gradesData, streamsData] = await Promise.all([
                    apiClient.getSecondaryGrades(),
                    apiClient.getSecondaryStreams()
                ]);
                setGrades(gradesData as any[]);
                setStreams(streamsData as any[]);
            } catch (error) {
                console.error('Failed to fetch secondary education data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Secondary Education (Grades 8-12)</h2>
                <p className="text-white/60">NSC preparation and specialized career streams.</p>
            </div>

            <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
                <button
                    onClick={() => setActiveTab('grades')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'grades' ? 'bg-blue-500 text-white' : 'text-white/60 hover:bg-white/10'}`}
                >
                    Grades
                </button>
                <button
                    onClick={() => setActiveTab('streams')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'streams' ? 'bg-blue-500 text-white' : 'text-white/60 hover:bg-white/10'}`}
                >
                    Academic Streams
                </button>
            </div>

            {activeTab === 'grades' ? (
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {grades.map((grade: any, index: number) => (
                        <PremiumCard
                            key={grade.gradeLevel}
                            delay={index * 0.1}
                            className="p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white">Grade {grade.gradeLevel}</h3>
                                <span className="text-xs px-2 py-1 rounded bg-white/10 text-white/60">{grade.phase} Phase</span>
                            </div>
                            <div className="space-y-2">
                                {grade.subjects.slice(0, 4).map((subject: any) => (
                                    <div key={subject.id} className="flex items-center gap-2 text-sm text-white/60">
                                        <BookOpen size={14} />
                                        <span>{subject.name}</span>
                                    </div>
                                ))}
                            </div>
                        </PremiumCard>
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {streams.map((stream: any, index: number) => (
                        <PremiumCard
                            key={stream.id}
                            delay={index * 0.1}
                            className="p-6 bg-gradient-to-br from-white/5 to-white/0"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">{stream.name}</h3>
                                    <p className="text-sm text-white/60">{stream.description}</p>
                                </div>
                                {stream.id === 'digital-tech' && <Code className="text-blue-400" />}
                                {stream.id === 'commerce' && <Target className="text-green-400" />}
                                {stream.id === 'stem' && <Compass className="text-purple-400" />}
                            </div>
                            <div className="mb-4">
                                <h4 className="text-xs font-semibold text-white/40 uppercase mb-2">Career Paths</h4>
                                <div className="flex flex-wrap gap-2">
                                    {stream.careerPaths.slice(0, 4).map((path: string) => (
                                        <span key={path} className="text-xs px-2 py-1 rounded bg-white/10 text-white/80">{path}</span>
                                    ))}
                                </div>
                            </div>
                            <button className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white transition-colors">
                                View Stream Details
                            </button>
                        </PremiumCard>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

