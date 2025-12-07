"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Home, Code2, Palette, Database, Rocket, TestTube, Brain, FileText,
    Book, Terminal, GitBranch, Zap, Shield, Users, Settings, ChevronRight,
    Sparkles, ArrowRight
} from "lucide-react";

const docSections = [
    {
        id: "getting-started",
        title: "Getting Started",
        icon: Rocket,
        items: [
            { id: "overview", title: "Overview", content: "Welcome to Azora BuildSpaces – the ultimate AI-powered development environment for the Azora Nation. BuildSpaces combines cutting-edge AI technology with professional development tools to accelerate your workflow from concept to production." },
            { id: "quickstart", title: "Quick Start", content: "1. Navigate to Code Chamber\n2. Create a new project or open existing\n3. Use the AI assistant (Sankofa) to help write code\n4. Test in Testing Grounds\n5. Deploy via Deployment Bay" },
            { id: "requirements", title: "System Requirements", content: "• Modern browser (Chrome, Firefox, Edge, Safari)\n• Node.js 18+ for local development\n• Git for version control\n• Azora account for cloud features" }
        ]
    },
    {
        id: "workspaces",
        title: "BuildSpaces",
        icon: Code2,
        items: [
            { id: "code-chamber", title: "Code Chamber", content: "Your AI-powered code editor with Monaco, syntax highlighting, IntelliSense, and integrated AI assistant (Sankofa). Supports TypeScript, JavaScript, Python, Rust, and Go." },
            { id: "design-studio", title: "Design Studio", content: "Visual system design workspace with ReactFlow diagrams. Create architecture diagrams, database schemas, and API flows with Imani AI guidance." },
            { id: "ai-lab", title: "AI Lab", content: "Experiment with machine learning models, train custom AI, and integrate AI capabilities into your projects with Nia AI assistant." },
            { id: "data-forge", title: "Data Forge", content: "Data analysis and visualization platform. Import datasets, run queries, create charts, and train ML models with Nia AI guidance." },
            { id: "deployment-bay", title: "Deployment Bay", content: "One-click deployment to Vercel, AWS, Azora Cloud, and more. Configure CI/CD pipelines and monitor deployments." },
            { id: "testing-grounds", title: "Testing Grounds", content: "Automated testing suite with unit tests, integration tests, and E2E testing. Real-time code coverage and quality metrics." }
        ]
    },
    {
        id: "ai-agents",
        title: "AI Agents",
        icon: Brain,
        items: [
            { id: "elara", title: "Elara (XO Architect)", content: "The orchestrating AI that coordinates all other agents. Elara understands your high-level goals and delegates tasks to specialized agents for optimal results." },
            { id: "sankofa", title: "Sankofa (Code Architect)", content: "Expert in code generation, refactoring, and best practices. Available in Code Chamber for pair programming and code review." },
            { id: "imani", title: "Imani (Creative Director)", content: "Specializes in visual design, UI/UX, and system architecture. Available in Design Studio for design guidance." },
            { id: "themba", title: "Themba (Systems Engineer)", content: "Handles infrastructure, DevOps, and deployment configurations. Powers the Deployment Bay automation." },
            { id: "jabari", title: "Jabari (Security Chief)", content: "Focuses on security audits, vulnerability scanning, and compliance. Runs security checks before deployments." },
            { id: "nia", title: "Nia (Data Scientist)", content: "Expert in data analysis, ML models, and visualization. Available in Data Forge and AI Lab." }
        ]
    },
    {
        id: "features",
        title: "Features",
        icon: Sparkles,
        items: [
            { id: "ai-code", title: "AI Code Generation", content: "Generate production-ready code from natural language descriptions. Supports components, APIs, utilities, and full applications." },
            { id: "real-time", title: "Real-time Collaboration", content: "Work together with team members in real-time. See live cursors, chat, and collaborative editing." },
            { id: "git-integration", title: "Git Integration", content: "Built-in version control with commit, push, pull, branch, and merge operations. Supports GitHub, GitLab, and Bitbucket." },
            { id: "cloud-sync", title: "Cloud Sync", content: "Your projects are automatically synced to Azora Cloud. Access from any device, anywhere." }
        ]
    },
    {
        id: "api",
        title: "API Reference",
        icon: Terminal,
        items: [
            { id: "rest-api", title: "REST API", content: "BuildSpaces provides a REST API for programmatic access. Base URL: https://api.buildspaces.azora.dev/v1" },
            { id: "webhooks", title: "Webhooks", content: "Configure webhooks for deployment events, test results, and AI completions." },
            { id: "sdk", title: "SDK & Libraries", content: "Official SDKs available for JavaScript/TypeScript, Python, and Go." }
        ]
    }
];

export default function DocsPage() {
    const [activeSection, setActiveSection] = useState("getting-started");
    const [activeItem, setActiveItem] = useState("overview");

    const currentSection = docSections.find(s => s.id === activeSection);
    const currentItem = currentSection?.items.find(i => i.id === activeItem);

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Sidebar */}
            <div className="w-16 bg-card/50 backdrop-blur-sm border-r border-border flex flex-col items-center py-4">
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
                        <Book className="w-5 h-5" />
                    </div>
                </div>
                <Link href="/settings" className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition">
                    <Settings className="w-5 h-5" />
                </Link>
            </div>

            {/* Doc Navigation */}
            <div className="w-72 bg-card/30 backdrop-blur-sm border-r border-border p-4 overflow-y-auto">
                <div className="mb-6">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Documentation
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">BuildSpaces User Guide</p>
                </div>

                <nav className="space-y-4">
                    {docSections.map((section) => {
                        const Icon = section.icon;
                        const isActive = activeSection === section.id;
                        return (
                            <div key={section.id}>
                                <button
                                    onClick={() => {
                                        setActiveSection(section.id);
                                        setActiveItem(section.items[0].id);
                                    }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {section.title}
                                </button>
                                {isActive && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="ml-6 mt-1 space-y-1"
                                    >
                                        {section.items.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveItem(item.id)}
                                                className={`w-full text-left px-3 py-1.5 rounded text-sm transition flex items-center gap-2 ${activeItem === item.id
                                                    ? 'text-primary'
                                                    : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                <ChevronRight className={`w-3 h-3 transition-transform ${activeItem === item.id ? 'rotate-90' : ''}`} />
                                                {item.title}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-8">
                    {currentSection && currentItem && (
                        <motion.div
                            key={activeItem}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Breadcrumb */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                                <span>Docs</span>
                                <ChevronRight className="w-4 h-4" />
                                <span>{currentSection.title}</span>
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-foreground">{currentItem.title}</span>
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                {currentItem.title}
                            </h1>

                            {/* Content */}
                            <div className="prose prose-invert max-w-none">
                                <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border">
                                    <pre className="whitespace-pre-wrap text-foreground/90 font-sans text-base leading-relaxed">
                                        {currentItem.content}
                                    </pre>
                                </div>
                            </div>

                            {/* Quick Links */}
                            {activeSection === "getting-started" && activeItem === "overview" && (
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Link href="/code-chamber" className="group p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                                <Code2 className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold group-hover:text-primary transition">Code Chamber</h3>
                                                <p className="text-sm text-muted-foreground">Start coding with AI</p>
                                            </div>
                                            <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground group-hover:text-primary transition" />
                                        </div>
                                    </Link>
                                    <Link href="/design-studio" className="group p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                                <Palette className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold group-hover:text-primary transition">Design Studio</h3>
                                                <p className="text-sm text-muted-foreground">Visual architecture</p>
                                            </div>
                                            <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground group-hover:text-primary transition" />
                                        </div>
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
