"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, RefreshCw } from "lucide-react"

export function SourceControlView() {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 space-y-4 border-b border-border">
                <div className="flex gap-2">
                    <Input placeholder="Message (Ctrl+Enter to commit)" className="h-9 text-sm" />
                    <Button size="icon" className="h-9 w-9 shrink-0">
                        <Check className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            <div className="flex-1 p-4 flex flex-col items-center justify-center text-center text-muted-foreground space-y-4">
                <RefreshCw className="w-8 h-8 opacity-20" />
                <p className="text-sm">No changes detected.</p>
            </div>
        </div>
    )
}
