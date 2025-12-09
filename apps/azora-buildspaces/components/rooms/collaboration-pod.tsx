"use client"

import { Users, Video } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CollaborationPod() {
    return (
        <div className="h-full flex flex-col items-center justify-center bg-background text-foreground p-8">
            <div className="max-w-2xl text-center space-y-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto shadow-2xl shadow-green-500/20">
                    <Users className="w-10 h-10 text-white" />
                </div>

                <h1 className="text-4xl font-bold tracking-tight">Collaboration Pod</h1>
                <p className="text-xl text-muted-foreground">
                    Team workspace for meetings, whiteboarding, and pair programming.
                    <br />
                    Connect with your team in high-fidelity audio/video.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <div className="p-6 rounded-xl border border-border bg-card/50 hover:border-green-500/50 transition-colors">
                        <Video className="w-6 h-6 text-green-500 mb-3" />
                        <h3 className="font-semibold mb-2">Video Conference</h3>
                        <p className="text-sm text-muted-foreground">Low-latency video calls with screen sharing and remote control.</p>
                    </div>
                    <div className="p-6 rounded-xl border border-border bg-card/50 hover:border-green-500/50 transition-colors">
                        <Users className="w-6 h-6 text-green-500 mb-3" />
                        <h3 className="font-semibold mb-2">Digital Whiteboard</h3>
                        <p className="text-sm text-muted-foreground">Infinite canvas for brainstorming and diagramming.</p>
                    </div>
                </div>

                <div className="pt-8">
                    <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white">
                        Start Session
                    </Button>
                </div>
            </div>
        </div>
    )
}
