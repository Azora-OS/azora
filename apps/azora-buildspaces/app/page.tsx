"use client";

import React, { useState, useEffect } from "react";
import {
    Activity,
    Shield,
    Zap,
    Brain,
    Users,
    Radio,
    Cpu,
    Database,
    Code,
    Palette,
    Rocket,
    TestTube,
    Globe,
    Lock,
    MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ApiClient } from "../lib/api";
import { socketClient } from "../lib/socket";
import BuildspacesNav from "../components/BuildspacesNav";
import { UbuntuPhilosophyCard } from "@azora/shared-design";
// import { SignatureStamp } from "@azora/shared-design"; // Temporarily removed

// --- Types ---
interface Agent {
    name: string;
    role: string;
    status: "active" | "standby" | "busy" | "working" | "assigned" | "idle";
    location: string;
    avatarColor: string;
    currentTask?: any;
}

interface Station {
    id: string;
    name: string;
    description: string;
    icon: any;
    agent: string;
    status: "operational" | "maintenance" | "offline";
    path: string;
    color: string;
}

// --- Mock Data (Static Config) ---
const AGENT_CONFIG: Record<string, Partial<Agent>> = {
    Elara: { role: "XO / Architect", location: "Bridge", avatarColor: "bg-purple-500" },
    Jabari: { role: "Tactical / Security", location: "Shield Generator", avatarColor: "bg-red-500" },
    Zola: { role: "Science / Data", location: "Data Forge", avatarColor: "bg-blue-500" },
    Kofi: { role: "Engineering / Finance", location: "Treasury", avatarColor: "bg-green-500" },
    Abeni: { role: "Comms / Design", location: "Design Studio", avatarColor: "bg-pink-500" },
    Nexus: { role: "Ship Computer", location: "Core", avatarColor: "bg-cyan-500" },
};

const STATIONS: Station[] = [
    {
        id: "genesis",
        name: "Genesis Station",
        description: "Strategy & Ideation. Brief Elara on new missions.",
        icon: Brain,
        agent: "Elara",
        status: "operational",
        path: "/ideas-board",
        color: "from-purple-600 to-indigo-600"
    },
    {
        id: "engineering",
        name: "Code Chamber",
        description: "Development & Engineering. AzStudio IDE instances.",
        icon: Code,
        agent: "Zola",
        status: "operational",
        path: "/code-chamber",
        color: "from-blue-600 to-cyan-600"
    },
    {
        id: "design",
        name: "Design Studio",
        description: "UI/UX & Architecture. Visual systems generation.",
        icon: Palette,
        agent: "Abeni",
        status: "operational",
        path: "/design-studio",
        color: "from-pink-600 to-rose-600"
    },
    {
        id: "security",
        name: "Defense Grid",
        description: "Security & Compliance. Threat monitoring.",
        icon: Shield,
        agent: "Jabari",
        status: "operational",
        path: "/security",
        color: "from-red-600 to-orange-600"
    },
    {
        id: "data",
        name: "Data Forge",
        description: "Database & Analytics. Information processing.",
        icon: Database,
        agent: "Nexus",
        status: "operational",
        path: "/data-forge",
        color: "from-emerald-600 to-teal-600"
    },
    {
        id: "deployment",
        name: "Launch Bay",
        description: "CI/CD & Deployment. Ship to production.",
        icon: Rocket,
        agent: "Kofi",
        status: "maintenance",
        path: "/deployment-bay",
        color: "from-orange-600 to-yellow-600"
    }
];

