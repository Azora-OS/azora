import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api-provider';

export function useAIChat(personality: string = 'elara') {
  const api = useApi();
  const [messages, setMessages] = useState<any[]>([]);

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const response: any = await api.request('/api/ai-family/chat', {
        method: 'POST',
        body: JSON.stringify({ personality, message })
      });
      return response?.data;
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, 
        { role: 'user', content: data.userMessage },
        { role: 'assistant', content: data.response, personality: data.personality }
      ]);
    }
  });

  return {
    messages,
    sendMessage: (msg: string) => sendMessage.mutate(msg),
    isLoading: sendMessage.isPending
  };
}

export function usePersonalities() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['personalities'],
    queryFn: async () => {
      const response: any = await api.request('/api/ai-family/personalities');
      return response?.data || [];
    }
  });
}
