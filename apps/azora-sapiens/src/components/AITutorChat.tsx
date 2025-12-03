import React, { useState, useRef, useEffect } from 'react';
import { TutorService, ChatMessage } from '../services/tutor-service';

interface AITutorChatProps {
    courseId: string;
    courseName: string;
}

export const AITutorChat: React.FC<AITutorChatProps> = ({ courseId, courseName }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            sender: 'ai',
            text: `Hello! I am your AI Tutor for **${courseName}**. How can I help you understand the material today?`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const tutorService = new TutorService();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const responseText = await tutorService.sendMessage(courseId, input);

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: responseText,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="tutor-chat-container">
            <div className="chat-header">
                <div className="avatar ai-avatar">🤖</div>
                <div className="header-info">
                    <h3>Azora AI Tutor</h3>
                    <span className="status">Online • Constitutional Mode</span>
                </div>
            </div>

            <div className="messages-area">
                {messages.map(msg => (
                    <div key={msg.id} className={`message ${msg.sender}`}>
                        <div className="message-bubble">
                            {msg.text}
                        </div>
                        <span className="timestamp">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
                {isTyping && (
                    <div className="message ai typing">
                        <div className="typing-indicator">
                            <span>•</span><span>•</span><span>•</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask a question about this course..."
                    disabled={isTyping}
                />
                <button onClick={handleSend} disabled={!input.trim() || isTyping}>
                    Send
                </button>
            </div>

            <style jsx>{`
        .tutor-chat-container {
          display: flex;
          flex-direction: column;
          height: 500px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #fff;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .chat-header {
          padding: 15px;
          background: #f7fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          background: #edf2f7;
        }

        .ai-avatar {
          background: #ebf8ff;
          color: #4299e1;
        }

        .header-info h3 {
          margin: 0;
          font-size: 16px;
          color: #2d3748;
        }

        .status {
          font-size: 12px;
          color: #48bb78;
        }

        .messages-area {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .message {
          display: flex;
          flex-direction: column;
          max-width: 80%;
        }

        .message.user {
          align-self: flex-end;
          align-items: flex-end;
        }

        .message.ai {
          align-self: flex-start;
        }

        .message-bubble {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.5;
        }

        .message.user .message-bubble {
          background: #667eea;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message.ai .message-bubble {
          background: #f7fafc;
          color: #2d3748;
          border: 1px solid #edf2f7;
          border-bottom-left-radius: 4px;
        }

        .timestamp {
          font-size: 10px;
          color: #a0aec0;
          margin-top: 4px;
          margin-left: 4px;
        }

        .input-area {
          padding: 15px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 10px;
        }

        input {
          flex: 1;
          padding: 10px 15px;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          outline: none;
          transition: border-color 0.2s;
        }

        input:focus {
          border-color: #667eea;
        }

        button {
          background: #667eea;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
        }

        button:hover:not(:disabled) {
          background: #5a67d8;
        }

        button:disabled {
          background: #cbd5e0;
          cursor: not-allowed;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 8px 12px;
          background: #f7fafc;
          border-radius: 12px;
          width: fit-content;
        }

        .typing-indicator span {
          animation: bounce 1.4s infinite ease-in-out both;
          color: #a0aec0;
          font-size: 20px;
          line-height: 10px;
        }

        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
        </div>
    );
};
