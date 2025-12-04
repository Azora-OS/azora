"use client";

import { useState } from "react";
import { Database, BarChart, Table, Play, Save, Upload, Home, Code2, Palette, Settings } from "lucide-react";
import Link from "next/link";

export default function DataForge() {
    const [activeTab, setActiveTab] = useState("data");

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
                        <Database className="w-5 h-5" />
                    </div>
                </div>
                <button className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition">
                    <Settings className="w-5 h-5" />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Toolbar */}
                <div className="bg-card border-b border-border p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold">
                            <span className="bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent">
                                Data Forge
                            </span>
                        </h1>
                        <div className="flex bg-muted rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab("data")}
                                className={`px-3 py-1.5 rounded-md text-sm transition-all ${activeTab === "data" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Data
                            </button>
                            <button
                                onClick={() => setActiveTab("viz")}
                                className={`px-3 py-1.5 rounded-md text-sm transition-all ${activeTab === "viz" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Visualize
                            </button>
                            <button
                                onClick={() => setActiveTab("model")}
                                className={`px-3 py-1.5 rounded-md text-sm transition-all ${activeTab === "model" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Model
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition flex items-center gap-2 text-sm">
                            <Upload className="w-4 h-4" />
                            Import
                        </button>
                        <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition flex items-center gap-2 text-sm">
                            <Save className="w-4 h-4" />
                            Save
                        </button>
                        <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition flex items-center gap-2 text-sm font-medium">
                            <Play className="w-4 h-4" />
                            Run Analysis
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Workspace */}
                    <div className="flex-1 p-6 overflow-auto">
                        {activeTab === "data" && (
                            <div className="space-y-6">
                                <div className="bg-card rounded-lg border border-border p-6">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Table className="w-5 h-5 text-blue-500" />
                                        Active Dataset: student_performance.csv
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left text-muted-foreground">
                                            <thead className="text-xs uppercase bg-muted">
                                                <tr>
                                                    <th className="px-6 py-3">Student ID</th>
                                                    <th className="px-6 py-3">Course</th>
                                                    <th className="px-6 py-3">Score</th>
                                                    <th className="px-6 py-3">Hours Studied</th>
                                                    <th className="px-6 py-3">Attendance</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="bg-card border-b border-border">
                                                    <td className="px-6 py-4">STD-001</td>
                                                    <td className="px-6 py-4">Math 101</td>
                                                    <td className="px-6 py-4">85</td>
                                                    <td className="px-6 py-4">12</td>
                                                    <td className="px-6 py-4">95%</td>
                                                </tr>
                                                <tr className="bg-card border-b border-border">
                                                    <td className="px-6 py-4">STD-002</td>
                                                    <td className="px-6 py-4">Science 202</td>
                                                    <td className="px-6 py-4">92</td>
                                                    <td className="px-6 py-4">15</td>
                                                    <td className="px-6 py-4">98%</td>
                                                </tr>
                                                <tr className="bg-card border-b border-border">
                                                    <td className="px-6 py-4">STD-003</td>
                                                    <td className="px-6 py-4">History 101</td>
                                                    <td className="px-6 py-4">78</td>
                                                    <td className="px-6 py-4">8</td>
                                                    <td className="px-6 py-4">88%</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "viz" && (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <div className="text-center">
                                    <BarChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>Visualization Engine Ready</p>
                                    <p className="text-sm">Select columns to generate charts</p>
                                </div>
                            </div>
                        )}

                        {activeTab === "model" && (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <div className="text-center">
                                    <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>Model Training Pipeline</p>
                                    <p className="text-sm">Configure model parameters to start training</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="w-96 bg-card flex flex-col border-l border-border">
                        {/* Data Sources */}
                        <div className="border-b border-border p-4">
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <Database className="w-4 h-4" />
                                Data Sources
                            </h3>
                            <div className="space-y-1 text-sm">
                                <div className="p-2 hover:bg-muted rounded cursor-pointer text-primary flex justify-between">
                                    <span>student_performance.csv</span>
                                    <span className="text-xs text-muted-foreground">24KB</span>
                                </div>
                                <div className="p-2 hover:bg-muted rounded cursor-pointer text-muted-foreground flex justify-between">
                                    <span>course_metrics.json</span>
                                    <span className="text-xs text-muted-foreground">12KB</span>
                                </div>
                            </div>
                        </div>

                        {/* NIA AI Assistant */}
                        <div className="flex-1 flex flex-col">
                            <div className="p-4 border-b border-border">
                                <h3 className="font-bold">NIA - Data Scientist</h3>
                                <p className="text-xs text-muted-foreground">Your AI analytics partner</p>
                            </div>
                            <div className="flex-1 p-4">
                                <div className="h-full bg-background rounded-lg border border-border flex flex-col">
                                    <div className="flex-1 p-4 overflow-auto">
                                        <div className="bg-indigo-500/10 rounded-lg p-3 mb-3 max-w-[80%]">
                                            <p className="text-sm">I'm Nia, your Data Science partner! Ask me to analyze patterns or create visualizations.</p>
                                        </div>
                                    </div>
                                    <div className="p-3 border-t border-border">
                                        <input
                                            type="text"
                                            placeholder="Ask Nia..."
                                            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
