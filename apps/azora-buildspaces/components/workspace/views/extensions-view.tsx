"use client"

import { Input } from "@/components/ui/input"
import { Search, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

const agents = [
    { id: 'elara', name: 'Elara', role: 'Architect', installed: true },
    { id: 'themba', name: 'Themba', role: 'Engineer', installed: true },
    { id: 'kofi', name: 'Kofi', role: 'Builder', installed: true },
    { id: 'naledi', name: 'Naledi', role: 'Designer', installed: false },
]

export function ExtensionsView() {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search Agents..." className="pl-8 h-9 text-sm" />
                </div>
            </div>
            <div className="flex-1 overflow-auto">
                <div className="p-2">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">Installed</h3>
                    {agents.filter(a => a.installed).map(agent => (
                        <div key={agent.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer group">
                            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                {agent.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{agent.name}</div>
                                <div className="text-xs text-muted-foreground truncate">{agent.role}</div>
                            </div>
                        </div>
                    ))}

                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-6 mb-2 px-2">Recommended</h3>
                    {agents.filter(a => !a.installed).map(agent => (
                        <div key={agent.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer group">
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs">
                                {agent.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{agent.name}</div>
                                <div className="text-xs text-muted-foreground truncate">{agent.role}</div>
                            </div>
                            <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                <Download className="w-3 h-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
