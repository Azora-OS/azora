import React, { useEffect, useState } from 'react';
import { BookOpen, Award, Brain } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { PremiumCard } from '@/components/education/PremiumCard';
import { CardSkeleton } from '@/components/education/LoadingSkeleton';
import { motion } from 'framer-motion';
import { staggerContainer } from '@/lib/animations';

export const PrimaryView: React.FC = () => {
    const [grades, setGrades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const data = await apiClient.getPrimaryGrades();
                setGrades(data as any[]);
            } catch (error) {
                console.error('Failed to fetch primary grades:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchGrades();
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
                <h2 className="text-2xl font-bold text-white mb-2">Primary Education (Grades R-7)</h2>
                <p className="text-white/60">Foundation for lifelong learning, powered by AI tutors.</p>
            </div>

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
                        className="p-6 group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xl">
                                {grade.gradeLevel}
                            </div>
                            <Award className="text-white/20 group-hover:text-yellow-400 transition-colors" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Grade {grade.gradeLevel}</h3>
                        <div className="space-y-2 mb-4">
                            {grade.subjects.slice(0, 3).map((subject: any) => (
                                <div key={subject.id} className="flex items-center gap-2 text-sm text-white/60">
                                    <BookOpen size={14} />
                                    <span>{subject.name}</span>
                                </div>
                            ))}
                            {grade.subjects.length > 3 && (
                                <div className="text-xs text-white/40 pl-6">+{grade.subjects.length - 3} more subjects</div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-full w-fit">
                            <Brain size={12} />
                            <span>AI Tutor Available</span>
                        </div>
                    </PremiumCard>
                ))}
            </motion.div>
        </div>
    );
};

