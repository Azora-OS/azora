"use client";

import { AppLayout, AccessibleCard, GradientText, Button, useAwardTokens, AIFamilyChat } from "@azora/shared-design";
import { BookOpen, Brain, Trophy, Star, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function K12Page() {
    const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
    const { awardTokens, awarding } = useAwardTokens();
    const [rewardMessage, setRewardMessage] = useState<string>("");

    const gradeRanges = [
        { id: "elementary", name: "Elementary (K-5)", description: "Foundation in reading, math, science", icon: BookOpen, grades: "K-5" },
        { id: "middle", name: "Middle School (6-8)", description: "Critical thinking and exploration", icon: Brain, grades: "6-8" },
        { id: "high", name: "High School (9-12)", description: "Advanced preparation for university", icon: Trophy, grades: "9-12" }
    ];

    const subjects = [
        { id: "math", name: "Mathematics", progress: 65, azrEarned: 120 },
        { id: "science", name: "Science", progress: 78, azrEarned: 156 },
        { id: "language", name: "Language Arts", progress: 82, azrEarned: 164 },
        { id: "social", name: "Social Studies", progress: 71, azrEarned: 142 },
        { id: "arts", name: "Arts & Music", progress: 88, azrEarned: 176 }
    ];

    const handleContinue = async (subject: typeof subjects[0]) => {
        try {
            const result = await awardTokens(
                "demo-student-001",
                subject.id,
                "course_completion",
                subject.progress / 100
            );

            setRewardMessage(`🎉 Earned ${result.reward.toFixed(0)} $LEARN tokens!`);
            setTimeout(() => setRewardMessage(""), 3000);
        } catch (error) {
            console.error("Error awarding tokens:", error);
            setRewardMessage("⚠️ Offline mode - tokens will sync later");
            setTimeout(() => setRewardMessage(""), 3000);
        }
    };

    return (
        <AppLayout appName="Azora Sapiens" userName="Student">
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-bold tracking-tighter">
                        <GradientText>K-12 Foundation</GradientText>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Build a strong educational foundation with personalized learning paths
                    </p>
                    {rewardMessage && (
                        <div className="text-lg font-bold text-green-500 animate-pulse">
                            {rewardMessage}
                        </div>
                    )}
                </div>

                {/* Grade Ranges */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {gradeRanges.map((range) => {
                        const Icon = range.icon;
                        return (
                            <AccessibleCard
                                key={range.id}
                                title={range.name}
                                className={`p-6 cursor-pointer transition-all ${selectedGrade === range.id ? 'border-primary' : 'hover:border-primary/50'
                                    }`}
                                onClick={() => setSelectedGrade(range.id)}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-2xl font-bold text-primary">{range.grades}</div>
                                </div>
                                <p className="text-gray-400 text-sm mb-4">{range.description}</p>
                                <Button variant={selectedGrade === range.id ? "primary" : "outline"} className="w-full">
                                    {selectedGrade === range.id ? "Selected" : "Select Grade"}
                                </Button>
                            </AccessibleCard>
                        );
                    })}
                </div>

                {/* Subjects Progress */}
                {selectedGrade && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-bold">Your Subjects</h2>
                            <div className="flex items-center gap-2 text-yellow-500">
                                <Star className="w-5 h-5 fill-current" />
                                <span className="font-bold">758 AZR Earned</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {subjects.map((subject) => (
                                <AccessibleCard key={subject.name} title={subject.name} className="p-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Progress</span>
                                            <span className="font-bold text-primary">{subject.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-800 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                                                style={{ width: `${subject.progress}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <div className="flex items-center gap-2 text-yellow-500 text-sm">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span>{subject.azrEarned} AZR</span>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleContinue(subject)}
                                                disabled={awarding}
                                            >
                                                {awarding ? "Earning..." : "Continue"} <ArrowRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </AccessibleCard>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Chat */}
                <AccessibleCard title="AI Tutors" className="p-0 overflow-hidden">
                    <div className="h-96">
                        <AIFamilyChat
                            defaultAgent="kofi"
                            availableAgents={['kofi', 'elara']}
                        />
                    </div>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
