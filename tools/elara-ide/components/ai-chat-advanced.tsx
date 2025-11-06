/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Send, X, Minimize2, Maximize2, Code2,
  FileText, Wand2, AlertCircle, CheckCircle2, Loader2,
  Copy, ThumbsUp, ThumbsDown
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  codeBlocks?: string[];
  timestamp: Date;
  loading?: boolean;
}

interface AIChatAdvancedProps {
  codeContext?: string;
  activeFile?: string | null;
  onApplyCode?: (code: string) => void;
}

export function AIChatAdvanced({
  codeContext,
  activeFile,
  onApplyCode
}: AIChatAdvancedProps) {
  const [expanded, setExpanded] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m Elara, your AI development assistant. I can help you with:\n\n✨ Code generation and completion\n🔍 Debugging and error analysis\n🔧 Refactoring and optimization\n📝 Documentation and explanations\n🧪 Test generation\n📚 Architecture decisions\n\nWhat would you like to work on?',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      loading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // TODO: Replace with actual Elara API call
      const response = await getAIResponse(message, codeContext);

      // Remove loading message and add response
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages.pop(); // Remove loading message
        newMessages.push({
          role: 'assistant',
          content: response.content,
          codeBlocks: response.codeBlocks || [],
          timestamp: new Date(),
        });
        return newMessages;
      });
    } catch (error) {
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages.pop();
        newMessages.push({
          role: 'assistant',
          content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
          timestamp: new Date(),
        });
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAIResponse = async (
    userMessage: string,
    context?: string
  ): Promise<{ content: string; codeBlocks?: string[] }> => {
    // Simulate API call - replace with actual Elara integration
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Extract code blocks from response
    const codeBlocks: string[] = [];

    // Intelligent response based on user intent
    let content = '';
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('explain') || lowerMessage.includes('what') || lowerMessage.includes('how')) {
      content = `Based on the code context${context ? ' you provided' : ''}, here's an explanation:\n\n`;
      if (context) {
        const lines = context.split('\n').length;
        const complexity = lines > 50 ? 'complex' : lines > 20 ? 'moderate' : 'simple';
        content += `This appears to be a ${complexity} implementation with ${lines} lines of code. `;
        content += `The code follows common patterns and best practices. `;
      }
      content += `\nWould you like me to dive deeper into any specific part?`;
    } else if (lowerMessage.includes('fix') || lowerMessage.includes('error') || lowerMessage.includes('bug')) {
      content = `I'll help you fix that! Here's a solution:\n\n`;
      codeBlocks.push(`// Fixed code\nfunction fixedFunction() {\n  // Your fixed implementation\n  return true;\n}`);
      content += 'Would you like me to apply this fix to your file?';
    } else if (lowerMessage.includes('generate') || lowerMessage.includes('create') || lowerMessage.includes('make')) {
      content = `I'll generate that for you:\n\n`;
      const componentName = userMessage.match(/component|class|function\s+(\w+)/i)?.[1] || 'Generated';
      codeBlocks.push(`// Generated code\nconst ${componentName} = () => {\n  // Implementation\n  return null;\n};`);
      content += 'You can apply this code or ask me to modify it.';
    } else if (lowerMessage.includes('refactor') || lowerMessage.includes('optimize') || lowerMessage.includes('improve')) {
      content = `I'll help you refactor that code:\n\n`;
      codeBlocks.push(`// Refactored code\n// Improved version with better structure`);
      content += 'Here\'s an optimized version. Would you like me to apply it?';
    } else if (lowerMessage.includes('test') || lowerMessage.includes('spec')) {
      content = `I'll generate tests for you:\n\n`;
      codeBlocks.push(`// Test suite\ndescribe('Test Suite', () => {\n  it('should work', () => {\n    expect(true).toBe(true);\n  });\n});`);
      content += 'Here\'s a test suite. Apply it or ask for modifications.';
    } else {
      content = `I understand you're asking about: "${userMessage}"\n\n`;
      content += `I can help you with:\n`;
      content += `✨ Code generation and completion\n`;
      content += `🔍 Debugging and error analysis\n`;
      content += `🔧 Refactoring and optimization\n`;
      content += `📝 Documentation and explanations\n`;
      content += `🧪 Test generation\n\n`;
      content += `Could you provide more context or be more specific about what you'd like?`;
    }

    return { content, codeBlocks };
  };

  const handleApplyCode = (code: string) => {
    if (onApplyCode) {
      onApplyCode(code);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const handleFeedback = (messageIndex: number, positive: boolean) => {
    // TODO: Send feedback to Elara
    console.log(`Feedback for message ${messageIndex}: ${positive ? 'positive' : 'negative'}`);
  };

  return (
    <div className={`bg-card border-l border-border flex flex-col transition-all duration-300 ${
      expanded ? 'w-[420px]' : 'w-12'
    }`}>
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-card/50 backdrop-blur-sm">
        {expanded && (
          <>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-card"></div>
              </div>
              <span className="font-semibold text-sm">Elara AI</span>
              {activeFile && (
                <span className="text-xs text-muted-foreground">
                  • {activeFile.split('/').pop()}
                </span>
              )}
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </>
        )}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="w-full flex justify-center text-primary hover:text-primary/80 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        )}
      </div>

      {expanded && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-card/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent text-foreground border border-border'
                  }`}
                >
                  {msg.loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Elara is thinking...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm whitespace-pre-wrap">{msg.content}</div>

                      {/* Code Blocks */}
                      {msg.codeBlocks && msg.codeBlocks.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.codeBlocks.map((codeBlock, codeIdx) => (
                            <div
                              key={codeIdx}
                              className="bg-background border border-border rounded p-3 relative group"
                            >
                              <pre className="text-xs overflow-x-auto">
                                <code>{codeBlock}</code>
                              </pre>
                              <div className="flex items-center justify-end mt-2 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleCopyCode(codeBlock)}
                                  className="p-1 hover:bg-accent rounded text-xs"
                                  title="Copy"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                                {onApplyCode && (
                                  <button
                                    onClick={() => handleApplyCode(codeBlock)}
                                    className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs hover:opacity-90"
                                    title="Apply to file"
                                  >
                                    Apply
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Feedback buttons for assistant messages */}
                      {msg.role === 'assistant' && !msg.loading && (
                        <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-border/50">
                          <button
                            onClick={() => handleFeedback(idx, true)}
                            className="p-1 hover:bg-accent rounded"
                            title="Helpful"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleFeedback(idx, false)}
                            className="p-1 hover:bg-accent rounded"
                            title="Not helpful"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 border-t border-border bg-card/50">
            <div className="flex items-center space-x-1 overflow-x-auto pb-2">
              <button className="px-3 py-1.5 bg-accent rounded-lg text-xs whitespace-nowrap hover:bg-accent/80 transition-colors flex items-center space-x-1">
                <Code2 className="w-3 h-3" />
                <span>Generate</span>
              </button>
              <button className="px-3 py-1.5 bg-accent rounded-lg text-xs whitespace-nowrap hover:bg-accent/80 transition-colors flex items-center space-x-1">
                <FileText className="w-3 h-3" />
                <span>Explain</span>
              </button>
              <button className="px-3 py-1.5 bg-accent rounded-lg text-xs whitespace-nowrap hover:bg-accent/80 transition-colors flex items-center space-x-1">
                <Wand2 className="w-3 h-3" />
                <span>Refactor</span>
              </button>
              <button className="px-3 py-1.5 bg-accent rounded-lg text-xs whitespace-nowrap hover:bg-accent/80 transition-colors flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>Debug</span>
              </button>
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
            <div className="flex space-x-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask Elara anything... (Shift+Enter for new line)"
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none min-h-[40px] max-h-[120px]"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Tip: Use <kbd className="px-1.5 py-0.5 bg-accent rounded">Ctrl+K</kbd> for commands, <kbd className="px-1.5 py-0.5 bg-accent rounded">Ctrl+L</kbd> to focus chat
            </div>
          </div>
        </>
      )}
    </div>
  );
}

