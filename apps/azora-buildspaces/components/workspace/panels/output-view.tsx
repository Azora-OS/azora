"use client"

import { ScrollArea } from "@/components/ui/scroll-area"

export function OutputView() {
    return (
        <div className="h-full bg-black text-white font-mono text-xs p-2">
            <ScrollArea className="h-full">
                <div className="space-y-1">
                    <div className="text-blue-400">[INFO] BuildSpaces Environment Initialized</div>
                    <div className="text-green-400">[SUCCESS] Connected to VFS (Project: Code Chamber)</div>
                    <div className="text-gray-400">[LOG] Elara Agent active and listening...</div>
                    <div className="text-gray-400">[LOG] Themba Agent active and listening...</div>
                    <div className="text-yellow-400">[WARN] No active git repository detected</div>
                </div>
            </ScrollArea>
        </div>
    )
}
