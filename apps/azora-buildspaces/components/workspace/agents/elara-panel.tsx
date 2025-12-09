"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Plus } from "lucide-react"

export function ElaraPanel() {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border bg-muted/20">
                <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Elara (Project Manager)
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                    I can help you plan features, break down tasks, and manage the team.
                </p>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    <div className="bg-muted/50 p-3 rounded-lg text-sm">
                        <p>Hello! I'm ready to assist. What are we building today?</p>
                    </div>
                    {/* Chat history would go here */}
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                    <Input placeholder="Ask Elara to plan..." className="text-sm" />
                    <Button size="icon">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
