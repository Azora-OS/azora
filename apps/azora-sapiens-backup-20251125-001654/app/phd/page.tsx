"use client";

import { AppLayout, AccessibleCard, GradientText, Button, AIFamilyChat } from "@azora/shared-design";
import { Microscope, Cpu, Atom, Network, Star, FileText, Users } from "lucide-react";
import { useState } from "react";

export default function PhDPage() {
    const [selectedField, setSelectedField] = useState<string | null>(null);

    const researchFields = [
        { id: "ai", name: "Artificial Intelligence", icon: Cpu, color: "from-blue-500 to-cyan-500" },
        { id: "quantum", name: "Quantum Computing", icon: Atom, color: "from-purple-500 to-pink-500" },
        { id: "bio", name: "Biotechnology", icon: Microscope, color: "from-green-500 to-emerald-500" },
        { id: "network", name: "Network Science", icon: Network, color: "from-orange-500 to-red-500" }
    ];

    const researchMetrics = [
        { label: "Publications", value: 12, icon: FileText },
        { label: "Citations", value: 347, icon: Users },
        { label: "AZR Earned", value: 4850, icon: Star }
    ];

    const activeProjects = [
        { name: "Constitutional AI Safety", progress: 78, collaborators: 5, azrEarned: 1560 },
        { name: "Decentralized Learning Systems", progress: 62, collaborators: 3, azrEarned: 1240 },
        { name: "Quantum Error Correction", progress: 91, collaborators: 7, azrEarned: 1820 }
    ];

    return (
        <AppLayout appName="Azora Sapiens" userName="Researcher">
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-bold tracking-tighter">
                        <GradientText>PhD Research Institute</GradientText>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Cutting-edge research and doctoral programs
                    </p>
                </div>

                {/* Research Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {researchMetrics.map((metric) => {
                        const Icon = metric.icon;
                        return (
                            <AccessibleCard key={metric.label} title={metric.label} className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-3xl font-bold text-primary">{metric.value.toLocaleString()}</div>
                                </div>
                            </AccessibleCard>
                        );
                    })}
                </div>

                {/* Research Fields */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">Research Fields</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {researchFields.map((field) => {
                            const Icon = field.icon;
                            return (
                                <AccessibleCard
                                    key={field.id}
                                    title={field.name}
                                    className={`p-6 cursor-pointer transition-all ${selectedField === field.id ? 'border-primary' : 'hover:border-primary/50'
                                        }`}
                                    onClick={() => setSelectedField(field.id)}
                                >
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${field.color} flex items-center justify-center mb-4`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <Button variant={selectedField === field.id ? "primary" : "outline"} className="w-full">
                                        {selectedField === field.id ? "Selected" : "Select Field"}
                                    </Button>
                                </AccessibleCard>
                            );
                        })}
                    </div>
                </div>

                {/* Active Research Projects */}
                {selectedField && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Active Research Projects</h2>
                        <div className="space-y-4">
                            {activeProjects.map((project) => (
                                <AccessibleCard key={project.name} title={project.name} className="p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-4">
                                                <span className="text-gray-400">{project.collaborators} Collaborators</span>
                                                <span className="text-gray-400">•</span>
                                                <div className="flex items-center gap-1 text-yellow-500">
                                                    <Star className="w-4 h-4 fill-current" />
                                                    <span>{project.azrEarned} AZR</span>
                                                </div>
                                            </div>
                                            <span className="font-bold text-primary">{project.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-800 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                                                style={{ width: `${project.progress}%` }}
                                            />
                                        </div>
                                        <Button variant="outline" className="w-full">View Research</Button>
                                    </div>
                                </AccessibleCard>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Research Assistant */}
                <AccessibleCard title="AI Research Assistant" className="p-0 overflow-hidden">
                    <div className="h-96">
                        <AIFamilyChat
                            defaultAgent="zuri"
                            availableAgents={['zuri', 'elara', 'nia']}
                        />
                    </div>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
