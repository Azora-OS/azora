// BuildSpaces API Integration for AzStudio
// Connect AzStudio to BuildSpaces Citadel endpoints

interface BuildSpacesProject {
  id: string;
  name: string;
  description: string;
  vision: {
    title: string;
    description: string;
    goals: string[];
    successCriteria: string[];
  };
  status: 'planning' | 'development' | 'testing' | 'deployment' | 'production';
  createdAt: string;
  updatedAt: string;
  collaborators: Array<{
    id: string;
    name: string;
    role: 'owner' | 'admin' | 'developer' | 'viewer';
  }>;
  tags: string[];
  metadata: {
    repository?: string;
    deploymentUrl?: string;
    version: string;
  };
}

interface BuildSpacesAgent {
  id: string;
  name: string;
  type: 'zola' | 'jabari' | 'kofi' | 'abeni' | 'nexus' | 'elara';
  status: 'idle' | 'active' | 'busy' | 'offline';
  capabilities: string[];
  currentTask?: {
    id: string;
    title: string;
    projectId: string;
  };
  performance: {
    tasksCompleted: number;
    averageCompletionTime: number;
    qualityScore: number;
  };
}

interface BuildSpacesTask {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assignedTo?: string;
  projectId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  dependencies: string[];
  estimatedDuration: number;
  actualDuration?: number;
  requirements: string[];
}

interface BuildSpacesConfig {
  apiBaseUrl: string;
  apiKey: string;
  wsUrl: string;
  timeout: number;
  retryAttempts: number;
}

