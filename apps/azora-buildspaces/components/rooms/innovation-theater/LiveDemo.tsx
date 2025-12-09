"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Maximize2, Mic, MicOff, Video, VideoOff } from "lucide-react";

export default function LiveDemo() {
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);

    return (
        <div className="h-full flex flex-col bg-black text-white">
            {/* Main Stage */}
            <div className="flex-1 relative flex items-center justify-center bg-slate-900">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto animate-pulse">
                        <Monitor className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold">Waiting for screen share...</h2>
                    <p className="text-slate-400">Click "Start Demo" to begin sharing your application.</p>
                    <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                        Start Screen Share
                    </Button>
                </div>

                {/* Presenter PIP */}
                {isCamOn && (
                    <div className="absolute bottom-4 right-4 w-48 h-32 bg-slate-800 rounded-lg border border-slate-700 shadow-xl overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center bg-slate-700">
                            <span className="text-xs text-slate-400">Camera Feed</span>
                        </div>
                        <div className="absolute bottom-2 left-2 flex gap-1">
                            <div className={`w-2 h-2 rounded-full ${isMicOn ? 'bg-green-500' : 'bg-red-500'}`} />
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="h-16 border-t border-white/10 flex items-center justify-center gap-4 bg-slate-950">
                <Button
                    variant={isMicOn ? "secondary" : "destructive"}
                    size="icon"
                    className="rounded-full h-10 w-10"
                    onClick={() => setIsMicOn(!isMicOn)}
                >
                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </Button>
                <Button
                    variant={isCamOn ? "secondary" : "destructive"}
                    size="icon"
                    className="rounded-full h-10 w-10"
                    onClick={() => setIsCamOn(!isCamOn)}
                >
                    {isCamOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </Button>
                <div className="w-px h-8 bg-white/10 mx-2" />
                <Button variant="outline" className="gap-2 border-white/20 text-white hover:bg-white/10">
                    <Monitor className="w-4 h-4" />
                    Desktop
                </Button>
                <Button variant="outline" className="gap-2 border-white/20 text-white hover:bg-white/10">
                    <Smartphone className="w-4 h-4" />
                    Mobile
                </Button>
            </div>
        </div>
    );
}
