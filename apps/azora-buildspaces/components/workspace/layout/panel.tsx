"use client"

import { useWorkbench, PanelView } from "@/lib/stores/workbench-store"
import { cn } from "@/lib/utils"

interface PanelProps {
    children: React.ReactNode
}

export function Panel({ children }: PanelProps) {
    const { activePanelView, setPanelView } = useWorkbench()

    const tabs: { view: PanelView; label: string }[] = [
        { view: 'terminal', label: 'TERMINAL' },
        { view: 'output', label: 'OUTPUT' },
        { view: 'problems', label: 'PROBLEMS' },
        { view: 'debug', label: 'DEBUG CONSOLE' },
    ]

    return (
        <div className="flex flex-col h-full bg-background border-t border-border">
            <div className="flex items-center px-2 border-b border-border h-9 bg-muted/30">
                {tabs.map((tab) => (
                    <button
                        key={tab.view}
                        onClick={() => setPanelView(tab.view)}
                        className={cn(
                            "px-3 h-full text-xs font-medium transition-colors border-b-2 border-transparent hover:text-foreground",
                            activePanelView === tab.view
                                ? "text-foreground border-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="flex-1 overflow-hidden">
                {children}
            </div>
        </div>
    )
}
