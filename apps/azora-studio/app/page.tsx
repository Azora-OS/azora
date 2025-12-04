"use client";

import { useState } from "react";
import {
    Files, Search, GitBranch, Play, Settings,
    Terminal, Layout, Command, ChevronRight,
    MoreVertical, X, Folder, FileCode, Bot
} from "lucide-react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function AzStudio() {
    const [activeSidebar, setActiveSidebar] = useState("explorer");
    const [openFiles, setOpenFiles] = useState([
        { id: "1", name: "page.tsx", language: "typescript", active: true },
        { id: "2", name: "layout.tsx", language: "typescript", active: false },
        { id: "3", name: "globals.css", language: "css", active: false },
    ]);

    const activeFile = openFiles.find(f => f.active);

    return (
        <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
            {/* Title Bar */}
            <div className="h-10 border-b border-border flex items-center justify-between px-4 bg-muted/30 select-none drag-region">
                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">AzStudio - azora-buildspaces</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded bg-muted/50 text-xs border border-border flex items-center gap-2 cursor-pointer hover:bg-muted transition">
                        <Command className="w-3 h-3" />
                        <span>Search files...</span>
                        <span className="text-muted-foreground ml-2">⌘P</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span>Connected</span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent" />
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Activity Bar */}
                <div className="w-12 border-r border-border flex flex-col items-center py-2 bg-muted/10">
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => setActiveSidebar("explorer")}
                            className={`p-2 rounded-lg transition ${activeSidebar === "explorer" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <Files className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setActiveSidebar("search")}
                            className={`p-2 rounded-lg transition ${activeSidebar === "search" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <Search className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setActiveSidebar("git")}
                            className={`p-2 rounded-lg transition ${activeSidebar === "git" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <GitBranch className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setActiveSidebar("debug")}
                            className={`p-2 rounded-lg transition ${activeSidebar === "debug" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <Play className="w-5 h-5" />
                        </button>
                        <div className="w-8 h-[1px] bg-border my-2" />
                        <button
                            onClick={() => setActiveSidebar("ai")}
                            className={`p-2 rounded-lg transition ${activeSidebar === "ai" ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <Bot className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="mt-auto flex flex-col gap-4">
                        <button className="p-2 text-muted-foreground hover:text-foreground transition">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Sidebar Panel */}
                <div className="w-64 border-r border-border bg-muted/5 flex flex-col">
                    <div className="h-9 px-4 flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <span>Explorer</span>
                        <MoreVertical className="w-4 h-4 cursor-pointer hover:text-foreground" />
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1 px-2 py-1 text-sm font-medium text-foreground cursor-pointer hover:bg-muted/50 rounded">
                                <ChevronRight className="w-4 h-4 rotate-90" />
                                <span>azora-buildspaces</span>
                            </div>
                            <div className="pl-4 space-y-1">
                                <div className="flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded cursor-pointer">
                                    <Folder className="w-4 h-4 text-blue-400" />
                                    <span>app</span>
                                </div>
                                <div className="flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded cursor-pointer">
                                    <Folder className="w-4 h-4 text-green-400" />
                                    <span>components</span>
                                </div>
                                <div className="flex items-center gap-2 px-2 py-1 text-sm text-foreground bg-primary/10 rounded cursor-pointer">
                                    <FileCode className="w-4 h-4 text-yellow-400" />
                                    <span>page.tsx</span>
                                </div>
                                <div className="flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded cursor-pointer">
                                    <FileCode className="w-4 h-4 text-yellow-400" />
                                    <span>layout.tsx</span>
                                </div>
                                <div className="flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded cursor-pointer">
                                    <FileCode className="w-4 h-4 text-blue-300" />
                                    <span>globals.css</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 flex flex-col bg-background">
                    {/* Tabs */}
                    <div className="flex border-b border-border bg-muted/5 overflow-x-auto">
                        {openFiles.map(file => (
                            <div
                                key={file.id}
                                onClick={() => setOpenFiles(files => files.map(f => ({ ...f, active: f.id === file.id })))}
                                className={`
                  group flex items-center gap-2 px-3 py-2 text-sm border-r border-border min-w-[120px] max-w-[200px] cursor-pointer select-none
                  ${file.active ? "bg-background text-foreground border-t-2 border-t-primary" : "text-muted-foreground hover:bg-muted/10"}
                `}
                            >
                                <FileCode className={`w-4 h-4 ${file.language === 'typescript' ? 'text-blue-400' :
                                        file.language === 'css' ? 'text-blue-300' : 'text-yellow-400'
                                    }`} />
                                <span className="truncate flex-1">{file.name}</span>
                                <X className={`w-3 h-3 opacity-0 group-hover:opacity-100 hover:bg-muted rounded p-0.5 transition ${file.active ? "opacity-100" : ""}`} />
                            </div>
                        ))}
                    </div>

                    {/* Breadcrumbs */}
                    <div className="h-8 border-b border-border flex items-center px-4 text-xs text-muted-foreground bg-background">
                        <span>azora-buildspaces</span>
                        <ChevronRight className="w-3 h-3 mx-1" />
                        <span>app</span>
                        <ChevronRight className="w-3 h-3 mx-1" />
                        <span className="text-foreground">{activeFile?.name}</span>
                    </div>

                    {/* Editor */}
                    <div className="flex-1 relative">
                        <MonacoEditor
                            height="100%"
                            language={activeFile?.language || "typescript"}
                            theme="vs-dark"
                            value={`// ${activeFile?.name}\n// AzStudio Premium Editor\n\nexport default function Component() {\n  return (\n    <div className="p-4">\n      <h1>Hello from AzStudio</h1>\n    </div>\n  );\n}`}
                            options={{
                                minimap: { enabled: true },
                                fontSize: 14,
                                fontFamily: "'JetBrains Mono', monospace",
                                lineHeight: 24,
                                padding: { top: 16 },
                                scrollBeyondLastLine: false,
                                smoothScrolling: true,
                                cursorBlinking: "smooth",
                                cursorSmoothCaretAnimation: "on",
                            }}
                        />
                    </div>

                    {/* Terminal Panel */}
                    <div className="h-48 border-t border-border bg-muted/5 flex flex-col">
                        <div className="flex items-center px-4 border-b border-border">
                            <button className="px-3 py-2 text-xs font-medium text-foreground border-b-2 border-primary">TERMINAL</button>
                            <button className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">OUTPUT</button>
                            <button className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">DEBUG CONSOLE</button>
                            <button className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">PROBLEMS</button>
                            <div className="ml-auto flex items-center gap-2">
                                <button className="p-1 hover:bg-muted rounded"><Layout className="w-3 h-3" /></button>
                                <button className="p-1 hover:bg-muted rounded"><X className="w-3 h-3" /></button>
                            </div>
                        </div>
                        <div className="flex-1 p-2 font-mono text-xs overflow-y-auto">
                            <div className="flex items-center gap-2 text-green-500">
                                <ChevronRight className="w-3 h-3" />
                                <span>Success: Compiled successfully in 1.2s</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <ChevronRight className="w-3 h-3" />
                                <span>Ready on http://localhost:3000</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-blue-400">➜</span>
                                <span className="text-cyan-400">azora-buildspaces</span>
                                <span className="text-muted-foreground">git:(</span>
                                <span className="text-red-400">main</span>
                                <span className="text-muted-foreground">)</span>
                                <span className="animate-pulse">_</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="h-6 bg-primary text-primary-foreground flex items-center justify-between px-3 text-[10px] select-none">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3" />
                        <span>main*</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <X className="w-3 h-3 rounded-full bg-red-500/20 p-0.5" />
                        <span>0</span>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 p-0.5 flex items-center justify-center">!</div>
                        <span>0</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span>Ln 12, Col 34</span>
                    <span>UTF-8</span>
                    <span>TypeScript React</span>
                    <div className="flex items-center gap-1">
                        <Bot className="w-3 h-3" />
                        <span>Elara Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
