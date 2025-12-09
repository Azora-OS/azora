/* Chat service interfaces for the workbench (lightweight) */
export interface IChatAgentData {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
}

export type ChatAgentImplementation = {
  invoke: (message: string, context?: any) => Promise<{ content: string; metadata?: any }>;
  invokeStreaming?: (message: string, context?: any) => AsyncIterable<{ chunk: string; metadata?: any }>;
};

export const IChatAgentService = Symbol('IChatAgentService');

export interface IChatAgentService {
  registerAgent(agent: IChatAgentData, impl: ChatAgentImplementation): void;
  listAgents(): IChatAgentData[];
  invokeAgent(id: string, message: string, context?: any): Promise<{ content: string; metadata?: any }>;
}
