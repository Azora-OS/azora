"use client";

import { AppLayout, AccessibleCard, GradientText, Button, AIFamilyChat } from "@azora/shared-design";
import { Code, Palette, Briefcase, FlaskConical, Star, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function UniversityPage() {
    const [selectedMajor, setSelectedMajor] = useState<string | null>(null);

    const majors = [
        { id: "cs", name: "Computer Science", icon: Code, color: "from-blue-500 to-cyan-500", courses: 24 },
        { id: "design", name: "Design & UX", icon: Palette, color: "from-purple-500 to-pink-500", courses: 20 },
        { id: "business", name: "Business Admin", icon: Briefcase, color: "from-orange-500 to-red-500", courses: 22 },
        { id: "science", name: "Data Science", icon: FlaskConical, color: "from-green-500 to-emerald-500", courses: 26 }
    ];

    const courses = [
        { name: "Advanced Algorithms", credits: 4, progress: 85, azrEarned: 340 },
        { name: "Machine Learning", credits: 4, progress: 72, azrEarned: 288 },
        { name: "Distributed Systems", credits: 3, progress: 91, azrEarned: 273 },
        { name: "Software Engineering", credits: 3, progress: 68, azrEarned: 204 }
    ];

    return (
        <AppLayout appName="Azora Sapiens" userName="Student">
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-bold tracking-tighter">
                        <GradientText>University Programs</GradientText>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Advanced degrees and specialized tracks for higher learning
                    </p>
                </div>

                {/* Major Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {majors.map((major) => {
                        const Icon = major.icon;
                        return (
                            <AccessibleCard
                                key={major.id}
                                title={major.name}
                                className={`p-6 cursor-pointer transition-all ${selectedMajor === major.id ? 'border-primary' : 'hover:border-primary/50'
                                    }`}
                                onClick={() => setSelectedMajor(major.id)}
                            >
                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${major.color} flex items-center justify-center mb-4`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-gray-400 text-sm mb-4">{major.courses} Courses</p>
                                <Button variant={selectedMajor === major.id ? "primary" : "outline"} className="w-full">
                                    {selectedMajor === major.id ? "Selected" : "Select Major"}
                                </Button>
                            </AccessibleCard>
                        );
                    })}
                </div>

                {/* Course Progress */}
                {selectedMajor && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-bold">Current Courses</h2>
                            <div className="flex items-center gap-2 text-yellow-500">
                                <Star className="w-5 h-5 fill-current" />
                                <span className="font-bold">1,105 AZR Earned</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {courses.map((course) => (
                                <AccessibleCard key={course.name} title={course.name} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-gray-400">{course.credits} Credits</span>
                                                <div className="flex-1 bg-gray-800 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                                                        style={{ width: `${course.progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-bold text-primary">{course.progress}%</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-yellow-500 text-sm">
                                                    <Star className="w-4 h-4 fill-current" />
                                                    <span>{course.azrEarned} AZR</span>
                                                </div>
                                                <Button variant="outline" size="sm">
                                                    Continue <ArrowRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </div>
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
                            availableAgents={['kofi', 'elara', 'zuri']}
                        />
                    </div>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
