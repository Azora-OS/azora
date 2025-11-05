/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

'use client';

import { useState } from 'react';
import { Sparkles, Send, X, Minimize2, Maximize2 } from 'lucide-react';

export function ElaraAssistant() {
  const [expanded, setExpanded] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m Elara, your AI development assistant. How can I help you today?',
    },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    setMessages([
      ...messages,
      { role: 'user', content: message },
      { 
        role: 'assistant', 
        content: 'I can help you with code generation, debugging, refactoring, testing, and more. What would you like to work on?' 
      },
    ]);
    setMessage('');
  };

  return (
    <div className={`bg-card border-l border-border flex flex-col transition-all duration-300 ${
      expanded ? 'w-96' : 'w-12'
    }`}>
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4">
        {expanded && (
          <>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm">Elara AI</span>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </>
        )}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="w-full flex justify-center text-primary"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        )}
      </div>

      {expanded && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent text-foreground'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Elara anything..."
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleSend}
                className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
