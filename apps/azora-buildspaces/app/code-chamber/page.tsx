"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import {
    Code,
    Terminal,
    Play,
    Save,
    GitBranch,
    Cpu,
    AlertCircle,
    CheckCircle,
    MessageSquare,
    ArrowLeft,
    Loader2,
    FileCode,
    FileJson,
    FileText
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ApiClient } from "../../lib/api";
import { socketClient } from "../../lib/socket";
import { AzStudio } from "../../components/AzStudio";

// --- Types ---
interface ProjectFile {
    id: string;
    path: string;
    language: string;
    updatedAt: string;
    lastModifiedBy: string;
}

interface AgentTask {
    id: string;
    title: string;
    agentName: string;
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "BLOCKED";
    description?: string;
}

interface AgentCursor {
    agentName: string;
    file: string;
    line: number;
    column: number;
    label: string;
    color: string;
    avatar: string;
    isActive: boolean;
    lastSeen: Date;
}

interface AgentPresence {
    agentName: string;
    status: "online" | "offline" | "busy" | "coding";
    currentFile?: string;
    currentTask?: string;
    color: string;
    avatar: string;
}

interface CollaborationEvent {
    id: string;
    type: "cursor_move" | "text_change" | "file_open" | "task_complete" | "message";
    agentName: string;
    timestamp: Date;
    data: any;
}

function CodeChamberPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const projectId = searchParams.get("projectId");

    const [project, setProject] = useState<any>(null);
    const [files, setFiles] = useState<ProjectFile[]>([]);
    const [activeFile, setActiveFile] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<string>("");
    const [tasks, setTasks] = useState<AgentTask[]>([]);
    const [cursors, setCursors] = useState<AgentCursor[]>([]);
    const [agentPresence, setAgentPresence] = useState<AgentPresence[]>([]);
    const [collaborationEvents, setCollaborationEvents] = useState<CollaborationEvent[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [showCollaborationPanel, setShowCollaborationPanel] = useState(true);
    const [logs, setLogs] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // WebSocket & Real-time Collaboration
    useEffect(() => {
        if (!projectId) return;

        const init = async () => {
            try {
                setIsLoading(true);
                setIsConnected(false);

                // Fetch project data
                const [projectData, filesData] = await Promise.all([
                    ApiClient.getProject(projectId),
                    ApiClient.getProjectFiles(projectId)
                ]);

                setProject(projectData);
                setFiles(filesData);

                if (filesData.length > 0) {
                    setActiveFile(filesData[0].path);
                    const content = await ApiClient.getFileContent(projectId, filesData[0].path);
                    setFileContent(content.content);
                }

                // Connect WebSocket for real-time collaboration
                socketClient.connect();
                socketClient.joinProject(projectId);
                setIsConnected(true);

                // Initialize mock agent presence
                setAgentPresence([
                    {
                        agentName: "Zola",
                        status: "coding",
                        currentFile: "src/components/Button.tsx",
                        currentTask: "Optimizing component performance",
                        color: "from-purple-500 to-pink-500",
                        avatar: "🧠"
                    },
                    {
                        agentName: "Jabari",
                        status: "online",
                        currentFile: "src/services/auth.ts",
                        currentTask: "Security audit",
                        color: "from-blue-500 to-cyan-500",
                        avatar: "🛡️"
                    },
                    {
                        agentName: "Elara",
                        status: "busy",
                        currentFile: "src/utils/helpers.ts",
                        currentTask: "Writing unit tests",
                        color: "from-green-500 to-emerald-500",
                        avatar: "🌟"
                    }
                ]);

                // Initialize mock cursors
                setCursors([
                    {
                        agentName: "Zola",
                        file: "src/components/Button.tsx",
                        line: 15,
                        column: 23,
                        label: "Optimizing props",
                        color: "text-purple-400",
                        avatar: "🧠",
                        isActive: true,
                        lastSeen: new Date()
                    },
                    {
                        agentName: "Jabari",
                        file: "src/services/auth.ts",
                        line: 42,
                        column: 8,
                        label: "Security review",
                        color: "text-blue-400",
                        avatar: "🛡️",
                        isActive: true,
                        lastSeen: new Date()
                    }
                ]);

            } catch (error) {
                console.error("Failed to initialize Code Chamber:", error);
                setLogs(prev => [...prev, `Error: Failed to load project data`]);
            } finally {
                setIsLoading(false);
            }
        };

        init();

        // Real-time WebSocket Event Listeners
        const cleanupActivity = socketClient.onAgentActivity((activity) => {
            setLogs(prev => [...prev, `[${activity.agentName}]: ${activity.details}`]);

            // Refresh files if file was modified/created
            if (activity.action.includes('file')) {
                ApiClient.getProjectFiles(projectId).then(setFiles);
                if (activeFile && activity.file === activeFile) {
                    ApiClient.getFileContent(projectId, activeFile).then(f => setFileContent(f.content));
                }
            }

            // Update agent presence
            setAgentPresence(prev => prev.map(agent =>
                agent.agentName === activity.agentName
                    ? { ...agent, status: "coding", lastSeen: new Date() }
                    : agent
            ));
        });

        const cleanupCursor = socketClient.onAgentCursor((cursorUpdate: any) => {
            setCursors(prev => {
                const existing = prev.find(c => c.agentName === cursorUpdate.agentName);
                if (existing) {
                    return prev.map(c =>
                        c.agentName === cursorUpdate.agentName
                            ? { ...c, ...cursorUpdate, lastSeen: new Date(), isActive: true }
                            : c
                    );
                } else {
                    return [...prev, {
                        ...cursorUpdate,
                        color: getAgentColor(cursorUpdate.agentName),
                        avatar: getAgentAvatar(cursorUpdate.agentName),
                        isActive: true,
                        lastSeen: new Date()
                    }];
                }
            });

            // Add collaboration event
            setCollaborationEvents(prev => [...prev.slice(-50), {
                id: Date.now().toString(),
                type: "cursor_move",
                agentName: cursorUpdate.agentName,
                timestamp: new Date(),
                data: cursorUpdate
            }]);
        });

        const cleanupTextChange = socketClient.onTextChange((textChange) => {
            if (textChange.file === activeFile) {
                setFileContent(textChange.content);

                // Add collaboration event
                setCollaborationEvents(prev => [...prev.slice(-50), {
                    id: Date.now().toString(),
                    type: "text_change",
                    agentName: textChange.agentName,
                    timestamp: new Date(),
                    data: textChange
                }]);
            }
        });

        const cleanupTaskUpdate = socketClient.onTaskUpdate((taskUpdate) => {
            setTasks(prev => {
                const existing = prev.find(t => t.id === taskUpdate.id);
                if (existing) {
                    return prev.map(t => t.id === taskUpdate.id ? { ...t, ...taskUpdate } : t);
                } else {
                    return [...prev, taskUpdate];
                }
            });

            // Add collaboration event
            setCollaborationEvents(prev => [...prev.slice(-50), {
                id: Date.now().toString(),
                type: "task_complete",
                agentName: taskUpdate.agentName,
                timestamp: new Date(),
                data: taskUpdate
            }]);
        });

        // Cleanup
        return () => {
            cleanupActivity();
            cleanupCursor();
            cleanupTextChange();
            cleanupTaskUpdate();
            socketClient.leaveProject();
            setIsConnected(false);
        };
    }, [projectId, activeFile]);

    // Helper functions for agent colors and avatars
    const getAgentColor = (agentName: string): string => {
        const colors: { [key: string]: string } = {
            "Zola": "text-purple-400",
            "Jabari": "text-blue-400",
            "Elara": "text-green-400",
            "Nexus": "text-yellow-400",
            "Imani": "text-pink-400",
            "Kofi": "text-orange-400"
        };
        return colors[agentName] || "text-gray-400";
    };

    const getAgentAvatar = (agentName: string): string => {
        const avatars: { [key: string]: string } = {
            "Zola": "🧠",
            "Jabari": "🛡️",
            "Elara": "🌟",
            "Nexus": "⚡",
            "Imani": "🎨",
            "Kofi": "📊"
        };
        return avatars[agentName] || "🤖";
    };

    // Simulate real-time cursor movements
    useEffect(() => {
        if (!isConnected) return;

        const interval = setInterval(() => {
            setCursors(prev => prev.map(cursor => ({
                ...cursor,
                line: Math.max(1, cursor.line + Math.floor(Math.random() * 3) - 1),
                column: Math.max(1, cursor.column + Math.floor(Math.random() * 5) - 2),
                lastSeen: new Date()
            })));
        }, 3000);

        return () => clearInterval(interval);
    }, [isConnected]);

    // Handle File Selection
    const handleFileSelect = async (path: string) => {
        if (!projectId) return;
        setActiveFile(path);
        try {
            const file = await ApiClient.getFileContent(projectId, path);
            setFileContent(file.content);
        } catch (error) {
            console.error("Failed to load file:", error);
        }
    };

    if (!projectId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-gray-400">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                    <h2 className="text-xl font-bold text-white mb-2">No Project Selected</h2>
                    <p className="mb-6">Please select a project from the Genesis Station.</p>
                    <button
                        onClick={() => router.push("/ideas-board")}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                    >
                        Return to Genesis
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d1117] text-gray-300 font-mono flex flex-col">
            {/* Station Header */}
            <header className="h-14 border-b border-white/10 bg-[#161b22] flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push("/")}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Code className="w-5 h-5 text-blue-400" />
                        <span className="font-bold text-gray-100">Code Chamber</span>
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">
                            STATION ACTIVE
                        </span>
                    </div>
                    <span className="text-sm text-gray-500 border-l border-white/10 pl-4">
                        {project?.name}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Collaboration Status */}
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                        <span className="text-xs text-gray-400">
                            {isConnected ? `${agentPresence.length} Agents Online` : 'Offline'}
                        </span>
                    </div>

                    {/* Active Agents */}
                    <div className="flex items-center gap-1">
                        {agentPresence.slice(0, 3).map(agent => (
                            <div
                                key={agent.agentName}
                                className={`w-6 h-6 rounded-full bg-gradient-to-r ${agent.color} flex items-center justify-center text-xs border-2 border-[#0d1117]`}
                                title={`${agent.agentName} - ${agent.status}`}
                            >
                                {agent.avatar}
                            </div>
                        ))}
                        {agentPresence.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-400 border-2 border-[#0d1117]">
                                +{agentPresence.length - 3}
                            </div>
                        )}
                    </div>

                    <button className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-md transition-colors">
                        <Play className="w-4 h-4 fill-current" />
                    </button>

                    {/* Toggle Collaboration Panel */}
                    <button
                        onClick={() => setShowCollaborationPanel(!showCollaborationPanel)}
                        className={`p-2 rounded-md transition-colors ${showCollaborationPanel
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            }`}
                        title="Toggle Collaboration Panel"
                    >
                        <MessageSquare className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">

                {/* Sidebar: File Explorer & Agent Tasks */}
                <div className="w-64 border-r border-white/10 bg-[#0d1117] flex flex-col">
                    <div className="p-4 border-b border-white/10">
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Project Files</h3>
                        <div className="space-y-1">
                            {files.map(file => (
                                <div
                                    key={file.path}
                                    onClick={() => handleFileSelect(file.path)}
                                    className={`px-2 py-1.5 rounded cursor-pointer text-sm flex items-center gap-2 ${activeFile === file.path ? "bg-blue-500/10 text-blue-400" : "hover:bg-white/5"
                                        }`}
                                >
                                    <FileIcon filename={file.path} />
                                    {file.path}
                                </div>
                            ))}
                            {files.length === 0 && (
                                <div className="text-xs text-gray-600 italic px-2">No files yet</div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto">
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
                            <Cpu className="w-3 h-3" /> Agent Tasks
                        </h3>
                        <div className="space-y-3">
                            {project?.tasks?.map((task: any) => (
                                <TaskCard
                                    key={task.id}
                                    title={task.title}
                                    agent={task.agentName}
                                    status={task.status.toLowerCase()}
                                    message={task.description || "Processing..."}
                                />
                            ))}
                            {(!project?.tasks || project.tasks.length === 0) && (
                                <div className="text-xs text-gray-600 italic">No active tasks</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 flex flex-col bg-[#0d1117]">
                    {/* Tabs */}
                    <div className="flex border-b border-white/10 bg-[#010409]">
                        {activeFile && (
                            <div className="px-4 py-2 bg-[#0d1117] border-t-2 border-blue-500 text-sm text-gray-200 flex items-center gap-2">
                                {activeFile}
                                <span className="hover:bg-white/10 rounded p-0.5 cursor-pointer">×</span>
                            </div>
                        )}
                    </div>

                    {/* Code Area */}
                    <div className="flex-1 font-mono text-sm relative group overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02]" />
                        <div className="relative z-10 h-full">
                            <AzStudio
                                code={fileContent}
                                language={activeFile?.split('.').pop() === 'json' ? 'json' : 'typescript'}
                                onChange={(val) => setFileContent(val || '')}
                            />
                        </div>

                        {/* Agent Cursor Overlay */}
                        <AnimatePresence>
                            {cursors.filter(c => c.file === activeFile).map((cursor) => (
                                <motion.div
                                    key={cursor.agentName}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        top: `${cursor.line * 20}px`, // Approx line height
                                        left: `${cursor.column * 8}px` // Approx char width
                                    }}
                                    className="absolute flex items-center gap-2 pointer-events-none transition-all duration-300 z-50"
                                >
                                    <div className="w-0.5 h-5 bg-blue-500 animate-pulse" />
                                    <div className="px-2 py-1 rounded bg-blue-500 text-[10px] text-white font-bold shadow-lg whitespace-nowrap">
                                        {cursor.agentName} {cursor.label}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Terminal Panel */}
                <div className="h-48 border-t border-white/10 bg-[#0d1117] flex flex-col absolute bottom-0 right-0 left-64">
                    <div className="flex items-center gap-4 px-4 py-2 border-b border-white/10 bg-[#161b22]">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Terminal className="w-3 h-3" />
                            <span>TERMINAL</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 cursor-pointer">
                            <AlertCircle className="w-3 h-3" />
                            <span>PROBLEMS</span>
                        </div>
                    </div>
                    <div className="flex-1 p-4 font-mono text-xs text-gray-400 overflow-y-auto">
                        <div className="mb-1"><span className="text-green-400">➜</span> <span className="text-blue-400">~/project</span> npm run dev</div>
                        <div className="mb-1 text-gray-500">   ready - started server on 0.0.0.0:3000, url: http://localhost:3000</div>
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1 text-gray-300 border-l-2 border-blue-500/30 pl-2">
                                {log}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TaskCard({ title, agent, status, message }: { title: string, agent: string, status: string, message: string }) {
    const colors: Record<string, string> = {
        processing: "border-blue-500/30 bg-blue-500/5",
        completed: "border-green-500/30 bg-green-500/5",
        pending: "border-gray-500/30 bg-gray-500/5",
        failed: "border-red-500/30 bg-red-500/5",
        blocked: "border-orange-500/30 bg-orange-500/5"
    };

    const icons: Record<string, React.ReactNode> = {
        processing: <Cpu className="w-3 h-3 text-blue-400 animate-spin" />,
        completed: <CheckCircle className="w-3 h-3 text-green-400" />,
        pending: <div className="w-3 h-3 rounded-full border-2 border-gray-500 border-t-transparent animate-spin" />,
        failed: <AlertCircle className="w-3 h-3 text-red-400" />,
        blocked: <AlertCircle className="w-3 h-3 text-orange-400" />
    };

    const statusKey = status.toLowerCase();

    return (
        <div className={`p-3 rounded-lg border ${colors[statusKey] || colors.pending} transition-all hover:bg-white/5`}>
            <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold text-gray-300">{title}</span>
                {icons[statusKey]}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <span className="font-bold text-gray-400">{agent}</span>
                <span>•</span>
                <span className="capitalize">{status}</span>
            </div>
            <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">
                {message}
            </p>
        </div>
    );
}

function FileIcon({ filename }: { filename: string }) {
    if (filename.endsWith('.ts') || filename.endsWith('.tsx') || filename.endsWith('.js')) {
        return <FileCode className="w-4 h-4 text-blue-400" />;
    }
    if (filename.endsWith('.json')) {
        return <FileJson className="w-4 h-4 text-yellow-400" />;
    }
    return <FileText className="w-4 h-4 text-gray-400" />;
}

export default function CodeChamberPageWrapper() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="text-white">Loading...</div></div>}>
            <CodeChamberPage />
        </Suspense>
    );
}
