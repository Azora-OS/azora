"use client"

import { Zap, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DeepFocus() {
    return (
        <div className="h-full flex flex-col items-center justify-center bg-background text-foreground p-8">
            <div className="max-w-2xl text-center space-y-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center mx-auto shadow-2xl shadow-yellow-500/20">
                    <Zap className="w-10 h-10 text-white" />
                </div>

                <h1 className="text-4xl font-bold tracking-tight">Deep Focus</h1>
                <p className="text-xl text-muted-foreground">
                    Distraction-free environment for flow state work.
                    <br />
                    Minimalist UI with ambient soundscapes and Pomodoro timer.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <div className="p-6 rounded-xl border border-border bg-card/50 hover:border-yellow-500/50 transition-colors">
                        <Moon className="w-6 h-6 text-yellow-500 mb-3" />
                        <h3 className="font-semibold mb-2">Zen Mode</h3>
                        <p className="text-sm text-muted-foreground">Hide all UI elements except the active editor.</p>
                    </div>
                    <div className="p-6 rounded-xl border border-border bg-card/50 hover:border-yellow-500/50 transition-colors">
                        <Zap className="w-6 h-6 text-yellow-500 mb-3" />
                        <h3 className="font-semibold mb-2">Flow State Analytics</h3>
                        <p className="text-sm text-muted-foreground">Track your focus time and productivity metrics.</p>
                    </div>
                </div>

                <div className="pt-8">
                    <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                        Enter Flow State
                    </Button>
                </div>
            </div>
        </div>
    )
}
