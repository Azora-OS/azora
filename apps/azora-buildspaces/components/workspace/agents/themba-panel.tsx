"use client"

import { Button } from "@/components/ui/button"
import { ShieldCheck, Activity } from "lucide-react"

export function ThembaPanel() {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border bg-muted/20">
                <h3 className="font-semibold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    Themba (Architect)
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                    Sentinel Mode Active. Monitoring for architectural integrity and security.
                </p>
            </div>

            <div className="flex-1 p-4 space-y-4">
                <div className="border border-green-500/20 bg-green-500/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-500 font-medium text-sm mb-2">
                        <Activity className="w-4 h-4" />
                        System Status: Healthy
                    </div>
                    <p className="text-xs text-muted-foreground">
                        All constitutional checks passing. No security vulnerabilities detected in current context.
                    </p>
                </div>

                <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Policies</h4>
                    <div className="text-xs bg-muted p-2 rounded">
                        ✅ No hardcoded secrets
                    </div>
                    <div className="text-xs bg-muted p-2 rounded">
                        ✅ Type safety enforced
                    </div>
                    <div className="text-xs bg-muted p-2 rounded">
                        ✅ Component modularity respected
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-border">
                <Button className="w-full" variant="outline">Run Full Audit</Button>
            </div>
        </div>
    )
}
