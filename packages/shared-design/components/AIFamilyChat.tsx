/**
 * AI Family Chat Component
 * Provides access to specialized AI agents with unique personalities
 */

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { AccessibleCard, Button } from "@azora/shared-design";
import { Send, Bot, Code, Palette, Brain, Sparkles, X } from "lucide-react";

export type AgentType = 'elara' | 'sankofa' | 'imani' | 'kofi' | 'zuri' | 'nia' | 'amara' | 'jabari' | 'thabo';

export interface Agent {
    id: AgentType;
    name: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    available: boolean;
}

export interface Message {
    id: string;
    role: 'user' | 'agent';
    content: string;
    agentId?: AgentType;
    timestamp: Date;
}

export interface AIFamilyChatProps {
    defaultAgent?: AgentType;
    availableAgents?: AgentType[];
    onSendMessage?: (message: string, agentId: AgentType) => Promise<string>;
    className?: string;
}

const AGENTS: Record<AgentType, Agent> = {
    elara: {
        id: 'elara',
        name: 'ELARA',
        title: 'Master Orchestrator',
        description: 'General AI & tutoring',
        icon: Sparkles,
        color: 'from-purple-500 to-pink-500',
        available: true
    },
    sankofa: {
        id: 'sankofa',
        name: 'SANKOFA',
        title: 'Wisdom Keeper',
        description: 'Software development & architecture',
        icon: Brain,
        color: 'from-amber-500 to-orange-600',
        available: true
    },
    imani: {
        id: 'imani',
        name: 'IMANI',
        title: 'Creative Director',
        description: 'Design, arts & media',
        icon: Palette,
        color: 'from-pink-500 to-rose-500',
        available: true
    },
    kofi: {
        id: 'kofi',
        name: 'KOFI',
        title: 'Math Maestro',
        description: 'Mathematics & problem solving',
        icon: Brain,
        color: 'from-blue-500 to-cyan-500',
        available: true
    },
    zuri: {
        id: 'zuri',
        name: 'ZURI',
        title: 'Science Sage',
        description: 'Scientific research & experiments',
        icon: Sparkles,
        color: 'from-green-500 to-emerald-500',
        available: true
    },
    nia: {
        id: 'nia',
        name: 'NIA',
        title: 'Data Scientist',
        description: 'Analytics & machine learning',
        icon: Brain,
        color: 'from-indigo-500 to-violet-500',
        available: true
    },
    amara: {
        id: 'amara',
        name: 'AMARA',
        title: 'Simulation Specialist',
        description: 'Virtual worlds & experiments',
        icon: Bot,
        color: 'from-teal-500 to-green-400',
        available: true
    },
    jabari: {
        id: 'jabari',
        name: 'JABARI',
        title: 'Business Strategist',
        description: 'Entrepreneurship & security',
        icon: Bot,
        color: 'from-red-500 to-orange-500',
        available: true
    },
    thabo: {
        id: 'thabo',
        name: 'THABO',
        title: 'Systems Thinker',
        description: 'DevOps & infrastructure',
        icon: Code,
        color: 'from-slate-500 to-gray-500',
        available: true
    }
};