export default function BridgePage() {
    const router = useRouter();
    const [crew, setCrew] = useState<Agent[]>([]);

    useEffect(() => {
        // Initialize crew state
        const initialCrew = Object.keys(AGENT_CONFIG).map(name => ({
            name,
            ...AGENT_CONFIG[name],
            status: "standby" as const
        })) as Agent[];
        setCrew(initialCrew);

        // Connect WebSocket
        socketClient.connect();

        // Fetch initial status (mock project ID for now, or fetch global status)
        // In a real app, we might have a global dashboard endpoint
        // For now, we'll listen for updates

        const cleanupStatus = socketClient.onAgentStatusUpdate((update) => {
            setCrew(prev => prev.map(agent => {
                if (agent.name === update.agentName) {
                    return { ...agent, status: update.status };
                }
                return agent;
            }));
        });

        const cleanupActivity = socketClient.onAgentActivity((activity) => {
            // Could show a toast or log here
            console.log("Agent Activity:", activity);
        });

        return () => {
            cleanupStatus();
            cleanupActivity();
            socketClient.disconnect();
        };
    }, []);

    return (
        <>
            <BuildspacesNav />
            <div className="min-h-screen bg-black text-white font-sans overflow-hidden">
                {/* Starfield Background */}
                <div className="fixed inset-0 z-0">
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.05]" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
                </div>

                <div className="relative z-10 max-w-[1600px] mx-auto p-6 h-screen flex flex-col">

                    {/* Top Bar: Status & Time */}
                    <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-cyan-900/30 border border-cyan-500/50 flex items-center justify-center animate-pulse">
                                <Globe className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-widest uppercase">Citadel Command</h1>
                                <div className="flex items-center gap-2 text-xs text-cyan-500 font-mono">
                                    <span className="w-2 h-2 bg-cyan-500 rounded-full" />
                                    SYSTEMS NOMINAL
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <StatusMetric label="CPU Load" value="12%" icon={Cpu} color="text-green-400" />
                            <StatusMetric label="Network" value="450 TB/s" icon={Activity} color="text-blue-400" />
                            <StatusMetric label="Shields" value="100%" icon={Shield} color="text-cyan-400" />
                        </div>
                    </header>

                    <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">

                        {/* Left Panel: Crew Manifest */}
                        <div className="col-span-3 bg-gray-900/30 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex flex-col">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <Users className="w-4 h-4" /> Active Crew
                            </h2>
                            <div className="space-y-4 overflow-y-auto pr-2">
                                {crew.map((agent) => (
                                    <div key={agent.name} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default group">
                                        <div className={`w-10 h-10 rounded-full ${agent.avatarColor} flex items-center justify-center text-xs font-bold shadow-lg`}>
                                            {agent.name[0]}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-200">{agent.name}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${agent.status === 'active' || agent.status === 'working' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                                    agent.status === 'busy' || agent.status === 'assigned' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                                        'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                                    }`}>
                                                    {agent.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                                <span>{agent.role}</span>
                                                <span className="text-cyan-600 group-hover:text-cyan-400">@{agent.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
                                <div className="p-4 rounded-xl bg-cyan-900/10 border border-cyan-500/20">
                                    <div className="flex items-center gap-2 mb-2 text-cyan-400 text-xs font-bold uppercase">
                                        <MessageSquare className="w-3 h-3" /> Incoming Transmission
                                    </div>
                                    <p className="text-sm text-gray-300 italic">
                                        "Commander, the Genesis Station is ready for your next directive. Elara is standing by."
                                    </p>
                                </div>

                                <UbuntuPhilosophyCard
                                    collaborationScore={95}
                                    communityImpact={88}
                                    knowledgeSharing={92}
                                />
                            </div>
                        </div>

                        {/* Center Panel: Main Viewscreen (Stations Grid) */}
                        <div className="col-span-9 grid grid-cols-3 gap-6 auto-rows-min overflow-y-auto pb-4">
                            {STATIONS.map((station) => (
                                <motion.div
                                    key={station.id}
                                    whileHover={{ scale: 1.02, translateY: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.push(station.path)}
                                    className="relative group h-64 rounded-2xl bg-gray-900/40 border border-white/10 overflow-hidden cursor-pointer backdrop-blur-md flex flex-col"
                                >
                                    {/* Station Gradient Background */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${station.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />

                                    {/* Content */}
                                    <div className="relative z-10 p-6 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-3 rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors`}>
                                                <station.icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div className={`w-2 h-2 rounded-full ${station.status === 'operational' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' :
                                                station.status === 'maintenance' ? 'bg-orange-500 animate-pulse' : 'bg-red-500'
                                                }`} />
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                                            {station.name}
                                        </h3>
                                        <p className="text-sm text-gray-400 mb-6 flex-1">
                                            {station.description}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Users className="w-3 h-3" />
                                                <span>Cmdr: <span className="text-gray-300">{station.agent}</span></span>
                                            </div>
                                            <div className="text-xs font-mono text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                ENTER STATION &rarr;
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Universal "Add Station" Card */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="h-64 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <Rocket className="w-6 h-6" />
                                </div>
                                <span className="font-medium">Deploy New Module</span>
                            </motion.div>
                        </div>

                    </div>
                </div>
                <div className="fixed bottom-8 left-0 right-0 pointer-events-none">
                    <div className="text-center text-xs text-gray-600">
                        Azora BuildSpaces | The Citadel | Ubuntu Innovation Hub
                    </div>
                </div>
            </div>
        </>
    );
}

function StatusMetric({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
    return (
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/5">
            <Icon className={`w-4 h-4 ${color}`} />
            <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-bold">{label}</span>
                <span className="text-sm font-mono text-gray-200">{value}</span>
            </div>
        </div>
    );
}
