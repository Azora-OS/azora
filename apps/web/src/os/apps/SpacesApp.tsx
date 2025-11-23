import React, { useState, useEffect } from 'react';
import { Users, Plus, Video, FileText, CheckSquare, Search } from 'lucide-react';
import { useStudySpacesQuery } from '@azora/api-client/react-query-hooks';

interface Message {
    id: string;
    userId: string;
    userName: string;
    content: string;
    timestamp: Date;
}

export const SpacesApp: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'browse' | 'my-spaces'>('my-spaces');
    const { data: spacesData, isLoading: loading } = useStudySpacesQuery(activeTab === 'my-spaces' ? 'my' : 'all');
    const [selectedSpace, setSelectedSpace] = useState<any | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState('');

    const spaces = spacesData?.data || [];

    useEffect(() => {
        if (selectedSpace) {
            // Mock messages for now
            setMessages([
                { id: '1', userId: '1', userName: 'Alice', content: 'Hey everyone!', timestamp: new Date(Date.now() - 5 * 60 * 1000) },
                { id: '2', userId: '2', userName: 'Bob', content: 'Ready to study!', timestamp: new Date(Date.now() - 3 * 60 * 1000) }
            ]);
        }
    }, [selectedSpace]);


    const sendMessage = async () => {
        if (!messageInput.trim() || !selectedSpace) return;
        try {
            const { getApiClient } = await import('@azora/api-client/react-query-hooks');
            const client = getApiClient();
            await client.spaces.sendMessage(selectedSpace.id, messageInput);
            const newMsg: Message = { id: Date.now().toString(), userId: 'me', userName: 'You', content: messageInput, timestamp: new Date() };
            setMessages([...messages, newMsg]);
            setMessageInput('');
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    if (selectedSpace) {
        return (
            <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-900">
                <div className="p-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSelectedSpace(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">←</button>
                            <div>
                                <h2 className="text-xl font-bold text-white">{selectedSpace.name}</h2>
                                <p className="text-sm text-white/60">{selectedSpace.members} members</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"><Video size={20} className="text-white" /></button>
                            <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"><FileText size={20} className="text-white" /></button>
                            <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"><CheckSquare size={20} className="text-white" /></button>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex gap-3 ${msg.userId === 'me' ? 'flex-row-reverse' : ''}`}>
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-semibold flex-shrink-0">{msg.userName[0]}</div>
                            <div className={`flex-1 max-w-[70%] ${msg.userId === 'me' ? 'text-right' : ''}`}>
                                <div className={`inline-block p-3 rounded-lg ${msg.userId === 'me' ? 'bg-purple-500/20 text-white' : 'bg-white/5 text-white/90'}`}>
                                    {msg.userId !== 'me' && <p className="text-xs text-white/40 mb-1">{msg.userName}</p>}
                                    <p className="text-sm">{msg.content}</p>
                                </div>
                                <p className="text-xs text-white/30 mt-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-white/10 bg-white/5">
                    <div className="flex gap-2">
                        <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50" />
                        <button onClick={sendMessage} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition-colors">Send</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-900">
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-white">Study Spaces</h1>
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition-colors">
                        <Plus size={18} />
                        <span>Create Space</span>
                    </button>
                </div>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <input type="text" placeholder="Search spaces..." className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50" />
                </div>
                <div className="flex gap-2">
                    {(['my-spaces', 'browse'] as const).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-purple-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                            {tab === 'my-spaces' ? 'My Spaces' : 'Browse All'}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {spaces.map(space => (
                        <div key={space.id} onClick={() => setSelectedSpace(space)} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors mb-1">{space.name}</h3>
                                    <p className="text-sm text-white/60 line-clamp-2">{space.description}</p>
                                </div>
                                {space.activeSession && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        <span>Live</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-white/40 mb-3">
                                <div className="flex items-center gap-1"><Users size={12} /><span>{space.members}/{space.maxMembers}</span></div>
                                <div className={`px-2 py-0.5 rounded-full ${space.privacy === 'PUBLIC' ? 'bg-green-500/20 text-green-400' : space.privacy === 'PRIVATE' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {space.privacy}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {space.tags.map(tag => <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs text-white/60">{tag}</span>)}
                            </div>
                            <button className={`w-full py-2 text-sm font-medium rounded-lg transition-colors ${space.isMember ? 'bg-purple-500 hover:bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                                {space.isMember ? 'Open Space' : 'Join Space'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
