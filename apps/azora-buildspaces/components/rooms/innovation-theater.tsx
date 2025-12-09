"use client";

import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { MonitorPlay, Play, Share2, Settings, Mic, Video, Users } from "lucide-react";

import SlideEditor from "./innovation-theater/SlideEditor";
import LiveDemo from "./innovation-theater/LiveDemo";
import AudienceFeedback from "./innovation-theater/AudienceFeedback";

export default function InnovationTheater() {
    const [isLive, setIsLive] = useState(false);

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Toolbar */}
            <div className="h-12 border-b flex items-center justify-between px-4 bg-muted/20">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-2 py-1 bg-red-500/10 text-red-500 rounded-md border border-red-500/20">
                        <MonitorPlay className="w-4 h-4" />
                        <span className="text-sm font-medium">Innovation Theater</span>
                    </div>
                    <span className="text-muted-foreground text-sm">/</span>
                    <span className="text-sm font-medium">Demo Day: Q4 2025</span>
                </div>

                <div className="flex items-center gap-4">
                    {isLive && (
                        <div className="flex items-center gap-2 text-red-500 animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-xs font-bold uppercase tracking-wider">Live</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            className={`gap-2 ${isLive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                            onClick={() => setIsLive(!isLive)}
                        >
                            <Play className="w-4 h-4" />
                            {isLive ? "End Stream" : "Go Live"}
                        </Button>
                        <div className="w-px h-6 bg-border mx-2" />
                        <Button variant="ghost" size="sm" className="gap-2">
                            <Share2 className="w-4 h-4" />
                            Invite
                        </Button>
                        <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal">

                    {/* Left Panel: Slides */}
                    <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
                        <SlideEditor />
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    {/* Middle Panel: Stage */}
                    <ResizablePanel defaultSize={55} minSize={40}>
                        <LiveDemo />
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    {/* Right Panel: Audience */}
                    <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
                        <AudienceFeedback />
                    </ResizablePanel>

                </ResizablePanelGroup>
            </div>
        </div>
    );
}
