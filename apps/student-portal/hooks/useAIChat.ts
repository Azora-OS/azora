import { useState } from 'react';
import { api } from '../lib/api';

export const useAIChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (character: string, message: string) => {
    setLoading(true);
    
    const userMessage = { role: 'user', content: message, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await api.ai.chat(character, message, history);
      
      const aiMessage = {
        role: 'assistant',
        content: response.message,
        character: response.character,
        mood: response.mood,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      return response;
    } catch (err: any) {
      const errorMessage = {
        role: 'assistant',
        content: `Sorry, I'm having trouble connecting. ${err.message}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  return { messages, loading, sendMessage, clearChat };
};
