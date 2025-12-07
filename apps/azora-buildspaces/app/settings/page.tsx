"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Home, Code2, Palette, Database, Settings, User, Bell, Shield, Moon, Sun,
    Keyboard, Plug, CreditCard, Globe, BookOpen, ChevronRight
} from "lucide-react";

const settingsSections = [
    {
        id: "profile",
        title: "Profile",
        icon: User,
        settings: [
            { id: "name", label: "Display Name", type: "text", value: "Builder" },
            { id: "email", label: "Email", type: "email", value: "builder@azora.dev" },
            { id: "bio", label: "Bio", type: "textarea", value: "Building with Azora BuildSpaces" }
        ]
    },
    {
        id: "appearance",
        title: "Appearance",
        icon: Moon,
        settings: [
            { id: "theme", label: "Theme", type: "select", options: ["Dark", "Light", "System"], value: "Dark" },
            { id: "font-size", label: "Editor Font Size", type: "select", options: ["12px", "14px", "16px", "18px"], value: "14px" },
            { id: "accent", label: "Accent Color", type: "color", value: "#10b981" }
        ]
    },
    {
        id: "editor",
        title: "Editor",
        icon: Code2,
        settings: [
            { id: "minimap", label: "Show Minimap", type: "toggle", value: true },
            { id: "line-numbers", label: "Line Numbers", type: "toggle", value: true },
            { id: "word-wrap", label: "Word Wrap", type: "toggle", value: false },
            { id: "auto-save", label: "Auto Save", type: "toggle", value: true }
        ]
    },
    {
        id: "ai",
        title: "AI Assistants",
        icon: Plug,
        settings: [
            { id: "default-agent", label: "Default Agent", type: "select", options: ["Elara", "Sankofa", "Imani", "Nia"], value: "Elara" },
            { id: "inline-suggestions", label: "Inline Suggestions", type: "toggle", value: true },
            { id: "auto-complete", label: "Auto Complete", type: "toggle", value: true }
        ]
    },
    {
        id: "notifications",
        title: "Notifications",
        icon: Bell,
        settings: [
            { id: "deployment", label: "Deployment Notifications", type: "toggle", value: true },
            { id: "test-results", label: "Test Results", type: "toggle", value: true },
            { id: "ai-complete", label: "AI Task Complete", type: "toggle", value: true }
        ]
    },
    {
        id: "security",
        title: "Security",
        icon: Shield,
        settings: [
            { id: "2fa", label: "Two-Factor Auth", type: "toggle", value: false },
            { id: "sessions", label: "Active Sessions", type: "button", value: "Manage" }
        ]
    }
];

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState("profile");
    const [settings, setSettings] = useState<Record<string, any>>({});

    const currentSection = settingsSections.find(s => s.id === activeSection);

    const handleToggle = (id: string, currentValue: boolean) => {
        setSettings(prev => ({ ...prev, [id]: !currentValue }));
    };

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
                    <Link href="/docs" className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition">
                        <BookOpen className="w-5 h-5" />
                    </Link>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Settings className="w-5 h-5" />
                </div>
            </div>

            {/* Settings Navigation */}
            <div className="w-64 bg-card/30 backdrop-blur-sm border-r border-border p-4 overflow-y-auto">
                <div className="mb-6">
                    <h2 className="text-xl font-bold">Settings</h2>
                    <p className="text-sm text-muted-foreground mt-1">Customize your experience</p>
                </div>

                <nav className="space-y-1">
                    {settingsSections.map((section) => {
                        const Icon = section.icon;
                        const isActive = activeSection === section.id;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {section.title}
                                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto p-8">
                    {currentSection && (
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex items-center gap-3 mb-8">
                                {(() => {
                                    const Icon = currentSection.icon;
                                    return <Icon className="w-6 h-6 text-primary" />;
                                })()}
                                <h1 className="text-2xl font-bold">{currentSection.title}</h1>
                            </div>

                            <div className="space-y-6">
                                {currentSection.settings.map((setting) => (
                                    <div
                                        key={setting.id}
                                        className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border"
                                    >
                                        <div className="flex items-center justify-between">
                                            <label className="font-medium">{setting.label}</label>

                                            {setting.type === "toggle" && (
                                                <button
                                                    onClick={() => handleToggle(setting.id, settings[setting.id] ?? setting.value)}
                                                    className={`w-12 h-6 rounded-full transition-colors ${(settings[setting.id] ?? setting.value)
                                                        ? 'bg-primary'
                                                        : 'bg-muted'
                                                        }`}
                                                >
                                                    <motion.div
                                                        animate={{ x: (settings[setting.id] ?? setting.value) ? 24 : 2 }}
                                                        className="w-5 h-5 rounded-full bg-white shadow"
                                                    />
                                                </button>
                                            )}

                                            {setting.type === "select" && (
                                                <select
                                                    className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
                                                    defaultValue={setting.value}
                                                >
                                                    {setting.options?.map((opt) => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            )}

                                            {setting.type === "text" && (
                                                <input
                                                    type="text"
                                                    defaultValue={setting.value}
                                                    className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-primary"
                                                />
                                            )}

                                            {setting.type === "email" && (
                                                <input
                                                    type="email"
                                                    defaultValue={setting.value}
                                                    className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-primary"
                                                />
                                            )}

                                            {setting.type === "color" && (
                                                <input
                                                    type="color"
                                                    defaultValue={setting.value}
                                                    className="w-10 h-8 rounded border-0 cursor-pointer"
                                                />
                                            )}

                                            {setting.type === "button" && (
                                                <button className="px-4 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-sm transition">
                                                    {setting.value}
                                                </button>
                                            )}
                                        </div>

                                        {setting.type === "textarea" && (
                                            <textarea
                                                defaultValue={setting.value}
                                                rows={3}
                                                className="w-full mt-2 bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex gap-4">
                                <button className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition">
                                    Save Changes
                                </button>
                                <button className="px-6 py-2 rounded-lg border border-border hover:bg-muted transition">
                                    Reset
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