const AIFamilyChat: React.FC<AIFamilyChatProps> = ({
    defaultAgent = 'elara',
    availableAgents,
    onSendMessage,
    className = ''
}) => {
    const [selectedAgent, setSelectedAgent] = useState<AgentType>(defaultAgent);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showAgentSelector, setShowAgentSelector] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const filteredAgents = availableAgents
        ? Object.values(AGENTS).filter(agent => availableAgents.includes(agent.id))
        : Object.values(AGENTS).filter(agent => agent.available);

    const currentAgent = AGENTS[selectedAgent];
    const AgentIcon = currentAgent.icon;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // 1. Constitutional Critique (The Superego Check)
            // In production, use env var: process.env.NEXT_PUBLIC_AI_ORCHESTRATOR_URL
            const critiqueRes = await fetch('http://localhost:3014/api/critique', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: input,
                    actionType: 'CHAT',
                    agentId: selectedAgent
                })
            }).catch(() => null); // Fail open if service is down for now, or handle error

            if (critiqueRes && critiqueRes.ok) {
                const critiqueData = await critiqueRes.json();

                if (critiqueData.success && critiqueData.data.verdict === 'REJECT') {
                    const violation = critiqueData.data.violations[0];
                    const rejectionMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        role: 'agent',
                        content: `🚫 **Constitutional Violation Detected**\n\nI cannot fulfill this request because it violates the **${violation.category}** principle.\n\n*Reasoning: ${violation.reasoning}*\n\n*Suggestion: ${violation.suggestion}*`,
                        agentId: selectedAgent,
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, rejectionMessage]);
                    setIsLoading(false);
                    return; // Stop execution
                }
            }

            // 2. Call backend or use default response
            const response = onSendMessage
                ? await onSendMessage(input, selectedAgent)
                : getDefaultResponse(input, selectedAgent);

            const agentMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: response,
                agentId: selectedAgent,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, agentMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: 'Sorry, I encountered an error. Please try again.',
                agentId: selectedAgent,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const getDefaultResponse = (query: string, agent: AgentType): string => {
        const responses: Record<AgentType, string> = {
            elara: `Hello! I'm ELARA, your master orchestrator. I can help with general questions and coordinate with other specialists. How can I assist you today?`,
            sankofa: `Hi! I'm SANKOFA, your code architect. I can help with software development, debugging, and architecture. What are you building?`,
            imani: `Hey! I'm IMANI, your creative director. I can help with design, video, audio, and visual arts. What's your creative vision?`,
            kofi: `Hello! I'm KOFI, your math maestro. I can help with mathematics and problem-solving. What would you like to learn?`,
            zuri: `Hi! I'm ZURI, your science sage. I can help with experiments and research. What are you curious about?`,
            nia: `Hello! I'm NIA, your data scientist. I can help with ML and analytics. What data are you working with?`,
            amara: `Hey! I'm AMARA, your simulation specialist. I can help create virtual experiments. What do you want to simulate?`,
            jabari: `Hello! I'm JABARI, your business strategist. I can help with entrepreneurship. What's your business idea?`,
            thabo: `Hi! I'm THABO, your systems thinker. I can help with DevOps and infrastructure. What are you deploying?`
        };
        return responses[agent];
    };

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {/* Agent Selector */}
            {showAgentSelector && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <AccessibleCard title="Select AI Agent" className="max-w-4xl w-full p-6">
                        <button
                            onClick={() => setShowAgentSelector(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            {filteredAgents.map((agent) => {
                                const Icon = agent.icon;
                                return (
                                    <button
                                        key={agent.id}
                                        onClick={() => {
                                            setSelectedAgent(agent.id);
                                            setShowAgentSelector(false);
                                        }}
                                        className={`p-4 rounded-lg border-2 transition-all ${selectedAgent === agent.id
                                            ? 'border-primary bg-primary/10'
                                            : 'border-gray-700 hover:border-primary/50'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center mb-3 mx-auto`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-center">
                                            <div className="font-bold">{agent.name}</div>
                                            <div className="text-xs text-gray-400">{agent.title}</div>
                                            <div className="text-xs text-gray-500 mt-1">{agent.description}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </AccessibleCard>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <button
                    onClick={() => setShowAgentSelector(true)}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currentAgent.color} flex items-center justify-center`}>
                        <AgentIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                        <div className="font-bold">{currentAgent.name}</div>
                        <div className="text-xs text-gray-400">{currentAgent.title}</div>
                    </div>
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-8">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${currentAgent.color} flex items-center justify-center mx-auto mb-4`}>
                            <AgentIcon className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-lg font-bold">{currentAgent.name}</p>
                        <p className="text-sm">{currentAgent.description}</p>
                        <p className="text-xs mt-2">Ask me anything!</p>
                    </div>
                )}
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                                ? 'bg-primary text-white'
                                : 'bg-gray-800 text-gray-100'
                                }`}
                        >
                            {message.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 rounded-lg p-3">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-800">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={`Ask ${currentAgent.name}...`}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                        disabled={isLoading}
                    />
                    <Button
                        variant="primary"
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AIFamilyChat;
