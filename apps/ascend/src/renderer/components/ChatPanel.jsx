import React, { useState, useEffect } from 'react';

const ChatPanel = ({ onClose }) => {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [livenessMessage, setLivenessMessage] = useState('Thinking...');
  
  const livenessMessages = [
    "Consulting the ConstitutionalCore...",
    "Elara is weaving sovereign logic...",
    "Verifying truth vectors in Knowledge Ocean...",
    "Constructing ethical reasoning paths...",
    "Accessing Citadel's secure memory banks...",
    "Harmonizing with the Agent Collective...",
    "Scanning for constitutional alignment..."
  ];

  useEffect(() => {
    let interval;
    if (isLoading) {
      setLivenessMessage(livenessMessages[0]);
      interval = setInterval(() => {
        setLivenessMessage(prev => {
          const currentIndex = livenessMessages.indexOf(prev);
          const nextIndex = (currentIndex + 1) % livenessMessages.length;
          return livenessMessages[nextIndex];
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const [agents] = useState([
    { id: 'azora.elara', name: 'Elara', description: 'General AI Assistant' },
    { id: 'azora.codegen', name: 'CodeGen', description: 'Code Generation Specialist' },
  ]);

  useEffect(() => {
    // Load existing sessions or create a default one
    if (sessions.length === 0) {
      handleCreateSession('azora.elara');
    }
  }, []);

  const handleCreateSession = async (agentId) => {
    try {
      if (!window.electronAPI?.chat?.createSession) {
        console.error('Chat API not available');
        return;
      }

      const result = await window.electronAPI.chat.createSession(agentId);
      if (result.success && result.session) {
        const newSession = {
          id: result.session.id,
          agentId,
          messages: [],
          createdAt: Date.now(),
        };
        setSessions(prev => [...prev, newSession]);
        setActiveSession(newSession.id);
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !activeSession) return;

    const session = sessions.find(s => s.id === activeSession);
    if (!session) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    // Add user message
    setSessions(prev => prev.map(s =>
      s.id === activeSession
        ? { ...s, messages: [...s.messages, userMessage] }
        : s
    ));

    setInput('');
    setIsLoading(true);

    try {
      if (!window.electronAPI?.chat?.sendMessage) {
        throw new Error('Chat API not available');
      }

      const result = await window.electronAPI.chat.sendMessage(activeSession, input);
      if (result.success && result.response) {
        const assistantMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: result.response.content || 'No response',
          timestamp: Date.now(),
        };

        setSessions(prev => prev.map(s =>
          s.id === activeSession
            ? { ...s, messages: [...s.messages, assistantMessage] }
            : s
        ));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: Date.now(),
      };

      setSessions(prev => prev.map(s =>
        s.id === activeSession
          ? { ...s, messages: [...s.messages, errorMessage] }
          : s
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const activeSessionData = sessions.find(s => s.id === activeSession);

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3>AI Chat</h3>
        <button className="close-button" onClick={onClose}>✕</button>
      </div>

      <div className="chat-sessions">
        <h4>Sessions</h4>
        {sessions.map(session => (
          <div
            key={session.id}
            className={`session-item ${activeSession === session.id ? 'active' : ''}`}
            onClick={() => setActiveSession(session.id)}
          >
            <span>{agents.find(a => a.id === session.agentId)?.name || 'Unknown'}</span>
            <span className="message-count">({session.messages.length})</span>
          </div>
        ))}

        <div className="agent-selector">
          <h4>New Session</h4>
          {agents.map(agent => (
            <button
              key={agent.id}
              className="agent-button"
              onClick={() => handleCreateSession(agent.id)}
            >
              {agent.name}
            </button>
          ))}
        </div>
      </div>

      <div className="chat-messages">
        {activeSessionData?.messages.map(message => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-content">
              {message.content}
            </div>
            <div className="message-timestamp">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant loading">
            <div className="message-content">
               <span className="liveness-indicator">⚡</span> {livenessMessage}
            </div>
          </div>
        )}
      </div>

      <div className="chat-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ask me anything..."
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={!input.trim() || isLoading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
