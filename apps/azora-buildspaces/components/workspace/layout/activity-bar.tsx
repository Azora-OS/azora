"use client"

import { Files, Search, GitBranch, Box, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWorkbench, SidebarView } from "@/lib/stores/workbench-store"
import { Button } from "@/components/ui/button"

export function ActivityBar() {
    const { activeSidebarView, setSidebarView, isSidebarVisible, toggleSidebar } = useWorkbench()

    const items: { view: SidebarView; icon: any; label: string }[] = [
        { view: 'explorer', icon: Files, label: 'Explorer' },
        { view: 'search', icon: Search, label: 'Search' },
        { view: 'git', icon: GitBranch, label: 'Source Control' },
        { view: 'extensions', icon: Box, label: 'Extensions' },
        { view: 'chat', icon: MessageSquare, label: 'AI Chat' },
    ]

    const handleClick = (view: SidebarView) => {
        if (activeSidebarView === view && isSidebarVisible) {
            toggleSidebar()
        } else {
            setSidebarView(view)
        }
    }

    return (
        <div className="w-12 flex flex-col items-center py-2 bg-muted/30 border-r border-border h-full">
            {items.map((item) => (
                <Button
                    key={item.view}
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "w-10 h-10 mb-2 rounded-md transition-colors relative",
                        activeSidebarView === item.view && isSidebarVisible
                            ? "text-primary bg-accent/20"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => handleClick(item.view)}
                    title={item.label}
                >
                    <item.icon className="w-5 h-5" />
                    {activeSidebarView === item.view && isSidebarVisible && (
                        <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-primary rounded-r-full" />
                    )}
                </Button>
            ))}
        </div>
    )
}
