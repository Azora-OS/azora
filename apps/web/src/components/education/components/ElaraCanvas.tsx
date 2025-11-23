/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

ELARA'S TEACHING CANVAS
Interactive AI teaching canvas where Elara explains concepts with drawings, text, code, and diagrams
Students can chat with Elara while she teaches visually - making learning interactive and fun
From K-12 to PhD, Elara guides students to wealth through visual, interactive learning
*/

import React, { useRef, useState, useEffect } from 'react';
import { Pencil, Eraser, Trash2, Download, Sparkles, Play, Send, MessageSquare, Brain, Lightbulb, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/api-client';

interface Message {
    id: string;
    role: 'user' | 'elara';
    content: string;
    timestamp: Date;
    canvasAction?: CanvasAction;
}

interface CanvasAction {
    type: 'draw' | 'write' | 'code' | 'diagram' | 'clear';
    data: any;
}

interface ElaraCanvasProps {
    subject?: string;
    grade?: string;
    topic?: string;
}

export function ElaraCanvas({ subject = 'General', grade = 'All', topic = '' }: ElaraCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'elara',
            content: `Hi! I'm Elara, your AI teacher 🌟\n\nI'll help you learn ${subject} through visual explanations. Ask me anything, and I'll draw, write, or code to help you understand!\n\nWhat would you like to learn today?`,
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isTeaching, setIsTeaching] = useState(false);
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
    const [color, setColor] = useState('#8B5CF6');
    const [lineWidth, setLineWidth] = useState(3);

    const colors = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#FFFFFF'];

    const suggestedQuestions = [
        "Explain this concept visually",
        "Show me an example",
        "Draw a diagram",
        "Write some code",
        "How does this work?",
    ];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Dark background
        ctx.fillStyle = '#1F2937';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#1F2937';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawOnCanvas = (action: CanvasAction) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (action.type === 'clear') {
            clearCanvas();
        } else if (action.type === 'write') {
            // Elara writes text
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '20px Arial';
            const lines = action.data.text.split('\n');
            lines.forEach((line: string, index: number) => {
                ctx.fillText(line, 40, 60 + (index * 30));
            });
        } else if (action.type === 'code') {
            // Elara shows code
            ctx.fillStyle = '#10B981';
            ctx.font = '16px "Courier New", monospace';
            const lines = action.data.code.split('\n');
            lines.forEach((line: string, index: number) => {
                ctx.fillText(line, 40, 60 + (index * 24));
            });
        } else if (action.type === 'diagram') {
            // Elara draws a diagram
            animateDiagram(ctx, action.data);
        }
    };

    const animateDiagram = (ctx: CanvasRenderingContext2D, data: any) => {
        // Example: Draw a simple flowchart or concept map
        const steps = [
            { x: 150, y: 100, text: 'Concept 1', color: '#8B5CF6' },
            { x: 400, y: 100, text: 'Concept 2', color: '#EC4899' },
            { x: 275, y: 250, text: 'Result', color: '#10B981' },
        ];

        steps.forEach((step, index) => {
            setTimeout(() => {
                // Draw box
                ctx.strokeStyle = step.color;
                ctx.lineWidth = 3;
                ctx.strokeRect(step.x - 60, step.y - 30, 120, 60);

                // Draw text
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(step.text, step.x, step.y + 5);

                // Draw arrows
                if (index < steps.length - 1) {
                    ctx.strokeStyle = '#3B82F6';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    if (index === 0) {
                        ctx.moveTo(step.x + 60, step.y);
                        ctx.lineTo(steps[index + 1].x - 60, steps[index + 1].y);
                    } else if (index === 1) {
                        ctx.moveTo(step.x, step.y + 30);
                        ctx.lineTo(steps[index + 1].x + 30, steps[index + 1].y - 30);
                    }
                    ctx.stroke();
                }
            }, index * 500);
        });
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isTeaching) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsTeaching(true);

        try {
            // Call Elara AI with context
            const context = `Subject: ${subject}, Grade: ${grade}, Topic: ${topic}`;
            const response = await apiClient.askAITutor(input, context);

            // Simulate Elara teaching with canvas actions
            setTimeout(() => {
                const elaraMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'elara',
                    content: response.answer || "Let me explain this visually...",
                    timestamp: new Date(),
                    canvasAction: determineCanvasAction(input, response.answer),
                };

                setMessages((prev) => [...prev, elaraMessage]);

                // Draw on canvas if there's an action
                if (elaraMessage.canvasAction) {
                    setTimeout(() => {
                        drawOnCanvas(elaraMessage.canvasAction!);
                    }, 500);
                }
            }, 1000);
        } catch (error) {
            console.error('Elara teaching error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'elara',
                content: "I'm having trouble connecting right now, but I'm here to help! Let me show you what I know...",
                timestamp: new Date(),
                canvasAction: {
                    type: 'write',
                    data: { text: 'Elara is learning...\nPlease try again!' },
                },
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsTeaching(false);
        }
    };

    const determineCanvasAction = (question: string, answer: string): CanvasAction | undefined => {
        const lowerQuestion = question.toLowerCase();

        if (lowerQuestion.includes('draw') || lowerQuestion.includes('diagram') || lowerQuestion.includes('show')) {
            return { type: 'diagram', data: { concept: question } };
        } else if (lowerQuestion.includes('code') || lowerQuestion.includes('program')) {
            return { type: 'code', data: { code: '# Example code\nprint("Hello, learner!")' } };
        } else if (lowerQuestion.includes('explain') || lowerQuestion.includes('what')) {
            return { type: 'write', data: { text: answer.substring(0, 200) } };
        }

        return undefined;
    };

    const downloadCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = 'elara-lesson.png';
        link.href = canvas.toDataURL();
        link.click();
    };

    return (
        <div className="flex h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-purple-500/30 overflow-hidden">
            {/* Canvas Area - Left Side */}
            <div className="flex-1 flex flex-col border-r border-purple-500/20">
                {/* Canvas Header */}
                <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-3 border-b border-purple-500/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <Brain className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">Teaching Canvas</h4>
                                <p className="text-xs text-purple-300">{subject} • {grade}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={clearCanvas}
                                className="p-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded text-red-400 transition-all"
                                title="Clear"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={downloadCanvas}
                                className="p-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded text-blue-400 transition-all"
                                title="Download"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 p-4 overflow-hidden">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full rounded-xl border border-purple-500/20"
                    />
                </div>

                {/* Teaching Indicator */}
                <AnimatePresence>
                    {isTeaching && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-4 left-1/4 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full shadow-lg"
                        >
                            <div className="flex items-center gap-2 text-white text-sm">
                                <Sparkles className="w-4 h-4 animate-pulse" />
                                <span className="font-semibold">Elara is teaching...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Chat Area - Right Side */}
            <div className="w-96 flex flex-col bg-gray-900/50">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-3 border-b border-purple-500/30">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">Chat with Elara</h3>
                            <p className="text-xs text-green-400">● Online & Teaching</p>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] p-3 rounded-2xl ${message.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-800/50 border border-purple-500/20 text-gray-200'
                                    }`}
                            >
                                {message.role === 'elara' && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="w-3 h-3 text-purple-400" />
                                        <span className="text-xs text-purple-400 font-semibold">Elara AI</span>
                                    </div>
                                )}
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                {message.canvasAction && (
                                    <div className="mt-2 text-xs text-purple-300 flex items-center gap-1">
                                        <Play className="w-3 h-3" />
                                        Drawing on canvas...
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions */}
                {messages.length <= 2 && (
                    <div className="px-4 pb-2">
                        <p className="text-xs text-gray-400 mb-2">Try asking:</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestedQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(q)}
                                    className="text-xs px-2 py-1 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded text-purple-300 transition-all"
                                >
                                    <Lightbulb className="w-3 h-3 inline mr-1" />
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-purple-500/30 bg-gray-900/50">
                    <div className="flex gap-2">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Ask Elara to teach you..."
                            className="flex-1 bg-gray-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none text-sm"
                            rows={2}
                            disabled={isTeaching}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!input.trim() || isTeaching}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 rounded-lg text-white transition-all"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Ask Elara to explain, draw, or code • Press Enter to send
                    </p>
                </div>
            </div>
        </div>
    );
}
