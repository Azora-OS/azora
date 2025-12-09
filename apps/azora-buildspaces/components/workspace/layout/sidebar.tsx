"use client"

import { useWorkbench } from "@/lib/stores/workbench-store"

interface SidebarProps {
    children: React.ReactNode
}

export function Sidebar({ children }: SidebarProps) {
    const { activeSidebarView } = useWorkbench()

    const getTitle = () => {
        switch (activeSidebarView) {
            case 'explorer': return 'EXPLORER'
            case 'search': return 'SEARCH'
            case 'git': return 'SOURCE CONTROL'
            case 'extensions': return 'EXTENSIONS'
            case 'chat': return 'AI ASSISTANT'
            default: return 'SIDEBAR'
        }
    }

    return (
        <div className="flex flex-col h-full bg-sidebar-background text-sidebar-foreground border-r border-border">
            <div className="h-9 flex items-center px-4 text-xs font-medium text-muted-foreground tracking-wide select-none">
                {getTitle()}
            </div>
            <div className="flex-1 overflow-hidden">
                {children}
            </div>
        </div>
    )
}
