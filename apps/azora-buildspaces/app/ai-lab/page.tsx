"use client";

import { useState } from "react";
import { Brain, Cpu, Database, Network, Sparkles, Zap, Home, Code2, Palette, Settings } from "lucide-react";
import Link from "next/link";

export default function AILabPage() {
    const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);

    const experiments = [
        { id: "nlp", name: "Natural Language Processing", icon: Brain, color: "from-purple-500 to-pink-500", status: "Active" },
        { id: "cv", name: "Computer Vision", icon: Zap, color: "from-blue-500 to-cyan-500", status: "Ready" },
        { id: "rl", name: "Reinforcement Learning", icon: Network, color: "from-green-500 to-emerald-500", status: "Paused" },
        { id: "gen", name: "Generative Models", icon: Sparkles, color: "from-orange-500 to-red-500", status: "New" }
    ];

    const metrics = [
        { label: "Models Trained", value: 15, icon: Cpu },
        { label: "Datasets", value: 8, icon: Database },
        { label: "Compute Hours", value: 124, icon: Zap }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Sidebar */}
            <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4">
                <Link href="/" className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-8">
                    <span className="text-lg font-bold">A</span>
                </Link>
                <div className="flex-1 flex flex-col items-center gap-2">
                    <Link href="/workspace" className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition">
                        <Home className="w-5 h-5" />
                    </Link>
                    <Link href="/code-chamber" className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition">
                        <Code2 className="w-5 h-5" />
                    </Link>
                    <Link href="/design-studio" className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition">
                        <Palette className="w-5 h-5" />
                    </Link>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Brain className="w-5 h-5" />
                    </div>
                </div>
                <button className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition">
                    <Settings className="w-5 h-5" />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h1 className="text-5xl font-bold tracking-tighter">
                            <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                                AI Laboratory
                            </span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Experiment with advanced AI models and datasets
                        </p>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {metrics.map((metric) => {
                            const Icon = metric.icon;
                            return (
                                <div key={metric.label} className="p-6 rounded-xl bg-card border border-border">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">{metric.label}</p>
                                            <div className="text-3xl font-bold text-primary">{metric.value}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Experiments */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Experiments</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {experiments.map((exp) => {
                                const Icon = exp.icon;
                                return (
                                    <div
                                        key={exp.id}
                                        className={`p-6 rounded-xl bg-card border cursor-pointer transition-all ${selectedExperiment === exp.id ? 'border-primary' : 'border-border hover:border-primary/50'
                                            }`}
                                        onClick={() => setSelectedExperiment(exp.id)}
                                    >
                                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${exp.color} flex items-center justify-center mb-4`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="font-semibold mb-2">{exp.name}</h3>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className={`text-xs px-2 py-1 rounded-full ${exp.status === 'Active' ? 'bg-green-500/20 text-green-500' :
                                                exp.status === 'New' ? 'bg-blue-500/20 text-blue-500' :
                                                    'bg-muted text-muted-foreground'
                                                }`}>
                                                {exp.status}
                                            </span>
                                        </div>
                                        <button className={`w-full py-2 rounded-lg text-sm font-medium transition ${selectedExperiment === exp.id
                                            ? 'bg-primary text-primary-foreground'
                                            : 'border border-border hover:bg-muted'
                                            }`}>
                                            {selectedExperiment === exp.id ? "Selected" : "Open Lab"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* AI Assistant */}
                    <div className="p-6 rounded-xl bg-card border border-border">
                        <div className="mb-4">
                            <h3 className="font-bold text-lg">NIA - AI Research Assistant</h3>
                            <p className="text-sm text-muted-foreground">Your partner in AI experiments</p>
                        </div>
                        <div className="h-64 bg-background rounded-lg border border-border flex flex-col">
                            <div className="flex-1 p-4 overflow-auto">
                                <div className="bg-green-500/10 rounded-lg p-3 mb-3 max-w-[80%]">
                                    <p className="text-sm">Hello! I'm Nia, your AI Research Assistant. Select an experiment to get started or ask me about ML frameworks!</p>
                                </div>
                            </div>
                            <div className="p-3 border-t border-border">
                                <input
                                    type="text"
                                    placeholder="Ask Nia about AI..."
                                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
