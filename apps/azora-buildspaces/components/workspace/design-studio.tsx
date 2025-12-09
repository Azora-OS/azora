"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Palette,
    MousePointer2,
    Type,
    Layers,
    Image as ImageIcon,
    Share2,
    Settings,
    MessageSquarePlus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export function DesignStudio() {
    const [selectedTool, setSelectedTool] = useState("select")
    const [annotations, setAnnotations] = useState<{ x: number, y: number, text: string }[]>([])

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (selectedTool === "comment") {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            setAnnotations([...annotations, { x, y, text: "New comment" }])
        }
    }

    return (
        <div className="h-full flex flex-col bg-zinc-950 text-zinc-100 relative overflow-hidden">
            {/* Background Gradients (Silk Effect) */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
            </div>

            {/* Header */}
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-white/5 backdrop-blur-xl z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20">
                        <Palette className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-semibold text-lg tracking-tight">Design Studio</h1>
                        <p className="text-xs text-zinc-400">Interactive Prototyping & Annotation</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-zinc-900/50 rounded-full p-1 border border-white/5">
                        <div className="flex -space-x-2 px-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-zinc-900 bg-zinc-800" />
                            ))}
                        </div>
                        <span className="text-xs text-zinc-400 px-2">3 active</span>
                    </div>
                    <Button size="sm" variant="outline" className="gap-2 border-white/10 hover:bg-white/5">
                        <Share2 className="w-4 h-4" />
                        Share
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden z-10">
                {/* Toolbar */}
                <div className="w-16 border-r border-white/5 bg-white/5 backdrop-blur-md flex flex-col items-center py-6 gap-4">
                    {[
                        { id: "select", icon: MousePointer2 },
                        { id: "comment", icon: MessageSquarePlus },
                        { id: "text", icon: Type },
                        { id: "layers", icon: Layers },
                        { id: "image", icon: ImageIcon },
                    ].map((tool) => (
                        <button
                            key={tool.id}
                            onClick={() => setSelectedTool(tool.id)}
                            className={`p-3 rounded-xl transition-all duration-300 ${selectedTool === tool.id
                                    ? "bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-lg shadow-purple-500/25 scale-110"
                                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                                }`}
                        >
                            <tool.icon className="w-5 h-5" />
                        </button>
                    ))}
                </div>

                {/* Canvas */}
                <div className="flex-1 bg-zinc-900/50 relative overflow-hidden flex items-center justify-center">
                    <div
                        className="w-[800px] h-[600px] bg-zinc-950 rounded-lg shadow-2xl border border-white/5 relative cursor-crosshair group"
                        onClick={handleCanvasClick}
                    >
                        {/* Grid Pattern */}
                        <div className="absolute inset-0 opacity-20"
                            style={{ backgroundImage: "radial-gradient(#444 1px, transparent 1px)", backgroundSize: "20px 20px" }}
                        />

                        {/* Mock Design Content */}
                        <div className="absolute inset-10 bg-zinc-900 rounded-lg border border-zinc-800 p-8">
                            <div className="h-8 w-32 bg-zinc-800 rounded mb-8" />
                            <div className="grid grid-cols-3 gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="aspect-video bg-zinc-800 rounded-lg border border-zinc-700/50" />
                                ))}
                            </div>
                        </div>

                        {/* Annotations */}
                        <AnimatePresence>
                            {annotations.map((ann, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute w-8 h-8 rounded-full bg-purple-500 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs cursor-pointer hover:scale-110 transition-transform"
                                    style={{ left: ann.x - 16, top: ann.y - 16 }}
                                >
                                    {i + 1}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Properties Panel */}
                <div className="w-72 border-l border-white/5 bg-white/5 backdrop-blur-md p-6">
                    <h3 className="text-sm font-medium text-zinc-400 mb-6 uppercase tracking-wider">Properties</h3>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs text-zinc-500">Selection</label>
                            <div className="p-3 rounded-lg bg-zinc-900/50 border border-white/5 text-sm">
                                {selectedTool === "select" ? "Canvas Root" : selectedTool}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-zinc-500">Dimensions</label>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 rounded bg-zinc-900/50 border border-white/5 text-xs flex justify-between">
                                    <span className="text-zinc-500">W</span>
                                    <span>800</span>
                                </div>
                                <div className="p-2 rounded bg-zinc-900/50 border border-white/5 text-xs flex justify-between">
                                    <span className="text-zinc-500">H</span>
                                    <span>600</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
