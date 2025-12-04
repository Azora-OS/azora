"use client";

import { useState, useCallback } from "react";
import { Plus, Save, Download, Layers, Box, Database, ArrowRight, Home, Code2, Palette, Settings } from "lucide-react";
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
} from "reactflow";
import "reactflow/dist/style.css";
import Link from "next/link";

const initialNodes: Node[] = [
    {
        id: "1",
        type: "input",
        data: { label: "User Interface" },
        position: { x: 250, y: 25 },
    },
    {
        id: "2",
        data: { label: "API Gateway" },
        position: { x: 250, y: 125 },
    },
    {
        id: "3",
        data: { label: "Business Logic" },
        position: { x: 250, y: 225 },
    },
    {
        id: "4",
        type: "output",
        data: { label: "Database" },
        position: { x: 250, y: 325 },
    },
];

const initialEdges: Edge[] = [
    { id: "e1-2", source: "1", target: "2", animated: true },
    { id: "e2-3", source: "2", target: "3", animated: true },
    { id: "e3-4", source: "3", target: "4", animated: true },
];

export default function DesignStudio() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedTool, setSelectedTool] = useState<string>("select");

    const onConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const tools = [
        { id: "component", name: "Component", icon: Box },
        { id: "api", name: "API", icon: ArrowRight },
        { id: "database", name: "Database", icon: Database },
        { id: "layer", name: "Layer", icon: Layers },
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
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Palette className="w-5 h-5" />
                    </div>
                    <Link href="/data-forge" className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition">
                        <Database className="w-5 h-5" />
                    </Link>
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
                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                Design Studio
                            </span>
                        </h1>
                        <div className="flex items-center gap-2">
                            {tools.map((tool) => {
                                const Icon = tool.icon;
                                return (
                                    <button
                                        key={tool.id}
                                        onClick={() => setSelectedTool(tool.id)}
                                        className={`p-2 rounded-lg transition-all ${selectedTool === tool.id
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                            }`}
                                        title={tool.name}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition flex items-center gap-2 text-sm">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition flex items-center gap-2 text-sm">
                            <Save className="w-4 h-4" />
                            Save
                        </button>
                        <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition flex items-center gap-2 text-sm font-medium">
                            <Plus className="w-4 h-4" />
                            New Node
                        </button>
                    </div>
                </div>

                {/* Canvas and Sidebar */}
                <div className="flex-1 flex">
                    <div className="flex-1 bg-background">
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            fitView
                        >
                            <Controls />
                            <MiniMap />
                            <Background gap={12} size={1} />
                        </ReactFlow>
                    </div>

                    {/* Properties and AI Panel */}
                    <div className="w-96 bg-card border-l border-border flex flex-col">
                        {/* Properties */}
                        <div className="p-4 border-b border-border">
                            <h3 className="text-sm font-semibold mb-3">Properties</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-muted-foreground block mb-1">Node Type</label>
                                    <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                                        <option>Component</option>
                                        <option>Service</option>
                                        <option>Database</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground block mb-1">Label</label>
                                    <input
                                        type="text"
                                        placeholder="Enter label..."
                                        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* IMANI AI Assistant */}
                        <div className="flex-1 flex flex-col">
                            <div className="p-4 border-b border-border">
                                <h3 className="font-bold">IMANI - Creative Director</h3>
                                <p className="text-xs text-muted-foreground">Your AI design partner</p>
                            </div>
                            <div className="flex-1 p-4">
                                <div className="h-full bg-background rounded-lg border border-border flex flex-col">
                                    <div className="flex-1 p-4 overflow-auto">
                                        <div className="bg-purple-500/10 rounded-lg p-3 mb-3 max-w-[80%]">
                                            <p className="text-sm">I'm Imani, your Creative Director! Ready to help design your system architecture.</p>
                                        </div>
                                    </div>
                                    <div className="p-3 border-t border-border">
                                        <input
                                            type="text"
                                            placeholder="Ask Imani..."
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
