"use client"

import { Button } from "@/components/ui/button"
import { Hammer, Code } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function KofiPanel() {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border bg-muted/20">
                <h3 className="font-semibold flex items-center gap-2">
                    <Hammer className="w-4 h-4 text-yellow-500" />
                    Kofi (Engineer)
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                    Ready to generate code and implement features.
                </p>
            </div>

            <div className="flex-1 p-4 flex flex-col items-center justify-center text-center space-y-4">
                <Code className="w-12 h-12 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">
                    No active build tasks. Assign a task via Elara to start coding.
                </p>
            </div>

            <div className="p-4 border-t border-border space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Daily Token Budget</span>
                    <span>85% remaining</span>
                </div>
                <Progress value={15} className="h-1" />
            </div>
        </div>
    )
}
