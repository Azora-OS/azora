'use client';

import { useState, useRef, useEffect } from 'react';
import { useAIChat, usePersonalities } from '@/hooks/use-ai-chat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Sparkles } from 'lucide-react';
import { Header } from '@/components/header';

export default function TutorPage() {
  const [personality, setPersonality] = useState('elara');
  const [message, setMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, isLoading } = useAIChat(personality);
  const { data: personalities } = usePersonalities();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage(message);
    setMessage('');
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Personality Selector */}
        <div className="w-64 bg-slate-900/50 border-r border-slate-800 p-4 overflow-y-auto">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-400" />
            AI Family
          </h3>
          <div className="space-y-2">
            {personalities?.map((p: any) => (
              <button
                key={p.id}
                onClick={() => setPersonality(p.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  personality === p.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-medium">{p.emoji} {p.name}</div>
                <div className="text-xs opacity-75">{p.role}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 mt-12">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation with your AI tutor!</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <Avatar className="bg-teal-600">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div className={`rounded-lg px-4 py-3 max-w-2xl ${
                  msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <Avatar className="bg-blue-600">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="bg-teal-600">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-3 bg-slate-800 animate-pulse">
                  <p className="text-slate-400">Thinking...</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-800">
            <form onSubmit={handl