class BuildSpacesAPI {
  private config: BuildSpacesConfig;
  private wsConnection: WebSocket | null = null;
  private eventListeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config: BuildSpacesConfig) {
    this.config = config;
  }

  // Project Management
  async getProjects(): Promise<BuildSpacesProject[]> {
    return this.makeRequest('/projects', 'GET');
  }

  async getProject(projectId: string): Promise<BuildSpacesProject> {
    return this.makeRequest(`/projects/${projectId}`, 'GET');
  }

  async createProject(projectData: Partial<BuildSpacesProject>): Promise<BuildSpacesProject> {
    return this.makeRequest('/projects', 'POST', projectData);
  }

  async updateProject(projectId: string, updates: Partial<BuildSpacesProject>): Promise<BuildSpacesProject> {
    return this.makeRequest(`/projects/${projectId}`, 'PUT', updates);
  }

  async deleteProject(projectId: string): Promise<void> {
    return this.makeRequest(`/projects/${projectId}`, 'DELETE');
  }

  // Agent Management
  async getAgents(): Promise<BuildSpacesAgent[]> {
    return this.makeRequest('/agents', 'GET');
  }

  async getAgent(agentId: string): Promise<BuildSpacesAgent> {
    return this.makeRequest(`/agents/${agentId}`, 'GET');
  }

  async initializeAgents(projectId: string, agentNames: string[]): Promise<void> {
    return this.makeRequest(`/projects/${projectId}/agents/init`, 'POST', { agents: agentNames });
  }

  async terminateAgent(agentId: string): Promise<void> {
    return this.makeRequest(`/agents/${agentId}/terminate`, 'POST');
  }

  async getAgentStatus(agentId: string): Promise<BuildSpacesAgent> {
    return this.makeRequest(`/agents/${agentId}/status`, 'GET');
  }

  // Task Management
  async getTasks(projectId: string): Promise<BuildSpacesTask[]> {
    return this.makeRequest(`/projects/${projectId}/tasks`, 'GET');
  }

  async getTask(taskId: string): Promise<BuildSpacesTask> {
    return this.makeRequest(`/tasks/${taskId}`, 'GET');
  }

  async createTask(taskData: Partial<BuildSpacesTask>): Promise<BuildSpacesTask> {
    return this.makeRequest('/tasks', 'POST', taskData);
  }

  async updateTask(taskId: string, updates: Partial<BuildSpacesTask>): Promise<BuildSpacesTask> {
    return this.makeRequest(`/tasks/${taskId}`, 'PUT', updates);
  }

  async deleteTask(taskId: string): Promise<void> {
    return this.makeRequest(`/tasks/${taskId}`, 'DELETE');
  }

  async assignTask(taskId: string, agentId: string): Promise<void> {
    return this.makeRequest(`/tasks/${taskId}/assign`, 'POST', { agentId });
  }

  // Genesis Station Integration
  async getGenesisStation(projectId: string): Promise<any> {
    return this.makeRequest(`/projects/${projectId}/genesis`, 'GET');
  }

  async updateGenesisStation(projectId: string, updates: any): Promise<void> {
    return this.makeRequest(`/projects/${projectId}/genesis/update`, 'POST', updates);
  }

  async searchGenesisStation(projectId: string, query: string): Promise<any[]> {
    return this.makeRequest(`/projects/${projectId}/genesis/search`, 'POST', { query });
  }

  // Elara Integration
  async chatWithElara(projectId: string, message: string): Promise<any> {
    return this.makeRequest('/elara/chat', 'POST', { projectId, message });
  }

  async getElaraInstructions(projectId: string): Promise<any[]> {
    return this.makeRequest(`/projects/${projectId}/elara/instructions`, 'GET');
  }

  async sendUserInstruction(instruction: any): Promise<void> {
    return this.makeRequest('/elara/instruction', 'POST', instruction);
  }

  // Agent Communication
  async sendAgentMessage(agentId: string, message: any): Promise<void> {
    return this.makeRequest(`/agents/${agentId}/message`, 'POST', message);
  }

  async getAgentMessages(agentId: string): Promise<any[]> {
    return this.makeRequest(`/agents/${agentId}/messages`, 'GET');
  }

  // WebSocket Connection
  connectWebSocket(projectId: string): void {
    const wsUrl = `${this.config.wsUrl}/projects/${projectId}/stream`;
    
    try {
      this.wsConnection = new WebSocket(wsUrl);
      
      this.wsConnection.onopen = () => {
        console.log('🔌 Connected to BuildSpaces WebSocket');
        this.reconnectAttempts = 0;
        this.emit('websocket_connected', { projectId });
      };
      
      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.wsConnection.onclose = () => {
        console.log('🔌 Disconnected from BuildSpaces WebSocket');
        this.emit('websocket_disconnected', { projectId });
        
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => {
            console.log(`🔄 Reconnecting to WebSocket (attempt ${this.reconnectAttempts})`);
            this.connectWebSocket(projectId);
          }, 5000 * this.reconnectAttempts);
        }
      };
      
      this.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('websocket_error', { projectId, error });
      };
      
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.emit('websocket_connection_failed', { projectId, error });
    }
  }

  disconnectWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  private handleWebSocketMessage(data: any): void {
    switch (data.type) {
      case 'agent_status_update':
        this.emit('agent_status_update', data);
        break;
      case 'task_update':
        this.emit('task_update', data);
        break;
      case 'project_update':
        this.emit('project_update', data);
        break;
      case 'genesis_update':
        this.emit('genesis_update', data);
        break;
      case 'elara_message':
        this.emit('elara_message', data);
        break;
      case 'agent_message':
        this.emit('agent_message', data);
        break;
      case 'conflict_detected':
        this.emit('conflict_detected', data);
        break;
      case 'progress_update':
        this.emit('progress_update', data);
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }

  // Event System
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => callback(data));
  }

  // HTTP Request Helper
  private async makeRequest(endpoint: string, method: string = 'GET', data?: any): Promise<any> {
    const url = `${this.config.apiBaseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`
    };

    const config: RequestInit = {
      method,
      headers
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return null;
      }
      
    } catch (error) {
      console.error(`BuildSpaces API request failed: ${method} ${endpoint}`, error);
      throw error;
    }
  }

  // Utility Methods
  async healthCheck(): Promise<boolean> {
    try {
      await this.makeRequest('/health', 'GET');
      return true;
    } catch (error) {
      return false;
    }
  }

  async getSystemStatus(): Promise<any> {
    return this.makeRequest('/system/status', 'GET');
  }

  async getMetrics(): Promise<any> {
    return this.makeRequest('/metrics', 'GET');
  }

  // Authentication
  async authenticate(credentials: { username: string; password: string }): Promise<string> {
    const response = await this.makeRequest('/auth/login', 'POST', credentials);
    return response.token;
  }

  async refreshToken(refreshToken: string): Promise<string> {
    const response = await this.makeRequest('/auth/refresh', 'POST', { refreshToken });
    return response.token;
  }

  // Configuration
  updateConfig(newConfig: Partial<BuildSpacesConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): BuildSpacesConfig {
    return { ...this.config };
  }
}

