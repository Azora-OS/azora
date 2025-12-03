'use client';

import { motion } from 'framer-motion';

interface CourseProgressProps {
    progress: number; // 0 to 100
    totalModules: number;
    completedModules: number;
}

export default function CourseProgress({ progress, totalModules, completedModules }: CourseProgressProps) {
    return (
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Your Progress</h3>
                <span className="text-2xl font-bold text-purple-400">{Math.round(progress)}%</span>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
                <motion.div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </div>

            <div className="flex justify-between text-sm text-blue-200">
                <span>{completedModules} of {totalModules} modules completed</span>
                {progress === 100 ? (
                    <span className="text-green-400 font-bold">Completed! 🏆</span>
                ) : (
                    <span>Keep going! 🚀</span>
                )}
            </div>
        </div>
    );
}
