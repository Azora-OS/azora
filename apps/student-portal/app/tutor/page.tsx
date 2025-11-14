'use client';

import { useState, useRef, useEffect } from 'react';
import { useTutoring } from '@/hooks/use-tutoring';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AzoraLogo } from '@/components/azora-logo';
import { Header } from '@/components/header';

export default function TutorPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { startSession, postMessage, getHistory } = useTutoring(sessionId);

  useEffect(() => {
    if (getHistory.data) {
      setMessages(getHistory.data);
    }
  }, [getHistory.data]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStartSession = async () => {
    try {
      const session = await startSession.mutateAsync({ studentId: 'test-user', subject });
      setSessionId(session.id);
    } catch (error) {
      console.error('Failed to start session', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !message.trim()) return;

    const userMessage = { sender: 'user', text: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    try {
      const response = await postMessage.mutateAsync({ sessionId, message });
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Failed to send message', error);
      const errorMessage = { sender: 'system', text: 'Error: Could not get a response.' };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex flex-col items-center justify-center">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-[420px] bg-slate-900/50 border-slate-800 text-white">
            <CardHeader className="text-center">
              <AzoraLogo size={48} showText className="mx-auto mb-4" />
              <CardTitle className="text-2xl">Start Your AI Tutoring Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input 
                  placeholder="What do you want to learn about? (e.g., Quantum Physics)" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-slate-800 border-slate-700 focus:ring-teal-500"
                />
                <Button onClick={handleStartSession} disabled={startSession.isPending || !subject.trim()} className="w-full bg-teal-500 hover:bg-teal-600">
                  {startSession.isPending ? 'Starting...' : 'Start Learning'}
                </Button>
                {startSession.error && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Could not start a tutoring session. Please try again.</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 text-white">
      <Header />
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender !== 'user' && (
              <Avatar>
                <AvatarImage src="/branding/logo-primary.svg" alt="AI Tutor" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
            )}
            <div className={`rounded-lg px-4 py-2 max-w-lg ${msg.sender === 'user' ? 'bg-teal-600' : 'bg-slate-800'}`}>
              <p>{msg.text}</p>
            </div>
            {msg.sender === 'user' && (
               <Avatar>
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {postMessage.isPending && (
          <div className="flex items-start gap-3">
            <Avatar>
                <AvatarImage src="/branding/logo-primary.svg" alt="AI Tutor" />
                <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div className="rounded-lg px-4 py-2 max-w-lg bg-slate-800 animate-pulse">
              <p>Thinking...</p>
            </div>
          </div>
        )}
      </main>

      <footer className="p-4 border-t border-slate-800">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            placeholder="Ask a question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 bg-slate-800 border-slate-700 focus:ring-teal-500"
            autoFocus
          />
          <Button type="submit" size="icon" disabled={postMessage.isPending || !message.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </footer>
    </div>
  );
}
