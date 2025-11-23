import React, { useState } from 'react';
import {
    MessageSquare, Hash, Users, Search, Phone, Video,
    MoreVertical, Paperclip, Smile, Send, Bell
} from 'lucide-react';
import { useDashboardOverviewQuery } from '@azora/api-client/react-query-hooks';

export const Communications: React.FC = () => {
    const [activeChannel, setActiveChannel] = useState('general');
    const { data: overviewData, isLoading: isOverviewLoading } = useDashboardOverviewQuery();

    const onlineUsers = overviewData?.activeUsers || 42;
    const formattedOnlineUsers = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(onlineUsers);

    return (
        <div className="flex h-full bg-slate-900 text-white font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-slate-950/50 border-r border-white/10 flex flex-col">
                <div className="p-4 border-b border-white/5">
                    <h2 className="font-bold text-lg">Azora Team</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs text-white/40">{isOverviewLoading ? '...' : formattedOnlineUsers} Online</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Channels */}
                    <div>
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 px-2">Channels</h3>
                        <div className="space-y-0.5">
                            {['general', 'announcements', 'engineering', 'design', 'marketing', 'random'].map((channel) => (
                                <button
                                    key={channel}
                                    onClick={() => setActiveChannel(channel)}
                                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${activeChannel === channel
                                        ? 'bg-blue-600/20 text-white'
                                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <Hash size={16} className="opacity-50" />
                                    <span className="text-sm font-medium">{channel}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Direct Messages */}
                    <div>
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 px-2">Direct Messages</h3>
                        <div className="space-y-0.5">
                            {[
                                { name: 'Sarah Chen', status: 'online' },
                                { name: 'Mike Ross', status: 'busy' },
                                { name: 'Alex Turner', status: 'offline' },
                                { name: 'Jessica Wu', status: 'online' },
                            ].map((user, i) => (
                                <button
                                    key={i}
                                    className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    <div className="relative">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-[10px] text-white font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${user.status === 'online' ? 'bg-emerald-500' :
                                            user.status === 'busy' ? 'bg-red-500' : 'bg-slate-500'
                                            }`} />
                                    </div>
                                    <span className="text-sm font-medium">{user.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-900/50">
                {/* Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <Hash size={20} className="text-white/40" />
                        <h2 className="font-bold text-white">{activeChannel}</h2>
                        <span className="text-xs text-white/40 ml-2">Team discussions and updates</span>
                    </div>
                    <div className="flex items-center gap-4 text-white/60">
                        <button className="hover:text-white transition-colors"><Search size={18} /></button>
                        <button className="hover:text-white transition-colors"><Phone size={18} /></button>
                        <button className="hover:text-white transition-colors"><Video size={18} /></button>
                        <div className="w-px h-4 bg-white/10" />
                        <button className="hover:text-white transition-colors"><MoreVertical size={18} /></button>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {[
                        { user: 'Sarah Chen', time: '10:42 AM', content: 'Has anyone reviewed the latest PR for the dashboard metrics?', avatar: 'S' },
                        { user: 'Mike Ross', time: '10:45 AM', content: 'Checking it now. Looks good so far, just a few minor styling tweaks needed on the charts.', avatar: 'M' },
                        { user: 'Alex Turner', time: '10:48 AM', content: 'I can help with the chart configurations if needed. We should use the new color palette.', avatar: 'A' },
                        { user: 'Sarah Chen', time: '10:50 AM', content: 'Great, thanks Alex! Let\'s sync after lunch.', avatar: 'S' },
                        { user: 'System', time: '11:00 AM', content: 'Deployment to staging started...', type: 'system' },
                    ].map((msg, i) => (
                        <div key={i} className={`flex gap-4 ${msg.type === 'system' ? 'justify-center' : ''}`}>
                            {msg.type === 'system' ? (
                                <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">{msg.content}</span>
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                                        {msg.avatar}
                                    </div>
                                    <div>
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="font-bold text-white">{msg.user}</span>
                                            <span className="text-xs text-white/40">{msg.time}</span>
                                        </div>
                                        <p className="text-white/80 text-sm leading-relaxed">{msg.content}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/5 bg-slate-900/50">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-2">
                        <div className="flex items-center gap-2 px-2 py-1 border-b border-white/5 mb-2">
                            <button className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors"><strong className="font-serif font-bold">B</strong></button>
                            <button className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors"><em className="font-serif italic">I</em></button>
                            <button className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors"><span className="line-through">S</span></button>
                            <div className="w-px h-4 bg-white/10 mx-1" />
                            <button className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors"><Paperclip size={16} /></button>
                        </div>
                        <div className="flex items-end gap-2">
                            <textarea
                                placeholder={`Message #${activeChannel}`}
                                className="w-full bg-transparent text-white placeholder:text-white/20 resize-none focus:outline-none px-2 py-1 h-10 max-h-32"
                            />
                            <div className="flex items-center gap-2 pb-1 pr-1">
                                <button className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                                    <Smile size={20} />
                                </button>
                                <button className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-900/20">
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
