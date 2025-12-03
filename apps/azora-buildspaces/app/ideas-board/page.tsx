"use client";

import React, { useState, useEffect } from "react";
import {
    Sparkles,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Zap,
    BrainCircuit,
    Target,
    Rocket,
    MessageSquare,
    ThumbsUp,
    Share2,
    Clock,
    X,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ApiClient } from "../../lib/api";
import { socketClient } from "../../lib/socket";
import { useRouter } from "next/navigation";

// --- Types ---
interface Idea {
    id: string;
    title: string;
    description: string;
    authorId: string;
    tags: { tag: string }[];
    votes: number;
    comments: any[];
    status: "GENESIS" | "VALIDATING" | "APPROVED" | "ARCHIVED";
    aiAnalysis?: {
        score: number;
        feasibility: "high" | "medium" | "low";
        summary: string;
        estimatedTime?: string;
        requiredAgents?: string[];
    };
    createdAt: string;
}

export default function IdeasBoardPage() {
    const router = useRouter();
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // New Idea Form State
    const [newIdeaTitle, setNewIdeaTitle] = useState("");
    const [newIdeaDesc, setNewIdeaDesc] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial Fetch & WebSocket Setup
    useEffect(() => {
        fetchIdeas();
        socketClient.connect();

        // Listen for real-time updates (if we implemented specific idea events)
        // For now, we can just poll or rely on manual refresh, but let's setup the structure

        return () => {
            socketClient.disconnect();
        };
    }, []);

    const fetchIdeas = async () => {
        try {
            setIsLoading(true);
            const data = await ApiClient.getIdeas();
            setIdeas(data.ideas);
        } catch (error) {
            console.error("Failed to fetch ideas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateIdea = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newIdeaTitle || !newIdeaDesc) return;

        try {
            setIsSubmitting(true);
            await ApiClient.createIdea({
                title: newIdeaTitle,
                description: newIdeaDesc,
                authorId: "user-1", // TODO: Get real user ID
                tags: ["New"],
            });

            setIsCreating(false);
            setNewIdeaTitle("");
            setNewIdeaDesc("");
            fetchIdeas(); // Refresh list
        } catch (error) {
            console.error("Failed to create idea:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeployIdea = async (ideaId: string) => {
        try {
            const response = await ApiClient.deployIdea(ideaId);
            // Redirect to Code Chamber with new project
            router.push(`/code-chamber?projectId=${response.project.id}`);
        } catch (error) {
            console.error("Failed to deploy idea:", error);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30">
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20">
                                <BrainCircuit className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                Genesis Station
                            </h1>
                        </div>
                        <p className="text-gray-400 max-w-xl">
                            The birthplace of Azora's future. Collaborate with Elara to validate and architect the next generation of systems.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm text-gray-300">Elara Online</span>
                        </div>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="group relative px-6 py-3 bg-white text-black font-semibold rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="relative flex items-center gap-2 group-hover:text-white transition-colors">
                                <Plus className="w-5 h-5" />
                                New Concept
                            </span>
                        </button>
                    </div>
                </header>

                {/* Controls & Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-4 z-20">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search the neural net..."
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 backdrop-blur-md transition-all"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        {["All Streams", "Security", "AI", "Infrastructure", "UX"].map((filter, i) => (
                            <button
                                key={filter}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${i === 0
                                    ? "bg-white/10 text-white border border-white/20"
                                    : "bg-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5"
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Ideas Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {ideas.map((idea) => (
                                <motion.div
                                    key={idea.id}
                                    layoutId={idea.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    whileHover={{ y: -5 }}
                                    onClick={() => setSelectedIdea(idea)}
                                    className="group relative bg-gray-900/40 border border-white/10 rounded-2xl p-6 cursor-pointer overflow-hidden backdrop-blur-sm hover:border-cyan-500/30 transition-colors"
                                >
                                    {/* Hover Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Status Indicator */}
                                    <div className="absolute top-4 right-4">
                                        <StatusBadge status={idea.status} />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {new Date(idea.createdAt).toLocaleDateString()}
                                            </span>
                                            <span>•</span>
                                            <span className="text-cyan-400">@User</span>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-100 mb-2 group-hover:text-cyan-300 transition-colors">
                                            {idea.title}
                                        </h3>

                                        <p className="text-gray-400 text-sm line-clamp-3 mb-6">
                                            {idea.description}
                                        </p>

                                        {/* AI Analysis Snippet */}
                                        {idea.aiAnalysis && (
                                            <div className="mb-6 p-3 rounded-lg bg-black/40 border border-white/5 flex items-start gap-3">
                                                <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-semibold text-purple-300">Oracle Insight</span>
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                            {idea.aiAnalysis.score}% Viability
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 leading-relaxed">
                                                        {idea.aiAnalysis.summary}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex gap-2">
                                                {idea.tags?.slice(0, 2).map(tag => (
                                                    <span key={tag.tag} className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-gray-400 border border-white/5">
                                                        #{tag.tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-500 text-sm">
                                                <span className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                                                    <ThumbsUp className="w-4 h-4" /> {idea.votes}
                                                </span>
                                                <span className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                                                    <MessageSquare className="w-4 h-4" /> {idea.comments?.length || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* "New Idea" Placeholder Card */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setIsCreating(true)}
                            className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 cursor-pointer transition-all min-h-[300px] text-gray-500 hover:text-gray-300"
                        >
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Plus className="w-8 h-8" />
                            </div>
                            <span className="font-medium">Initialize New Concept</span>
                            <span className="text-sm text-gray-600 mt-2 text-center max-w-[200px]">
                                Brief Elara on a new project or feature request.
                            </span>
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Create Idea Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg p-8 shadow-2xl shadow-cyan-900/20"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Initialize New Concept</h2>
                            <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateIdea}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Concept Title</label>
                                <input
                                    type="text"
                                    value={newIdeaTitle}
                                    onChange={(e) => setNewIdeaTitle(e.target.value)}
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                                    placeholder="e.g., Quantum Ledger"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                                <textarea
                                    value={newIdeaDesc}
                                    onChange={(e) => setNewIdeaDesc(e.target.value)}
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none h-32 resize-none"
                                    placeholder="Describe your idea for Elara to analyze..."
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    Initialize
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedIdea && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedIdea(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl p-8 shadow-2xl shadow-cyan-900/20"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-3xl font-bold text-white">{selectedIdea.title}</h2>
                            <button onClick={() => setSelectedIdea(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                        <p className="text-gray-300 text-lg mb-8 leading-relaxed">{selectedIdea.description}</p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Projected Impact</h4>
                                <div className="text-2xl font-bold text-green-400">
                                    {selectedIdea.aiAnalysis?.score ? (selectedIdea.aiAnalysis.score > 80 ? 'High' : 'Medium') : 'Pending'}
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Est. Resources</h4>
                                <div className="text-2xl font-bold text-orange-400">
                                    {selectedIdea.aiAnalysis?.estimatedTime || 'Calculating...'}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleDeployIdea(selectedIdea.id)}
                                className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <Rocket className="w-5 h-5" />
                                Deploy to Code Chamber
                            </button>
                            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-colors border border-white/10">
                                Edit Specs
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: Idea["status"] }) {
    const styles = {
        GENESIS: "bg-gray-500/20 text-gray-300 border-gray-500/30",
        VALIDATING: "bg-blue-500/20 text-blue-300 border-blue-500/30 animate-pulse",
        APPROVED: "bg-green-500/20 text-green-300 border-green-500/30",
        ARCHIVED: "bg-red-500/20 text-red-300 border-red-500/30",
    };

    const labels = {
        GENESIS: "Genesis",
        VALIDATING: "Validating",
        APPROVED: "Approved",
        ARCHIVED: "Archived",
    };

    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}
