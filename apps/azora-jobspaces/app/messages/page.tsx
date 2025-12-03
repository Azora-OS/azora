'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function MessagesPage() {
    const [selectedChat, setSelectedChat] = useState<number | null>(1);

    const conversations = [
        { id: 1, name: 'Sarah M.', lastMessage: 'Thanks for the quick response!', time: '2m ago', unread: 2, avatar: '👩' },
        { id: 2, name: 'Azora BuildSpaces', lastMessage: 'When can you start?', time: '1h ago', unread: 0, avatar: '🏢' },
        { id: 3, name: 'James K.', lastMessage: 'Let me know your availability', time: '3h ago', unread: 1, avatar: '👨' }
    ];

    const messages = [
        { id: 1, sender: 'Sarah M.', content: 'Hi! I saw your profile and I think you would be perfect for our project.', time: '10:30 AM', isMe: false },
        { id: 2, sender: 'You', content: 'Thank you! I would love to hear more about it.', time: '10:32 AM', isMe: true },
        { id: 3, sender: 'Sarah M.', content: 'We are building a DeFi platform and need someone with blockchain expertise.', time: '10:35 AM', isMe: false },
        { id: 4, sender: 'You', content: 'That sounds great! I have extensive experience with smart contracts and Web3.', time: '10:37 AM', isMe: true },
        { id: 5, sender: 'Sarah M.', content: 'Perfect! Can we schedule a call this week?', time: '10:40 AM', isMe: false },
        { id: 6, sender: 'You', content: 'Absolutely! I am available Thursday or Friday afternoon.', time: '10:42 AM', isMe: true },
        { id: 7, sender: 'Sarah M.', content: 'Thanks for the quick response!', time: '10:45 AM', isMe: false }
    ];

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Messages</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Communicate with clients and employers</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                    {/* Conversations List */}
                    <AccessibleCard className="glass-card p-4 overflow-y-auto">
                        <h2 className="text-lg font-bold mb-4">Conversations</h2>
                        <div className="space-y-2">
                            {conversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    onClick={() => setSelectedChat(conv.id)}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedChat === conv.id ? 'bg-primary/10 border-2 border-primary' : 'bg-card hover:bg-card/80'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl">{conv.avatar}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-semibold truncate">{conv.name}</h3>
                                                {conv.unread > 0 && (
                                                    <span className="px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs">
                                                        {conv.unread}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                                            <p className="text-xs text-muted-foreground">{conv.time}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AccessibleCard>

                    {/* Chat Area */}
                    <AccessibleCard className="glass-card lg:col-span-2 flex flex-col">
                        {selectedChat ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-border flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl">{conversations.find(c => c.id === selectedChat)?.avatar}</div>
                                        <div>
                                            <h3 className="font-bold">{conversations.find(c => c.id === selectedChat)?.name}</h3>
                                            <p className="text-xs text-green-500">● Online</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">View Profile</Button>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] p-3 rounded-lg ${msg.isMe ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'
                                                }`}>
                                                {!msg.isMe && <p className="text-xs font-semibold mb-1">{msg.sender}</p>}
                                                <p className="text-sm">{msg.content}</p>
                                                <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Input */}
                                <div className="p-4 border-t border-border">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Type a message..."
                                            className="flex-1 px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        <Button>Send</Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                Select a conversation to start messaging
                            </div>
                        )}
                    </AccessibleCard>
                </div>
            </div>
        </AppLayout>
    );
}
