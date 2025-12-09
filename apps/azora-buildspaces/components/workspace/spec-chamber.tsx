"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SpecValidator, SpecType } from "@azora/spec-kit"
import Editor from "@monaco-editor/react"
import {
    FileJson,
    CheckCircle2,
    AlertCircle,
    Play,
    Save,
    Wand2,
    LayoutTemplate
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export function SpecChamber() {
    const [content, setContent] = useState(SpecValidator.generateTemplate("component"))
    const [validationResult, setValidationResult] = useState<{ valid: boolean; errors?: any[] } | null>(null)
    const [activeType, setActiveType] = useState<SpecType>("component")

    const handleValidate = () => {
        const result = SpecValidator.validate(content, "yaml")
        setValidationResult(result)
    }

    const handleTemplateChange = (type: SpecType) => {
        setActiveType(type)
        setContent(SpecValidator.generateTemplate(type))
        setValidationResult(null)
    }

    return (
        <div className="h-full flex flex-col bg-zinc-950 text-zinc-100">
            {/* Header */}
            <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                        <LayoutTemplate className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-semibold text-lg">Spec Chamber</h1>
                        <p className="text-xs text-zinc-400">Define and validate project requirements</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleValidate} className="gap-2 border-zinc-700 hover:bg-zinc-800">
                        <Play className="w-4 h-4" />
                        Validate
                    </Button>
                    <Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                        <Save className="w-4 h-4" />
                        Save Spec
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 border-r border-zinc-800 bg-zinc-900/30 p-4 flex flex-col gap-4">
                    <div>
                        <h3 className="text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wider">Templates</h3>
                        <div className="space-y-1">
                            {(["component", "api", "workflow"] as SpecType[]).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => handleTemplateChange(type)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${activeType === type
                                            ? "bg-purple-500/10 text-purple-400"
                                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                                        }`}
                                >
                                    <FileJson className="w-4 h-4" />
                                    <span className="capitalize">{type} Spec</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {validationResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-lg border ${validationResult.valid
                                    ? "bg-emerald-500/10 border-emerald-500/20"
                                    : "bg-red-500/10 border-red-500/20"
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                {validationResult.valid ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                )}
                                <span className={`font-medium ${validationResult.valid ? "text-emerald-400" : "text-red-400"
                                    }`}>
                                    {validationResult.valid ? "Valid Spec" : "Validation Failed"}
                                </span>
                            </div>

                            {!validationResult.valid && validationResult.errors && (
                                <div className="text-xs text-red-300 space-y-1 mt-2">
                                    {validationResult.errors.map((err, i) => (
                                        <div key={i}>{err.message || "Unknown error"}</div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Editor */}
                <div className="flex-1 flex flex-col">
                    <Editor
                        height="100%"
                        defaultLanguage="yaml"
                        value={content}
                        onChange={(val) => setContent(val || "")}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', monospace",
                            padding: { top: 20 },
                            scrollBeyondLastLine: false,
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
