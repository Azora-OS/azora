"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, ThumbsUp, Zap, MessageSquare } from "lucide-react";

const COMMENTS = [
    { id: 1, user: 'Sarah Chen', avatar: 'SC', message: 'The architecture diagram is very clear!', time: '2m ago', reaction: 'heart' },
    { id: 2, user: 'Mike Ross', avatar: 'MR', message: 'Can you zoom in on the code block?', time: '1m ago', reaction: 'zap' },
    { id: 3, user: 'Jessica P', avatar: 'JP', message: 'Great demo of the real-time features.', time: 'Just now', reaction: 'thumbsup' },
];

export default function AudienceFeedback() {
    return (
        <div className="h-full flex flex-col bg-background border-l">
            <div className="p-4 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Live Feedback
                </h3>
                <div className="flex gap-4 mt-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-500">124</div>
                        <div className="text-xs text-muted-foreground">Viewers</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">98%</div>
                        <div className="text-xs text-muted-foreground">Engagement</div>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {COMMENTS.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <Avatar className="w-8 h-8">
                                <AvatarFallback>{comment.avatar}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{comment.user}</span>
                                    <span className="text-xs text-muted-foreground">{comment.time}</span>
                                </div>
                                <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                                    {comment.message}
                                </p>
                                <div className="flex justify-end">
                                    {comment.reaction === 'heart' && <Heart className="w-3 h-3 text-red-500 fill-red-500" />}
                                    {comment.reaction === 'thumbsup' && <ThumbsUp className="w-3 h-3 text-blue-500 fill-blue-500" />}
                                    {comment.reaction === 'zap' && <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            <div className="p-4 border-t bg-muted/10">
                <div className="flex justify-around">
                    <button className="p-2 hover:bg-muted rounded-full transition-colors group">
                        <Heart className="w-6 h-6 text-muted-foreground group-hover:text-red-500 group-hover:fill-red-500 transition-colors" />
                    </button>
                    <button className="p-2 hover:bg-muted rounded-full transition-colors group">
                        <ThumbsUp className="w-6 h-6 text-muted-foreground group-hover:text-blue-500 group-hover:fill-blue-500 transition-colors" />
                    </button>
                    <button className="p-2 hover:bg-muted rounded-full transition-colors group">
                        <Zap className="w-6 h-6 text-muted-foreground group-hover:text-yellow-500 group-hover:fill-yellow-500 transition-colors" />
                    </button>
                </div>
            </div>
        </div>
    );
}
