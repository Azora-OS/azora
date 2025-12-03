import React, { useState, useRef, useEffect } from 'react';

interface PanelAreaProps {
  aiPanelOpen: boolean;
  terminalOpen: boolean;
  onToggleAI: () => void;
  onToggleTerminal: () => void;
}

const PanelArea: React.FC<PanelAreaProps> = ({
  aiPanelOpen,
  terminalOpen,
  onToggleAI,
  onToggleTerminal
}) => {
  const [activePanel, setActivePanel] = useState<'ai' | 'terminal'>('ai');
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Hello! I\'m your AI assistant. How can I help you with your code today?' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>(['$ Welcome to AzStudio Terminal']);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  const handleAiSend = async () => {
    if (!aiInput.trim()) return;

    // Add user message
    const newMessages = [...aiMessages, { role: 'user' as const, content: aiInput }];
    setAiMessages(newMessages);
    setAiInput('');

    // Simulate AI response (replace with real AI integration)
    setTimeout(() => {
      const aiResponse = `I understand you want to: "${aiInput}". Let me help you with that! This is a simulated response - in production, this would connect to OpenAI/Anthropic API.`;
      setAiMessages(prev => [...prev, { role: 'assistant' as const, content: aiResponse }]);
    }, 1000);
  };

  const handleTerminalInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && terminalInput.trim()) {
      const newHistory = [...terminalHistory, `$ ${terminalInput}`];
      
      // Simulate command execution
      if (terminalInput === 'clear') {
        newHistory.push('Terminal cleared');
        setTerminalHistory(['$ Terminal cleared']);
      } else if (terminalInput === 'help') {
        newHistory.push('Available commands: clear, help, ls, pwd, npm install, npm start');
        setTerminalHistory(newHistory);
      } else if (terminalInput.startsWith('npm')) {
        newHistory.push(`Running: ${terminalInput}`);
        newHistory.push('Command executed successfully (simulated)');
        setTerminalHistory(newHistory);
      } else {
        newHistory.push(`Command not found: ${terminalInput}`);
        setTerminalHistory(newHistory);
      }
      
      setTerminalInput('');
    }
  };

  const renderAIPanel = () => (
    <div className="panel-content">
      <div className="ai-chat">
        <div className="ai-messages">
          {aiMessages.map((message, index) => (
            <div
              key={index}
              className={`ai-message ${message.role}`}
              style={{
                marginBottom: '12px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: message.role === 'user' ? '#007acc' : '#2d2d2d',
                color: 'white',
                maxWidth: '90%'
              }}
            >
              {message.content}
            </div>
          ))}
        </div>
        <div className="ai-input">
          <textarea
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="Ask me anything about your code..."
            rows={3}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAiSend();
              }
            }}
          />
          <button onClick={handleAiSend}>Send</button>
        </div>
      </div>
    </div>
  );

  const renderTerminalPanel = () => (
    <div className="panel-content">
      <div className="terminal" ref={terminalRef}>
        {terminalHistory.map((line, index) => (
          <div key={index} style={{ marginBottom: '2px' }}>
            {line}
          </div>
        ))}
        <div className="terminal-input">
          <span className="terminal-prompt">$</span>
          <input
            type="text"
            value={terminalInput}
            onChange={(e) => setTerminalInput(e.target.value)}
            onKeyDown={handleTerminalInput}
            placeholder="Type a command..."
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="panel-area">
      <div className="panel-tabs">
        <button
          className={`panel-tab ${activePanel === 'ai' ? 'active' : ''}`}
          onClick={() => setActivePanel('ai')}
        >
          💬 AI Assistant
        </button>
        <button
          className={`panel-tab ${activePanel === 'terminal' ? 'active' : ''}`}
          onClick={() => setActivePanel('terminal')}
        >
          🖥️ Terminal
        </button>
      </div>

      {activePanel === 'ai' && renderAIPanel()}
      {activePanel === 'terminal' && renderTerminalPanel()}
    </div>
  );
};

export default PanelArea;
