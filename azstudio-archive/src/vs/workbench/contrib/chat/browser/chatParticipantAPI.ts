// Lightweight API stub so workers and contributions can call into chat participants
export interface ChatMessage {
  role: 'user' | 'agent' | 'system';
  content: string;
}

export interface ChatSessionDescriptor {
  id: string;
  agentId: string;
}

export default ChatMessage;
