"use client"

import { GitBranch, AlertCircle, Check, Bell } from "lucide-react"

export function StatusBar() {
    return (
        <div className="h-6 bg-primary text-primary-foreground flex items-center justify-between px-3 text-xs select-none">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 hover:bg-primary-foreground/10 px-1 rounded cursor-pointer">
                    <GitBranch className="w-3 h-3" />
                    <span>main</span>
                </div>
                <div className="flex items-center gap-1 hover:bg-primary-foreground/10 px-1 rounded cursor-pointer">
                    <AlertCircle className="w-3 h-3" />
                    <span>0</span>
                    <AlertCircle className="w-3 h-3 ml-1" />
                    <span>0</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hover:bg-primary-foreground/10 px-1 rounded cursor-pointer">
                    Ln 12, Col 45
                </div>
                <div className="hover:bg-primary-foreground/10 px-1 rounded cursor-pointer">
                    UTF-8
                </div>
                <div className="hover:bg-primary-foreground/10 px-1 rounded cursor-pointer">
                    TypeScript React
                </div>
                <div className="hover:bg-primary-foreground/10 px-1 rounded cursor-pointer">
                    <Check className="w-3 h-3" />
                    <span className="ml-1">Prettier</span>
                </div>
                <div className="hover:bg-primary-foreground/10 px-1 rounded cursor-pointer">
                    <Bell className="w-3 h-3" />
                </div>
            </div>
        </div>
    )
}
