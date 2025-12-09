import React, { useState, useRef, useEffect } from 'react';
import './ChatPanel.css';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface ChatSession {
  id: string;
  agentId: string;
  messages: ChatMessage[];
  createdAt: number;
}

interface ChatPanelProps {
  onClose?: () => void;
  defaultAgentId?: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ onClose, defaultAgentId = 'azora.elara' }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(defaultAgentId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for streaming chunks (simplified for now)
  useEffect(() => {
    const handleChunk = (data: { sessionId: string; chunk: string; metadata?: any }) => {
      if (data.sessionId === currentSessionId) {
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, content: lastMessage.content + data.chunk },
            ];
          }
          return prev;
        });
      }
    };

    // Set up listener if available
    if (window.electronAPI?.onChatChunk) {
      window.electronAPI.onChatChunk(handleChunk);
    }
    return () => {
      // Cleanup would be implemented if needed
    };
  }, [currentSessionId]);

  const createSession = async () => {
    try {
      const result = await window.electronAPI?.chat?.createSession(selectedAgentId);
      if (result?.success && result?.session) {
        setSessions(prev => [...prev, result.session]);
        setCurrentSessionId(result.session.id);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentSessionId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Use regular (non-streaming) chat API for now
      const result = await window.electronAPI?.chat?.sendMessage(currentSessionId, input);
      
      if (result?.success && result?.response) {
        const assistantMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: result.response.content,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${(error as Error).message}`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const switchAgent = async (agentId: string) => {
    setSelectedAgentId(agentId);
    // Create new session with new agent
    await createSession();
  };

  const loadSessions = async () => {
    try {
      const result = await window.electronAPI?.chat?.listSessions();
      if (result?.success && result?.sessions) {
        setSessions(result.sessions);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h2>Chat Assistant</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="chat-agent-selector">
        <label>Agent:</label>
        <select value={selectedAgentId} onChange={e => switchAgent(e.target.value)}>
          <option value="azora.elara">Elara</option>
          <option value="azora.themba">Themba</option>
          <option value="azora.kofi">Kofi</option>
        </select>
        <button onClick={createSession} className="new-session-btn">New Session</button>
      </div>

      <div className="chat-sessions">
        <h3>Sessions</h3>
        <div className="sessions-list">
          {sessions.map(session => (
            <div
              key={session.id}
              className={`session-item ${currentSessionId === session.id ? 'active' : ''}`}
              onClick={() => {
                setCurrentSessionId(session.id);
                setMessages(session.messages);
              }}
            >
              <span className="session-agent">{session.agentId}</span>
              <span className="session-date">
                {new Date(session.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>Start a conversation by typing a message below</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`message message-${msg.role}`}>
              <div className="message-role">{msg.role}</div>
              <div className="message-content">{msg.content}</div>
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
        {isStreaming && (
          <div className="message message-assistant streaming">
            <div className="message-role">assistant</div>
            <div className="message-content">
              <span className="typing-indicator">
                <span></span><span></span><span></span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type your message... (Shift+Enter for new line)"
          disabled={isLoading || !currentSessionId}
          className="chat-input"
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !currentSessionId || !input.trim()}
          className="send-btn"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
