"use client"

import { AlertCircle, AlertTriangle, Info } from "lucide-react"

export function ProblemsView() {
    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 p-4 flex flex-col items-center justify-center text-center text-muted-foreground space-y-4">
                <div className="flex gap-4">
                    <div className="flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span>0 Errors</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        <span>0 Warnings</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Info className="w-4 h-4 text-blue-500" />
                        <span>0 Infos</span>
                    </div>
                </div>
                <p className="text-sm">No problems have been detected in the workspace.</p>
            </div>
        </div>
    )
}
