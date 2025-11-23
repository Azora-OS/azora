import React, { useState } from 'react';
import { Send, Brain, Sparkles, Palette } from 'lucide-react';
import { useElaraAskMutation } from '@azora/api-client/react-query-hooks';
import { ElaraCanvas } from '@/components/ai/ElaraCanvas';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface Personality {
    id: string;
    name: string;
    description: string;
    color: string;
}

export const ElaraMind: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Hello! I\'m Elara, your AI companion. How can I help you today?', timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [selectedPersonality, setSelectedPersonality] = useState('core');
    const [personalities] = useState<Personality[]>([
        { id: 'core', name: 'Elara Core', description: 'Balanced AI assistant', color: 'purple' },
        { id: 'mentor', name: 'Mentor', description: 'Career guidance', color: 'blue' },
        { id: 'tutor', name: 'Tutor', description: 'Academic help', color: 'green' },
        { id: 'socratic', name: 'Socratic', description: 'Question-based learning', color: 'yellow' }
    ]);

    const elaraAskMutation = useElaraAskMutation();
    const loading = elaraAskMutation.isPending;


    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages([...messages, userMsg]);
        setInput('');

        try {
            const response = await elaraAskMutation.mutateAsync({
                question: input,
                context: { personality: selectedPersonality }
            });
            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: (response as any).data?.answer || (response as any).answer || 'I apologize, but I encountered an error. Please try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (err) {
            console.error('Failed to send message:', err);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'I apologize, but I\'m having trouble connecting right now. Please try again later.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        }
    };

    return (
        <div className="h-full flex bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-900">
            {/* Sidebar - Personalities */}
            <div className="w-64 border-r border-white/10 p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                    <Brain className="text-purple-400" size={24} />
                    <h2 className="text-lg font-bold text-white">AI Personalities</h2>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto">
                    {personalities.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedPersonality(p.id)}
                            className={`w-full p-3 rounded-lg text-left transition-all ${selectedPersonality === p.id
                                ? 'bg-purple-500 text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            <div className="font-semibold mb-1">{p.name}</div>
                            <div className="text-xs opacity-80">{p.description}</div>
                        </button>
                    ))}
                </div>
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="text-purple-400" size={16} />
                        <p className="text-xs font-semibold text-white">Ascension Protocol</p>
                    </div>
                    <div className="space-y-2">
                        <div>
                            <div className="flex justify-between text-xs text-white/60 mb-1">
                                <span>Ingestion</span>
                                <span>100%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '100%' }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-white/60 mb-1">
                                <span>Deconstruction</span>
                                <span>75%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '75%' }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-white/60 mb-1">
                                <span>Synthesis</span>
                                <span>45%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: '45%' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-white/10 bg-white/5">
                    <h1 className="text-xl font-bold text-white">Elara Mind</h1>
                    <p className="text-sm text-white/60">
                        Chatting with {personalities.find(p => p.id === selectedPersonality)?.name || 'Elara'}
                    </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                                }`}>
                                {msg.role === 'user' ? 'U' : 'E'}
                            </div>
                            <div className={`flex-1 max-w-[70%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                                <div className={`inline-block p-4 rounded-lg ${msg.role === 'user'
                                    ? 'bg-blue-500/20 text-white'
                                    : 'bg-white/5 text-white/90'
                                    }`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                                <p className="text-xs text-white/30 mt-1">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">E</div>
                            <div className="bg-white/5 rounded-lg p-4">
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10 bg-white/5">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
                            placeholder="Ask Elara anything..."
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 disabled:opacity-50"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-white/10 disabled:cursor-not-allowed rounded-lg text-white transition-colors flex items-center gap-2"
                        >
                            <Send size={18} />
                            <span>Send</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
