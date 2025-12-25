"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Smile, Paperclip, Hash, Users, Settings, Search } from "lucide-react";

const MESSAGES = [
    {
        id: 1,
        user: "Alice Johnson",
        avatar: "AJ",
        message: "Hey team! I've updated the wireframes for the new dashboard. Check them out in the design channel.",
        time: "10:32 AM",
        reactions: { "👍": 3, "❤️": 1 }
    },
    {
        id: 2,
        user: "Bob Smith",
        avatar: "BS",
        message: "Great work Alice! The new layout looks much cleaner. I have a question about the mobile responsiveness though.",
        time: "10:35 AM",
        reactions: { "👍": 2 }
    },
    {
        id: 3,
        user: "Carol Davis",
        avatar: "CD",
        message: "I can help with that. Let me review the mobile breakpoints and get back to you.",
        time: "10:37 AM",
        reactions: {}
    },
    {
        id: 4,
        user: "David Wilson",
        avatar: "DW",
        message: "Thanks Carol! Also, don't forget about the standup at 2 PM. We need to discuss the API integration.",
        time: "10:40 AM",
        reactions: { "✅": 4 }
    },
    {
        id: 5,
        user: "Alice Johnson",
        avatar: "AJ",
        message: "Got it! I'll prepare the API documentation for the meeting.",
        time: "10:42 AM",
        reactions: { "🚀": 1 }
    }
];

const CHANNELS = [
    { id: "general", name: "general", unread: 0 },
    { id: "design", name: "design", unread: 3 },
    { id: "development", name: "development", unread: 7 },
    { id: "marketing", name: "marketing", unread: 0 },
    { id: "random", name: "random", unread: 12 }
];

export default function Chat() {
    const [activeChannel, setActiveChannel] = useState("general");
    const [message, setMessage] = useState("");

    const activeChannelData = CHANNELS.find(c => c.id === activeChannel);

    return (
        <div className="h-full flex bg-slate-900">
            {/* Sidebar */}
            <div className="w-64 border-r border-white/10 bg-slate-800/50">
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white">Channels</h3>
                        <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search channels..."
                            className="pl-10 bg-slate-700 border-slate-600"
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-2">
                        {CHANNELS.map((channel) => (
                            <button
                                key={channel.id}
                                onClick={() => setActiveChannel(channel.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg mb-1 transition-colors ${
                                    activeChannel === channel.id
                                        ? 'bg-blue-600 text-white'
                                        : 'hover:bg-slate-700 text-slate-300'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Hash className="w-4 h-4" />
                                    <span className="text-sm">{channel.name}</span>
                                </div>
                                {channel.unread > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                        {channel.unread}
                                    </Badge>
                                )}
                            </button>
                        ))}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-blue-600">Y</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">You</p>
                            <p className="text-xs text-slate-400">Online</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat */}
            <div className="flex-1 flex flex-col">
                {/* Channel Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <Hash className="w-5 h-5 text-slate-400" />
                        <h2 className="text-lg font-semibold text-white">{activeChannelData?.name}</h2>
                        <Badge variant="secondary" className="bg-slate-700">
                            <Users className="w-3 h-3 mr-1" />
                            24 members
                        </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                        <Users className="w-4 h-4 mr-2" />
                        Members
                    </Button>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {MESSAGES.map((msg) => (
                            <div key={msg.id} className="flex gap-3 group">
                                <Avatar className="w-10 h-10 mt-1">
                                    <AvatarFallback className="text-sm bg-slate-600">
                                        {msg.avatar}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-white">{msg.user}</span>
                                        <span className="text-xs text-slate-400">{msg.time}</span>
                                    </div>
                                    <p className="text-slate-300 mb-2">{msg.message}</p>
                                    {Object.keys(msg.reactions).length > 0 && (
                                        <div className="flex gap-1">
                                            {Object.entries(msg.reactions).map(([emoji, count]) => (
                                                <button
                                                    key={emoji}
                                                    className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-xs transition-colors"
                                                >
                                                    <span>{emoji}</span>
                                                    <span className="text-slate-400">{count}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={`Message #${activeChannelData?.name}`}
                                className="pr-24 bg-slate-800 border-slate-600"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        // Handle send message
                                        setMessage("");
                                    }
                                }}
                            />
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                                    <Paperclip className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                                    <Smile className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <Button className="px-6">
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}