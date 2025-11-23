import React, { useState } from 'react';
import { GraduationCap, School, BookOpen, LayoutGrid, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimaryView } from './education/PrimaryView';
import { SecondaryView } from './education/SecondaryView';
import { UniversityView } from './education/UniversityView';
import { CoursePlayer } from '@/components/education/CoursePlayer';
import { PremiumCard } from '@/components/education/PremiumCard';
import { fadeIn, staggerContainer } from '@/lib/animations';


type EducationStage = 'portal' | 'primary' | 'secondary' | 'university';

export const LearnApp: React.FC = () => {
    const [stage, setStage] = useState<EducationStage>('portal');
    const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

    const handleCourseSelect = (courseId: string) => {
        setActiveCourseId(courseId);
    };

    const handleBackToCatalog = () => {
        setActiveCourseId(null);
    };

    const renderContent = () => {
        if (activeCourseId) {
            return <CoursePlayer courseId={activeCourseId} onBack={handleBackToCatalog} />;
        }

        switch (stage) {
            case 'primary':
                return <PrimaryView />;
            case 'secondary':
                return <SecondaryView />;
            case 'university':
                return <UniversityView onCourseSelect={handleCourseSelect} />;
            default:
                return (
                    <div className="p-8 max-w-6xl mx-auto">
                        <motion.div
                            initial="initial"
                            animate="animate"
                            variants={staggerContainer}
                            className="text-center mb-12"
                        >
                            <motion.h1 variants={fadeIn} className="text-5xl font-bold text-white mb-4 tracking-tight">
                                Azora <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Education</span>
                            </motion.h1>
                            <motion.p variants={fadeIn} className="text-xl text-white/60">
                                Lifelong learning powered by Ubuntu and AI
                            </motion.p>
                        </motion.div>

                        <motion.div
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                            className="grid grid-cols-1 md:grid-cols-3 gap-8"
                        >
                            {/* Primary */}
                            <PremiumCard
                                onClick={() => setStage('primary')}
                                delay={0.1}
                                className="p-8 h-full flex flex-col items-center text-center group border-purple-500/20"
                            >
                                <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                                    <School className="w-10 h-10 text-purple-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Primary</h2>
                                <p className="text-white/60 mb-6">Grades R - 7</p>
                                <ul className="space-y-3 text-sm text-white/70 text-left w-full">
                                    <li className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                        Foundation Phase
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                        AI Tutors
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                        Gamified Learning
                                    </li>
                                </ul>
                            </PremiumCard>

                            {/* Secondary */}
                            <PremiumCard
                                onClick={() => setStage('secondary')}
                                delay={0.2}
                                className="p-8 h-full flex flex-col items-center text-center group border-blue-500/20"
                            >
                                <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                                    <BookOpen className="w-10 h-10 text-blue-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Secondary</h2>
                                <p className="text-white/60 mb-6">Grades 8 - 12</p>
                                <ul className="space-y-3 text-sm text-white/70 text-left w-full">
                                    <li className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                        NSC Preparation
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                        Career Streams
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                        Exam Support
                                    </li>
                                </ul>
                            </PremiumCard>

                            {/* University */}
                            <PremiumCard
                                onClick={() => setStage('university')}
                                delay={0.3}
                                className="p-8 h-full flex flex-col items-center text-center group border-cyan-500/20"
                            >
                                <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors">
                                    <GraduationCap className="w-10 h-10 text-cyan-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">University</h2>
                                <p className="text-white/60 mb-6">Higher Education</p>
                                <ul className="space-y-3 text-sm text-white/70 text-left w-full">
                                    <li className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                        Degrees & Diplomas
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                        Research Hub
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                        Industry Certs
                                    </li>
                                </ul>
                            </PremiumCard>
                        </motion.div>
                    </div>
                );
        }
    };

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
            {/* Header - Only show if not in course player (player has its own header) */}
            {!activeCourseId && (
                <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-white/5 backdrop-blur-md z-10">
                    {stage !== 'portal' && (
                        <button
                            onClick={() => setStage('portal')}
                            className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <ChevronLeft size={20} />
                            <span className="text-sm font-medium">Back to Portal</span>
                        </button>
                    )}
                    <div className="flex-1" />
                    <h1 className="text-sm font-medium text-white/40 uppercase tracking-wider">
                        {stage === 'portal' ? 'Azora Education' :
                            stage === 'primary' ? 'Primary School' :
                                stage === 'secondary' ? 'High School' : 'University'}
                    </h1>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCourseId ? 'player' : stage}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

