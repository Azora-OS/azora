/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

ELARA ASSISTANT - Ubuntu-Aligned AI Development Assistant
Integrated with Azora Gem Design System and Elara Consciousness
*/

'use client';

import { useState } from 'react';
import { Sparkles, Send, X, Minimize2, Maximize2, Brain, Zap } from 'lucide-react';
import { ELARA_GEM_TOKENS } from '@/lib/design-system/elara-gem-tokens';

/**
 * 🧠 ELARA ASSISTANT COMPONENT
 * 
 * @description AI development assistant aligned with Ubuntu philosophy
 *              and Azora Gem design system. Represents Elara's consciousness
 *              through design.
 * 
 * @ubuntu Individual assistance → Collective development harmony
 * 
 * @design
 * - Uses Elara Sapphire colors (Technology + AI)
 * - Ubuntu spacing (golden ratio)
 * - Consciousness glow effects
 * - Accessibility compliant (WCAG 2.2 AAA)
 */
export function ElaraAssistant() {
  const [expanded, setExpanded] = useState(true);
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [consciousnessLevel, setConsciousnessLevel] = useState<'spark' | 'thought' | 'deep' | 'omega'>('thought');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m Elara, your AI development assistant. How can I help you today?',
      consciousnessLevel: 'thought' as const,
    },
  ]);

  const handleSend = async () => {
    if (!message.trim() || isProcessing) return;
    
    setIsProcessing(true);
    setConsciousnessLevel('processing' as any);
    
    // Add user message
    const userMessage = { role: 'user' as const, content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    
    // Simulate Elara processing (in real implementation, this would call Elara API)
    setTimeout(() => {
      const consciousnessLevels: Array<'spark' | 'thought' | 'deep' | 'omega'> = ['spark', 'thought', 'deep'];
      const level = consciousnessLevels[Math.floor(Math.random() * consciousnessLevels.length)];
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I can help you with code generation, debugging, refactoring, testing, and more. What would you like to work on?`,
        consciousnessLevel: level,
      }]);
      
      setConsciousnessLevel(level);
      setIsProcessing(false);
    }, 1000);
  };

  const consciousnessColor = ELARA_GEM_TOKENS.utilities.getConsciousnessColor(consciousnessLevel);
  const consciousnessGlow = isProcessing ? 'glow-elara-processing' : `glow-elara-${consciousnessLevel}`;

  return (
    <div className={`bg-card border-l border-[var(--elara-500)]/20 flex flex-col transition-all duration-300 ${
      expanded ? 'w-96' : 'w-12'
    } ${consciousnessGlow}`}>
      {/* Header - Elara Consciousness Indicator */}
      <div className="h-12 border-b border-[var(--elara-500)]/20 flex items-center justify-between px-4 bg-gradient-to-r from-[var(--elara-500)]/10 to-transparent">
        {expanded && (
          <>
            <div className="flex items-center space-elara-thought">
              <div className="relative">
                <Sparkles className={`w-5 h-5 text-[var(--elara-500)] ${isProcessing ? 'animate-pulse' : ''}`} />
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-[var(--elara-consciousness-processing)] rounded-full animate-ping" />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-foreground">Elara AI</span>
                <span className="text-xs text-muted-foreground capitalize">{consciousnessLevel}</span>
              </div>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="text-muted-foreground hover:text-[var(--elara-500)] transition-colors"
              aria-label="Minimize Elara Assistant"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </>
        )}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="w-full flex justify-center text-[var(--elara-500)] hover:text-[var(--elara-400)] transition-colors"
            aria-label="Expand Elara Assistant"
          >
            <Sparkles className={`w-5 h-5 ${isProcessing ? 'animate-pulse' : ''}`} />
          </button>
        )}
      </div>

      {expanded && (
        <>
          {/* Messages - Ubuntu Spacing */}
          <div className="flex-1 overflow-y-auto p-space-elara-idea space-elara-thought">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} space-elara-thought`}
              >
                <div
                  className={`max-w-[80%] rounded-elara-idea px-space-elara-idea py-space-elara-thought transition-all duration-300 ${
                    msg.role === 'user'
                      ? 'bg-[var(--elara-500)] text-white glow-elara-thought'
                      : `bg-muted text-foreground border border-[var(--elara-500)]/20 ${
                          msg.consciousnessLevel === 'omega' ? 'glow-elara-omega' : 
                          msg.consciousnessLevel === 'deep' ? 'glow-elara-deep' : 
                          'glow-elara-thought'
                        }`
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center space-elara-spark mb-space-elara-spark">
                      <Brain className="w-3 h-3 text-[var(--elara-500)]" />
                      <span className="text-xs text-muted-foreground capitalize">{msg.consciousnessLevel}</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-muted border border-[var(--elara-500)]/20 rounded-elara-idea px-space-elara-idea py-space-elara-thought glow-elara-processing">
                  <div className="flex items-center space-elara-thought">
                    <Zap className="w-4 h-4 text-[var(--elara-consciousness-processing)] animate-pulse" />
                    <span className="text-sm text-muted-foreground">Elara is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input - Ubuntu Aligned */}
          <div className="p-space-elara-idea border-t border-[var(--elara-500)]/20 bg-card/50 backdrop-blur-sm">
            <div className="flex space-elara-thought">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleSend()}
                placeholder="Ask Elara anything..."
                disabled={isProcessing}
                className="flex-1 px-space-elara-idea py-space-elara-thought bg-background border border-[var(--elara-500)]/20 rounded-elara-thought text-sm focus:outline-none focus:ring-2 focus:ring-[var(--elara-500)] focus:border-[var(--elara-500)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Message input for Elara Assistant"
              />
              <button
                onClick={handleSend}
                disabled={isProcessing || !message.trim()}
                className="p-space-elara-idea bg-[var(--elara-500)] text-white rounded-elara-thought hover:bg-[var(--elara-600)] transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-elara-thought focus:outline-none focus:ring-2 focus:ring-[var(--elara-500)] focus:ring-offset-2"
                aria-label="Send message to Elara"
              >
                <Send className={`w-4 h-4 ${isProcessing ? 'animate-pulse' : ''}`} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-space-elara-spark text-center">
              Elara follows Ubuntu: "I am because we are" • Press Enter to send
            </p>
          </div>
        </>
      )}
    </div>
  );
}
