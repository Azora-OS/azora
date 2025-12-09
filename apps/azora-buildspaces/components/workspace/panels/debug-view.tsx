"use client"

import { Button } from "@/components/ui/button"
import { Play, Pause, StepForward, RotateCcw } from "lucide-react"

export function DebugView() {
    return (
        <div className="h-full flex flex-col">
            <div className="h-10 border-b border-border flex items-center px-2 gap-2 bg-muted/30">
                <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500">
                    <Play className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-yellow-500">
                    <Pause className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-blue-500">
                    <StepForward className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500">
                    <RotateCcw className="w-4 h-4" />
                </Button>
            </div>
            <div className="flex-1 p-4 flex flex-col items-center justify-center text-center text-muted-foreground">
                <p className="text-sm">No active debug session.</p>
                <Button variant="link" className="text-primary">Configure launch.json</Button>
            </div>
        </div>
    )
}
