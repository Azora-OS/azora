// UPDATED CoursePlayer with all new interactive learning components - v2.0
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, Settings, Maximize, ChevronRight, Sparkles, Palette, Code2, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CodeEditor } from './components/CodeEditor';
import { RichNoteEditor } from './components/RichNoteEditor';
import { Whiteboard } from './components/Whiteboard';
import { ElaraCanvas } from './components/ElaraCanvas';
import { SimulationViewer } from './SimulationViewer';
import { VideoPlayer } from '../education/VideoPlayer';

interface CoursePlayerProps {
    courseId: string;
    onBack: () => void;
    subject?: string;
    grade?: string;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({ courseId, onBack, subject = 'General', grade = 'All' }) => {
    const [activeTab, setActiveTab] = useState<'video' | 'ide' | 'simulation' | 'notes' | 'whiteboard' | 'elara'>('elara');
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <div className="flex h-full overflow-hidden bg-black text-white">
            {/* Main Workspace */}
            <div className="flex-1 flex flex-col min-w-0 relative group">
                {/* Content Tabs */}
                <div className="h-12 flex border-b border-white/10 bg-black/20 overflow-x-auto">
                    {[
                        { id: 'elara', label: '🌟 Elara Teaches', icon: Sparkles },
                        { id: 'video', label: '🎥 Lesson Video', icon: Play },
                        { id: 'ide', label: '💻 Code Editor', icon: Code2 },
                        { id: 'simulation', label: '🧪 Simulations', icon: null },
                        { id: 'whiteboard', label: '🎨 Whiteboard', icon: Palette },
                        { id: 'notes', label: '📝 Notes', icon: FileText }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "px-6 text-sm font-medium transition-all border-b-2 whitespace-nowrap flex items-center gap-2",
                                activeTab === tab.id
                                    ? "text-white border-purple-500 bg-white/5"
                                    : "text-gray-400 border-transparent hover:text-white hover:bg-white/5"
                            )}
                        >
                            {tab.icon && <tab.icon className="w-4 h-4" />}
                            {tab.label}
                        </button>
                    ))}
                    <button
                        onClick={onBack}
                        className="ml-auto px-4 text-sm text-gray-400 hover:text-white flex items-center gap-1"
                    >
                        Exit <ChevronRight size={14} />
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 relative bg-black overflow-hidden">
                    <AnimatePresence mode="wait">
                        {activeTab === 'elara' && (
                            <motion.div
                                key="elara"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 p-4"
                            >
                                <ElaraCanvas subject={subject} grade={grade} />
                            </motion.div>
                        )}

                        {activeTab === 'video' && (
                            <motion.div
                                key="video"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 p-8"
                            >
                                <VideoPlayer
                                    url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                                    title={`Introduction to ${subject} - Part 1: Fundamentals`}
                                    onProgress={(progress: number) => {
                                        // Save progress to API
                                        console.log('Video progress:', progress);
                                    }}
                                    onComplete={() => {
                                        console.log('Video completed!');
                                    }}
                                />
                            </motion.div>
                        )}

                        {activeTab === 'ide' && (
                            <motion.div
                                key="ide"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 p-4"
                            >
                                <CodeEditor />
                            </motion.div>
                        )}

                        {activeTab === 'simulation' && (
                            <motion.div
                                key="simulation"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 p-4"
                            >
                                <SimulationViewer />
                            </motion.div>
                        )}

                        {activeTab === 'whiteboard' && (
                            <motion.div
                                key="whiteboard"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 p-4"
                            >
                                <Whiteboard />
                            </motion.div>
                        )}

                        {activeTab === 'notes' && (
                            <motion.div
                                key="notes"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 p-4"
                            >
                                <RichNoteEditor />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
