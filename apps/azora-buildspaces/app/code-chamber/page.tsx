"use client";

import { useState } from "react";
import { Play, Save, FolderOpen, Terminal, FileCode, Code2, Home, Palette, Database, Settings } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function CodeChamber() {
    const [code, setCode] = useState(`// Welcome to the Code Chamber
// Your AI-powered development environment

function greet(name: string): string {
  return \`Hello, \${name}! Welcome to Azora BuildSpaces.\`;
}

console.log(greet("Builder"));
`);

    const [language, setLanguage] = useState("typescript");
    const [output, setOutput] = useState("");

    const handleRunCode = () => {
        setOutput("Code execution coming soon! This will connect to the Code Runner Sandbox.");
    };

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
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Code2 className="w-5 h-5" />
                    </div>
                    <Link href="/design-studio" className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition">
                        <Palette className="w-5 h-5" />
                    </Link>
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
                            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                Code Chamber
                            </span>
                        </h1>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
                        >
                            <option value="typescript">TypeScript</option>
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="rust">Rust</option>
                            <option value="go">Go</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition flex items-center gap-2 text-sm">
                            <FolderOpen className="w-4 h-4" />
                            Open
                        </button>
                        <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition flex items-center gap-2 text-sm">
                            <Save className="w-4 h-4" />
                            Save
                        </button>
                        <button
                            onClick={handleRunCode}
                            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition flex items-center gap-2 text-sm font-medium"
                        >
                            <Play className="w-4 h-4" />
                            Run
                        </button>
                    </div>
                </div>

                {/* Editor and Sidebar */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Editor */}
                    <div className="flex-1 border-r border-border">
                        <MonacoEditor
                            height="100%"
                            language={language}
                            theme="vs-dark"
                            value={code}
                            onChange={(value) => setCode(value || "")}
                            options={{
                                minimap: { enabled: true },
                                fontSize: 14,
                                lineNumbers: "on",
                                roundedSelection: false,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                tabSize: 2,
                            }}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="w-96 bg-card flex flex-col">
                        {/* File Explorer */}
                        <div className="border-b border-border p-4">
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <FileCode className="w-4 h-4" />
                                Files
                            </h3>
                            <div className="space-y-1 text-sm">
                                <div className="p-2 hover:bg-muted rounded cursor-pointer text-primary">
                                    📄 index.ts
                                </div>
                                <div className="p-2 hover:bg-muted rounded cursor-pointer text-muted-foreground">
                                    📄 utils.ts
                                </div>
                                <div className="p-2 hover:bg-muted rounded cursor-pointer text-muted-foreground">
                                    📄 types.ts
                                </div>
                            </div>
                        </div>

                        {/* Terminal Output */}
                        <div className="border-b border-border p-4">
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <Terminal className="w-4 h-4" />
                                Output
                            </h3>
                            <div className="bg-background rounded-lg p-3 font-mono text-xs h-32 overflow-auto border border-border">
                                {output || (
                                    <span className="text-muted-foreground">
                                        Click "Run" to execute your code...
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* SANKOFA AI Assistant */}
                        <div className="flex-1 flex flex-col">
                            <div className="p-4 border-b border-border">
                                <h3 className="font-bold">SANKOFA - Code Architect</h3>
                                <p className="text-xs text-muted-foreground">Your AI pair programmer</p>
                            </div>
                            <div className="flex-1 p-4">
                                <div className="h-full bg-background rounded-lg border border-border flex flex-col">
                                    <div className="flex-1 p-4 overflow-auto">
                                        <div className="bg-accent/10 rounded-lg p-3 mb-3 max-w-[80%]">
                                            <p className="text-sm">Hello! I'm Sankofa, your Code Architect. How can I help you today?</p>
                                        </div>
                                    </div>
                                    <div className="p-3 border-t border-border">
                                        <input
                                            type="text"
                                            placeholder="Ask Sankofa..."
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
