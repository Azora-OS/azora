"use client";

import { useState } from "react";
import { Rocket, Cloud, Server, Globe, Settings, Play, RefreshCw, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface Deployment {
    id: string;
    name: string;
    environment: "development" | "staging" | "production";
    status: "running" | "deploying" | "stopped" | "failed";
    lastDeployed: string;
    url?: string;
}

export default function DeploymentBay() {
    const [deployments, setDeployments] = useState<Deployment[]>([
        {
            id: "1",
            name: "azora-ui",
            environment: "production",
            status: "running",
            lastDeployed: "2 hours ago",
            url: "https://azora.dev"
        },
        {
            id: "2",
            name: "azora-sapiens",
            environment: "staging",
            status: "running",
            lastDeployed: "1 day ago",
            url: "https://staging.sapiens.azora.dev"
        },
        {
            id: "3",
            name: "azora-buildspaces",
            environment: "development",
            status: "deploying",
            lastDeployed: "Just now",
        },
    ]);

    const getStatusIcon = (status: Deployment["status"]) => {
        switch (status) {
            case "running": return <CheckCircle className="w-4 h-4 text-green-500" />;
            case "deploying": return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
            case "stopped": return <Clock className="w-4 h-4 text-gray-500" />;
            case "failed": return <AlertCircle className="w-4 h-4 text-red-500" />;
        }
    };

    const getEnvironmentColor = (env: Deployment["environment"]) => {
        switch (env) {
            case "production": return "bg-green-500/20 text-green-400 border-green-500/30";
            case "staging": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
            case "development": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Header */}
            <div className="border-b border-gray-800 px-8 py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                            <Rocket className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Deployment Bay</h1>
                            <p className="text-gray-400 text-sm">Ship your projects to production</p>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        New Deployment
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Quick Deploy Targets */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-4">Deploy To</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { name: "Vercel", icon: "▲", color: "from-gray-700 to-gray-800" },
                            { name: "AWS", icon: <Cloud className="w-5 h-5" />, color: "from-orange-600 to-orange-700" },
                            { name: "Azora Cloud", icon: <Server className="w-5 h-5" />, color: "from-purple-600 to-pink-600" },
                        ].map((target) => (
                            <div key={target.name} className={`p-4 rounded-xl bg-gradient-to-br ${target.color} border border-gray-700 cursor-pointer hover:border-gray-500 transition`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                        {typeof target.icon === "string" ? <span className="text-xl">{target.icon}</span> : target.icon}
                                    </div>
                                    <span className="font-medium">{target.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Deployments List */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Active Deployments</h2>
                    <div className="space-y-3">
                        {deployments.map((deployment) => (
                            <div key={deployment.id} className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {getStatusIcon(deployment.status)}
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium">{deployment.name}</span>
                                                <span className={`px-2 py-0.5 rounded text-xs border ${getEnvironmentColor(deployment.environment)}`}>
                                                    {deployment.environment}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-400 mt-1">
                                                Last deployed: {deployment.lastDeployed}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {deployment.url && (
                                            <a href={deployment.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
                                                <Globe className="w-4 h-4" />
                                                Visit
                                            </a>
                                        )}
                                        <button className="p-2 hover:bg-gray-700 rounded-lg transition">
                                            <Settings className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