// React Hook for BuildSpaces Integration
import { useState, useEffect, useCallback } from 'react';

interface UseBuildSpacesOptions {
  projectId?: string;
  autoConnect?: boolean;
  onError?: (error: Error) => void;
}

export const useBuildSpaces = (options: UseBuildSpacesOptions = {}) => {
  const [api] = useState(() => new BuildSpacesAPI({
    apiBaseUrl: process.env.REACT_APP_BUILDSPACES_API || 'http://localhost:8080/api/buildspaces',
    apiKey: process.env.REACT_APP_BUILDSPACES_API_KEY || 'demo-key',
    wsUrl: process.env.REACT_APP_BUILDSPACES_WS || 'ws://localhost:8080',
    timeout: 30000,
    retryAttempts: 3
  }));

  const [isConnected, setIsConnected] = useState(false);
  const [projects, setProjects] = useState<BuildSpacesProject[]>([]);
  const [agents, setAgents] = useState<BuildSpacesAgent[]>([]);
  const [tasks, setTasks] = useState<BuildSpacesTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load initial data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [projectsData, agentsData] = await Promise.all([
        api.getProjects(),
        api.getAgents()
      ]);
      
      setProjects(projectsData);
      setAgents(agentsData);
      
      if (options.projectId) {
        const tasksData = await api.getTasks(options.projectId);
        setTasks(tasksData);
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [api, options.projectId, options.onError]);

  // WebSocket connection
  const connect = useCallback(() => {
    if (options.projectId && options.autoConnect !== false) {
      api.connectWebSocket(options.projectId);
    }
  }, [api, options.projectId, options.autoConnect]);

  const disconnect = useCallback(() => {
    api.disconnectWebSocket();
  }, [api]);

  // Event listeners
  useEffect(() => {
    const handleConnection = () => setIsConnected(true);
    const handleDisconnection = () => setIsConnected(false);
    const handleProjectUpdate = (data: any) => {
      setProjects(prev => prev.map(p => p.id === data.project.id ? data.project : p));
    };
    const handleAgentUpdate = (data: any) => {
      setAgents(prev => prev.map(a => a.id === data.agent.id ? data.agent : a));
    };
    const handleTaskUpdate = (data: any) => {
      setTasks(prev => {
        if (data.task.projectId === options.projectId) {
          return prev.map(t => t.id === data.task.id ? data.task : t);
        }
        return prev;
      });
    };

    api.on('websocket_connected', handleConnection);
    api.on('websocket_disconnected', handleDisconnection);
    api.on('project_update', handleProjectUpdate);
    api.on('agent_status_update', handleAgentUpdate);
    api.on('task_update', handleTaskUpdate);

    return () => {
      api.off('websocket_connected', handleConnection);
      api.off('websocket_disconnected', handleDisconnection);
      api.off('project_update', handleProjectUpdate);
      api.off('agent_status_update', handleAgentUpdate);
      api.off('task_update', handleTaskUpdate);
    };
  }, [api, options.projectId]);

  // Initialize
  useEffect(() => {
    loadData();
    connect();
    
    return () => {
      disconnect();
    };
  }, [loadData, connect, disconnect]);

  return {
    api,
    isConnected,
    projects,
    agents,
    tasks,
    loading,
    error,
    refreshData: loadData,
    connect,
    disconnect
  };
};

export { BuildSpacesAPI };
export type { 
  BuildSpacesProject, 
  BuildSpacesAgent, 
  BuildSpacesTask, 
  BuildSpacesConfig 
};
