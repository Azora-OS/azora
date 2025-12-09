"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Code, Cpu, Brain, Palette, Users, Zap, MonitorPlay } from "lucide-react"

const rooms = [
    {
        id: "code-chamber",
        title: "Code Chamber",
        description: "Professional IDE with AI Agents",
        icon: Code,
        color: "text-blue-500",
        href: "/room/code-chamber/new"
    },
    {
        id: "maker-lab",
        title: "Maker Lab",
        description: "Hardware & IoT Simulation",
        icon: Cpu,
        color: "text-orange-500",
        href: "/room/maker-lab/new"
    },
    {
        id: "ai-studio",
        title: "AI Studio",
        description: "Model Training & Data Science",
        icon: Brain,
        color: "text-purple-500",
        href: "/room/ai-studio/new"
    },
    {
        id: "design-studio",
        title: "Design Studio",
        description: "UI/UX & Creative Canvas",
        icon: Palette,
        color: "text-pink-500",
        href: "/room/design-studio/new"
    },
    {
        id: "collaboration-pod",
        title: "Collaboration Pod",
        description: "Team Meetings & Whiteboarding",
        icon: Users,
        color: "text-green-500",
        href: "/room/collaboration-pod/new"
    },
    {
        id: "deep-focus",
        title: "Deep Focus",
        description: "Distraction-free Flow State",
        icon: Zap,
        color: "text-yellow-500",
        href: "/room/deep-focus/new"
    },
    {
        id: "innovation-theater",
        title: "Innovation Theater",
        description: "Presentations & Demos",
        icon: MonitorPlay,
        color: "text-red-500",
        href: "/room/innovation-theater/new"
    }
]

export default function LobbyPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-background p-8">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold tracking-tight mb-4">Azora BuildSpaces</h1>
                <p className="text-muted-foreground text-lg">Select a specialized environment to begin your work.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {rooms.map((room) => (
                    <Card key={room.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => router.push(room.href)}>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <room.icon className={`w-8 h-8 ${room.color}`} />
                                <div>
                                    <CardTitle>{room.title}</CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-base mb-4">
                                {room.description}
                            </CardDescription>
                            <Button className="w-full" variant="secondary">Enter Room</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
