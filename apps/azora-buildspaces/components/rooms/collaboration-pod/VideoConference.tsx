"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Monitor, MessageSquare, Users, Settings } from "lucide-react";

const PARTICIPANTS = [
    { id: 1, name: "Alice Johnson", avatar: "AJ", status: "speaking", video: true, mic: true },
    { id: 2, name: "Bob Smith", avatar: "BS", status: "listening", video: true, mic: false },
    { id: 3, name: "Carol Davis", avatar: "CD", status: "listening", video: false, mic: true },
    { id: 4, name: "David Wilson", avatar: "DW", status: "speaking", video: true, mic: true },
];

export default function VideoConference() {
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isCallActive, setIsCallActive] = useState(true);

    return (
        <div className="h-full flex flex-col bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-white">Team Standup</h3>
                    <Badge variant="secondary" className="bg-green-600">Live</Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Users className="w-4 h-4 mr-2" />
                        {PARTICIPANTS.length}
                    </Button>
                    <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Video Grid */}
            <div className="flex-1 p-4">
                <div className="grid grid-cols-2 gap-4 h-full">
                    {PARTICIPANTS.map((participant) => (
                        <Card key={participant.id} className="bg-slate-800 border-white/10 overflow-hidden">
                            <CardContent className="p-0 h-full">
                                <div className="relative h-full bg-slate-700 flex items-center justify-center">
                                    {participant.video ? (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                            <div className="text-center text-white">
                                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                                    <span className="text-xl font-bold">{participant.avatar}</span>
                                                </div>
                                                <p className="text-sm">{participant.name}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full bg-slate-600 flex items-center justify-center">
                                            <Avatar className="w-20 h-20">
                                                <AvatarFallback className="text-2xl">{participant.avatar}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                    )}

                                    {/* Status Indicators */}
                                    <div className="absolute bottom-2 left-2 flex gap-1">
                                        {!participant.mic && (
                                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                                <MicOff className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                        {participant.status === "speaking" && (
                                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Name Tag */}
                                    <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                                        {participant.name}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-white/10">
                <div className="flex items-center justify-center gap-4">
                    <Button
                        variant={isMicOn ? "outline" : "destructive"}
                        size="lg"
                        onClick={() => setIsMicOn(!isMicOn)}
                        className="w-12 h-12 rounded-full p-0"
                    >
                        {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </Button>

                    <Button
                        variant={isVideoOn ? "outline" : "destructive"}
                        size="lg"
                        onClick={() => setIsVideoOn(!isVideoOn)}
                        className="w-12 h-12 rounded-full p-0"
                    >
                        {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    </Button>

                    <Button
                        variant={isScreenSharing ? "default" : "outline"}
                        size="lg"
                        onClick={() => setIsScreenSharing(!isScreenSharing)}
                        className="w-12 h-12 rounded-full p-0"
                    >
                        <Monitor className="w-5 h-5" />
                    </Button>

                    <Button
                        variant="destructive"
                        size="lg"
                        onClick={() => setIsCallActive(false)}
                        className="w-12 h-12 rounded-full p-0"
                    >
                        <PhoneOff className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}