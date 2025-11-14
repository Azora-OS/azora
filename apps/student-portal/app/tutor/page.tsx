'use client';

import { useState, useRef, useEffect } from 'react';
import { useAIChat, usePersonalities } from '@/hooks/use-ai-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Sparkles, Brain, Heart, Shield, Star } from 'lucide-react';
import { Header } from '@/components/header';

export default function TutorPage() {
  const [personality, setPersonality] = useState('elara');
  const [message, setMessage] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, isLoading } = useAIChat(personality);
  const { data: personalities } = usePersonalities();

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage(message);
    setMessage('');
  };

  const getPersonalityIcon = (role: string) => {
    if (role.includes('Teacher')) return <Brain className="h-4 w-4" />;
    if (role.includes('Guide')) return <Star className="h-4 w-4" />;
    if (role.includes('Security')) return <Shield className="h-4 w-4" />;
    return <Heart className="h-4 w-4" />;
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* AI Family Sidebar */}
        <div className="w-72 bg-slate-900/30 backdrop-blur-xl border-r border-slate-800/50 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">AI Family</h3>
                <p className="text-xs text-slate-400">Choose your tutor</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {personalities?.map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => setPersonality(p.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 group ${
                    personality === p.id
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 shadow-lg shadow-teal-500/25'
                      : 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{p.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold ${personality === p.id ? 'text-white' : 'text-slate-200'}`}>
                        {p.name}
                      </div>
                      <div className={`text-xs flex items-center gap-1 mt-1 ${
                        personality === p.id ? 'text-teal-100' : 'text-slate-400'
                      }`}>
                        {getPersonalityIcon(p.role)}
                        <span>{p.role}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-xl">
                {personalities?.find((p: any) => p.id === personality)?.emoji || '🤖'}
              </div>
              <div>
                <h2 className="text-white font-bold">
                  {personalities?.find((p: any) => p.id === personality)?.name || 'AI Tutor'}
                </h2>
                <p className="text-xs text-slate-400">
                  {personalities?.find((p: any) => p.id === personality)?.role || 'Ready to help'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="h-10 w-10 text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Start Your Learning Journey</h3>
                <p className="text-slate-400 max-w-md">
                  Ask anything! Your AI tutor is here to help you learn and grow with Ubuntu philosophy.
                </p>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar className={`w-10 h-10 ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-500' 
                    : 'bg-gradient-to-br from-teal-500 to-emerald-500'
                }`}>
                  <AvatarFallback className="text-white font-semibold">
                    {msg.role === 'user' ? 'U' : 'AI'}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`flex-1 max-w-2xl ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                  <div className={`rounded-2xl px-6 py-4 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 text-slate-100'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4">
                <Avatar className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500">
                  <AvatarFallback className="text-white font-semibold">AI</AvatarFallback>
                </Avatar>
                <div className="flex-1 max-w-2xl">
                  <div className="rounded-2xl px-6 py-4 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-slate-900/50 backdrop-blur-xl border-t border-slate-800/50 p-6">
            <form onSubmit={handleSend} className="flex gap-3">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask anything... Ubuntu: I learn because we learn"
                className="flex-1 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500/50 h-12 px-6 rounded-xl"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="h-12 px-6 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 rounded-xl shadow-lg shadow-teal-500/25 transition-all duration-300"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
