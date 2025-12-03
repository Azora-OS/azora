// User Interaction Model for AzStudio Multi-Agent Mode
// Elara chat interface and direct agent communication

import React, { useState, useEffect, useRef } from 'react';
import { ElaraOrchestrator, UserInstruction } from '../services/ElaraOrchestrator';
import { MultiAgentRuntime, AgentSession, AgentMessage } from '../services/MultiAgentRuntime';
import { GenesisStation } from '../services/GenesisStation';

interface ChatMessage {
  id: string;
  type: 'user' | 'elara' | 'agent' | 'system';
  sender: string;
  content: string;
  timestamp: Date;
  metadata?: {
    taskId?: string;
    agentName?: string;
    instructionType?: string;
    confidence?: number;
    actions?: Array<{
      type: string;
      label: string;
      data?: any;
    }>;
  };
}

interface AgentChannel {
  agentName: string;
  status: 'idle' | 'thinking' | 'coding' | 'testing' | 'blocked';
  currentTask?: string;
  lastActivity: Date;
  unreadCount: number;
  isOnline: boolean;
}

interface UserInteractionProps {
  projectId: string;
  elaraOrchestrator: ElaraOrchestrator;
  multiAgentRuntime: MultiAgentRuntime;
  genesisStation: GenesisStation;
  onTaskCreated?: (taskId: string) => void;
  onAgentInstruction?: (agentName: string, instruction: string) => void;
}

const UserInteraction: React.FC<UserInteractionProps> = ({
  projectId,
  elaraOrchestrator,
  multiAgentRuntime,
  genesisStation,
  onTaskCreated,
  onAgentInstruction
}) => {
  const [activeTab, setActiveTab] = useState<'elara' | 'agents'>('elara');
  const [elaraMessages, setElaraMessages] = useState<ChatMessage[]>([]);
  const [agentChannels, setAgentChannels] = useState<Record<string, ChatMessage[]>>({});
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentChannel>>({});
  const [quickActions, setQuickActions] = useState([
    { label: 'Add authentication system', command: 'Elara, add OAuth2 authentication with Google' },
    { label: 'Create API endpoints', command: 'Elara, create REST API endpoints for user management' },
    { label: 'Run security audit', command: 'Jabari, run security audit on current codebase' },
    { label: 'Setup database', command: 'Zola, design and implement PostgreSQL database schema' },
    { label: 'Create tests', command: 'Nexus, create comprehensive test suite for current features' }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Agent colors
  const agentColors: Record<string, string> = {
    'Elara': '#8b5cf6',
    'Zola': '#3b82f6',
    'Jabari': '#ef4444',
    'Kofi': '#10b981',
    'Abeni': '#f59e0b',
    'Nexus': '#06b6d4'
  };

  useEffect(() => {
    initializeChat();
    loadAgentStatuses();
    startRealTimeUpdates();
    
    return () => {
      stopRealTimeUpdates();
    };
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [elaraMessages, agentChannels, selectedAgent]);

  const initializeChat = async () => {
    // Add welcome message from Elara
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'elara',
      sender: 'Elara',
      content: `👋 Welcome to AzStudio Multi-Agent Mode!\n\nI'm Elara, your XO (Executive Officer). I orchestrate the AI agents to help you build your project.\n\nYou can:\n• Give me high-level instructions (e.g., "Add user authentication")\n• Chat directly with individual agents\n• Monitor progress and resolve conflicts\n\nWhat would you like to work on today?`,
      timestamp: new Date(),
      metadata: {
        actions: [
          { type: 'show_quick_actions', label: 'Show Quick Actions' },
          { type: 'view_project_status', label: 'View Project Status' },
          { type: 'meet_agents', label: 'Meet the Team' }
        ]
      }
    };
    
    setElaraMessages([welcomeMessage]);
  };

  const loadAgentStatuses = async () => {
    try {
      const sessions = await multiAgentRuntime.getAllAgentSessions(projectId);
      const statuses: Record<string, AgentChannel> = {};
      
      sessions.forEach(session => {
        statuses[session.agentName] = {
          agentName: session.agentName,
          status: session.status,
          currentTask: session.currentTask?.title,
          lastActivity: session.lastActivity,
          unreadCount: 0,
          isOnline: true
        };
      });
      
      setAgentStatuses(statuses);
      
      // Initialize empty chat for each agent
      const channels: Record<string, ChatMessage[]> = {};
      sessions.forEach(session => {
        channels[session.agentName] = [{
          id: `${session.agentName}-welcome`,
          type: 'system',
          sender: 'System',
          content: `💬 Direct message channel for ${session.agentName}\n\nSend instructions or ask questions directly to this agent.`,
          timestamp: new Date()
        }];
      });
      
      setAgentChannels(channels);
      
    } catch (error) {
      console.error('Failed to load agent statuses:', error);
    }
  };

  const startRealTimeUpdates = () => {
    // Listen for agent messages and status updates
    multiAgentRuntime.on('agent_message', handleAgentMessage);
    multiAgentRuntime.on('agent_status_change', handleAgentStatusChange);
    
    // Listen for Elara updates
    elaraOrchestrator.on('task_assigned', handleTaskAssigned);
    elaraOrchestrator.on('progress_update', handleProgressUpdate);
  };

  const stopRealTimeUpdates = () => {
    // Cleanup listeners
  };

  const handleAgentMessage = (message: AgentMessage) => {
    if (message.to) {
      // Direct message to specific agent
      const chatMessage: ChatMessage = {
        id: `agent-${message.id}`,
        type: 'agent',
        sender: message.from,
        content: message.content,
        timestamp: message.timestamp,
        metadata: {
          agentName: message.from
        }
      };
      
      setAgentChannels(prev => ({
        ...prev,
        [message.to]: [...(prev[message.to] || []), chatMessage]
      }));
      
      // Update unread count
      setAgentStatuses(prev => ({
        ...prev,
        [message.to]: {
          ...prev[message.to],
          unreadCount: (prev[message.to]?.unreadCount || 0) + 1
        }
      }));
      
    } else {
      // Broadcast message
      const chatMessage: ChatMessage = {
        id: `broadcast-${message.id}`,
        type: 'agent',
        sender: message.from,
        content: message.content,
        timestamp: message.timestamp,
        metadata: {
          agentName: message.from
        }
      };
      
      // Add to all agent channels
      setAgentChannels(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(agentName => {
          if (agentName !== message.from) {
            updated[agentName] = [...updated[agentName], chatMessage];
          }
        });
        return updated;
      });
    }
  };

  const handleAgentStatusChange = (data: any) => {
    setAgentStatuses(prev => ({
      ...prev,
      [data.agentName]: {
        agentName: data.agentName,
        status: data.status,
        currentTask: data.currentTask,
        lastActivity: new Date(),
        unreadCount: 0,
        isOnline: true
      }
    }));
  };

  const handleTaskAssigned = (data: any) => {
    const taskMessage: ChatMessage = {
      id: `task-${data.task.id}`,
      type: 'elara',
      sender: 'Elara',
      content: `📋 Task assigned: "${data.task.title}" to ${data.agent}\n\n${data.task.description}`,
      timestamp: new Date(),
      metadata: {
        taskId: data.task.id,
        agentName: data.agent,
        actions: [
          { type: 'view_task', label: 'View Details', data: { taskId: data.task.id } },
          { type: 'reassign_task', label: 'Reassign', data: { taskId: data.task.id } }
        ]
      }
    };
    
    setElaraMessages(prev => [...prev, taskMessage]);
    onTaskCreated?.(data.task.id);
  };

  const handleProgressUpdate = (data: any) => {
    const progressMessage: ChatMessage = {
      id: `progress-${Date.now()}`,
      type: 'elara',
      sender: 'Elara',
      content: `📊 Progress Update: ${data.message}`,
      timestamp: new Date()
    };
    
    setElaraMessages(prev => [...prev, progressMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const message = inputValue.trim();
    setInputValue('');
    setIsTyping(true);
    
    if (activeTab === 'elara') {
      // Send to Elara
      const userMessage: ChatMessage = {
        id: `user-elara-${Date.now()}`,
        type: 'user',
        sender: 'User',
        content: message,
        timestamp: new Date()
      };
      
      setElaraMessages(prev => [...prev, userMessage]);
      
      try {
        // Process instruction through Elara
        const instruction: UserInstruction = {
          type: determineInstructionType(message),
          instruction: message,
          priority: determinePriority(message)
        };
        
        await elaraOrchestrator.receiveUserGuidance(instruction, projectId);
        
        // Simulate Elara response
        setTimeout(() => {
          const elaraResponse: ChatMessage = {
            id: `elara-${Date.now()}`,
            type: 'elara',
            sender: 'Elara',
            content: generateElaraResponse(message, instruction),
            timestamp: new Date(),
            metadata: {
              confidence: 85,
              actions: generateResponseActions(message, instruction)
            }
          };
          
          setElaraMessages(prev => [...prev, elaraResponse]);
          setIsTyping(false);
        }, 1500);
        
      } catch (error) {
        console.error('Failed to send instruction to Elara:', error);
        
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          type: 'elara',
          sender: 'Elara',
          content: '❌ Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date()
        };
        
        setElaraMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
      }
      
    } else if (activeTab === 'agents' && selectedAgent) {
      // Send to specific agent
      const userMessage: ChatMessage = {
        id: `user-${selectedAgent}-${Date.now()}`,
        type: 'user',
        sender: 'User',
        content: message,
        timestamp: new Date()
      };
      
      setAgentChannels(prev => ({
        ...prev,
        [selectedAgent]: [...(prev[selectedAgent] || []), userMessage]
      }));
      
      try {
        // Send direct message to agent
        await multiAgentRuntime.sendDirectMessage('User', selectedAgent, {
          type: 'status_update' as any,
          content: message
        });
        
        onAgentInstruction?.(selectedAgent, message);
        
        // Simulate agent response
        setTimeout(() => {
          const agentResponse: ChatMessage = {
            id: `${selectedAgent}-${Date.now()}`,
            type: 'agent',
            sender: selectedAgent,
            content: generateAgentResponse(selectedAgent, message),
            timestamp: new Date(),
            metadata: {
              agentName: selectedAgent
            }
          };
          
          setAgentChannels(prev => ({
            ...prev,
            [selectedAgent]: [...(prev[selectedAgent] || []), agentResponse]
          }));
          
          setIsTyping(false);
        }, 2000);
        
      } catch (error) {
        console.error(`Failed to send message to ${selectedAgent}:`, error);
        
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          type: 'system',
          sender: 'System',
          content: `❌ Failed to send message to ${selectedAgent}. Please try again.`,
          timestamp: new Date()
        };
        
        setAgentChannels(prev => ({
          ...prev,
          [selectedAgent]: [...(prev[selectedAgent] || []), errorMessage]
        }));
        
        setIsTyping(false);
      }
    }
  };

  const determineInstructionType = (message: string): UserInstruction['type'] => {
    const lower = message.toLowerCase();
    
    if (lower.includes('priority') || lower.includes('urgent')) {
      return 'priority_change';
    } else if (lower.includes('design') || lower.includes('architecture')) {
      return 'design_feedback';
    } else if (lower.includes('zola') || lower.includes('jabari') || lower.includes('kofi') || 
                lower.includes('abeni') || lower.includes('nexus')) {
      return 'agent_behavior';
    } else {
      return 'task_guidance';
    }
  };

  const determinePriority = (message: string): UserInstruction['priority'] => {
    const lower = message.toLowerCase();
    
    if (lower.includes('urgent') || lower.includes('critical') || lower.includes('asap')) {
      return 'urgent';
    } else if (lower.includes('important') || lower.includes('high priority')) {
      return 'high';
    } else if (lower.includes('low priority') || lower.includes('when you have time')) {
      return 'low';
    } else {
      return 'medium';
    }
  };

  const generateElaraResponse = (message: string, instruction: UserInstruction): string => {
    const lower = message.toLowerCase();
    
    if (lower.includes('authentication')) {
      return `🔐 I'll help you implement authentication. I'm breaking this down into tasks:\n\n1. **Zola** will design the authentication architecture\n2. **Abeni** will create the login UI components\n3. **Jabari** will perform security analysis\n4. **Kofi** will set up the infrastructure\n\nI'll assign these tasks and monitor progress. Estimated completion: 2-3 hours.`;
    } else if (lower.includes('api')) {
      return `🔌 I'll create the API endpoints for you. Let me analyze your requirements and assign the right agents.\n\n**Zola** will handle the backend implementation while **Nexus** ensures proper testing and documentation.`;
    } else if (lower.includes('security') || lower.includes('audit')) {
      return `🛡️ Security audit initiated! **Jabari** is now analyzing your codebase for vulnerabilities and compliance issues.\n\nExpected completion: 30-45 minutes. I'll notify you when the report is ready.`;
    } else if (lower.includes('database')) {
      return `🗄️ Database design and implementation started! **Zola** is creating the schema and migration scripts.\n\nI'll ensure it aligns with your project's architecture and performance requirements.`;
    } else if (lower.includes('test')) {
      return `🧪 Test suite creation in progress! **Nexus** is implementing comprehensive tests for your current features.\n\nThis includes unit tests, integration tests, and documentation.`;
    } else {
      return `🤔 I understand you want to: "${message}"\n\nLet me analyze this request and break it down into actionable tasks for the right agents. I'll provide you with a detailed plan and timeline shortly.`;
    }
  };

  const generateAgentResponse = (agentName: string, message: string): string => {
    const responses: Record<string, (msg: string) => string> = {
      'Zola': (msg) => `🧠 I'll work on the backend implementation for: "${msg}". Let me analyze the requirements and create a robust solution.`,
      'Jabari': (msg) => `🛡️ Security analysis for: "${msg}". I'll review for vulnerabilities and ensure compliance with security best practices.`,
      'Kofi': (msg) => `⚙️ Infrastructure setup for: "${msg}". I'll configure the necessary systems and monitoring.`,
      'Abeni': (msg) => `🎨 UI/UX design for: "${msg}". I'll create an intuitive and accessible interface.`,
      'Nexus': (msg) => `🔗 Integration and testing for: "${msg}". I'll ensure everything works together seamlessly.`
    };
    
    return responses[agentName]?.(message) || `🤖 I'll work on: "${message}". Let me get started right away.`;
  };

  const generateResponseActions = (message: string, instruction: UserInstruction) => {
    const actions = [];
    
    if (message.toLowerCase().includes('authentication')) {
      actions.push(
        { type: 'view_tasks', label: 'View Authentication Tasks' },
        { type: 'monitor_progress', label: 'Monitor Progress' }
      );
    }
    
    if (instruction.type === 'agent_behavior') {
      actions.push(
        { type: 'configure_agent', label: 'Configure Agent Behavior' }
      );
    }
    
    return actions;
  };

  const handleQuickAction = (command: string) => {
    setInputValue(command);
    inputRef.current?.focus();
  };

  const handleActionClick = (action: any) => {
    // Handle different action types
    switch (action.type) {
      case 'view_task':
        // Navigate to task view
        console.log('View task:', action.data.taskId);
        break;
      case 'reassign_task':
        // Open task reassignment dialog
        console.log('Reassign task:', action.data.taskId);
        break;
      case 'configure_agent':
        // Open agent configuration
        console.log('Configure agent behavior');
        break;
      case 'monitor_progress':
        // Switch to progress monitoring view
        console.log('Monitor progress');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const currentMessages = activeTab === 'elara' ? elaraMessages : (selectedAgent ? agentChannels[selectedAgent] || [] : []);

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#1e1e1e'
    }}>
      
      {/* Header */}
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #3e3e3e',
        background: '#252526'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#007acc', fontSize: '14px' }}>
            💬 Multi-Agent Communication
          </h3>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('elara')}
              style={{
                padding: '6px 12px',
                background: activeTab === 'elara' ? '#007acc' : '#2d2d2d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              🎯 Elara
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              style={{
                padding: '6px 12px',
                background: activeTab === 'agents' ? '#007acc' : '#2d2d2d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              👥 Agents
            </button>
          </div>
        </div>
      </div>

      {/* Agent Selection (when agents tab is active) */}
      {activeTab === 'agents' && (
        <div style={{ 
          padding: '12px 16px', 
          borderBottom: '1px solid #3e3e3e',
          background: '#2d2d2d'
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.entries(agentStatuses).map(([agentName, status]) => (
              <button
                key={agentName}
                onClick={() => setSelectedAgent(agentName)}
                style={{
                  padding: '6px 12px',
                  background: selectedAgent === agentName ? `${agentColors[agentName]}20` : '#3e3e3e',
                  border: `1px solid ${selectedAgent === agentName ? agentColors[agentName] : '#555555'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: '#cccccc',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: status.isOnline ? '#10b981' : '#6b7280'
                  }}
                />
                <span>{agentName}</span>
                <span style={{ fontSize: '9px', color: '#8c8c8c' }}>
                  ({status.status})
                </span>
                {status.unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    fontSize: '9px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {status.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {!selectedAgent && (
            <div style={{ 
              marginTop: '8px', 
              fontSize: '11px', 
              color: '#8c8c8c',
              textAlign: 'center'
            }}>
              Select an agent to start direct communication
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      {activeTab === 'elara' && elaraMessages.length <= 1 && (
        <div style={{ 
          padding: '12px 16px', 
          borderBottom: '1px solid #3e3e3e',
          background: '#2d2d2d'
        }}>
          <div style={{ 
            fontSize: '11px', 
            color: '#8c8c8c', 
            marginBottom: '8px',
            fontWeight: 'bold'
          }}>
            ⚡ Quick Actions:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.command)}
                style={{
                  padding: '4px 8px',
                  background: '#3e3e3e',
                  border: '1px solid #555555',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  color: '#cccccc'
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto', 
        padding: '16px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {currentMessages.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#8c8c8c', 
            padding: '60px 0',
            fontSize: '12px'
          }}>
            {activeTab === 'elara' ? 'Start a conversation with Elara' : 'Select an agent to chat'}
          </div>
        ) : (
          <>
            {currentMessages.map((message) => (
              <div
                key={message.id}
                style={{
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
                }}
              >
                <div style={{
                  maxWidth: '70%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.type === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: message.type === 'user' ? '#007acc' : 
                                message.type === 'elara' ? '#8b5cf6' :
                                message.type === 'agent' ? agentColors[message.sender] || '#666666' :
                                '#3e3e3e',
                    color: 'white',
                    fontSize: '12px',
                    lineHeight: '1.4',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {message.content}
                  </div>
                  
                  {message.metadata?.actions && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {message.metadata.actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleActionClick(action)}
                          style={{
                            padding: '4px 8px',
                            background: '#2d2d2d',
                            border: '1px solid #555555',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '10px',
                            color: '#cccccc'
                          }}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <div style={{ 
                    fontSize: '9px', 
                    color: '#8c8c8c', 
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>{message.sender}</span>
                    <span>•</span>
                    <span>{formatTimestamp(message.timestamp)}</span>
                    {message.metadata?.confidence && (
                      <>
                        <span>•</span>
                        <span style={{ color: '#10b981' }}>
                          {message.metadata.confidence}% confidence
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8c8c8c' }}>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span style={{ fontSize: '11px' }}>
                  {activeTab === 'elara' ? 'Elara is thinking...' : `${selectedAgent} is responding...`}
                </span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div style={{ 
        padding: '16px', 
        borderTop: '1px solid #3e3e3e',
        background: '#252526'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={
              activeTab === 'elara' 
                ? 'Tell Elara what you want to build...' 
                : selectedAgent 
                  ? `Send instruction to ${selectedAgent}...`
                  : 'Select an agent to chat...'
            }
            disabled={isTyping || (activeTab === 'agents' && !selectedAgent)}
            style={{
              flex: 1,
              minHeight: '40px',
              maxHeight: '120px',
              padding: '10px',
              background: '#2d2d2d',
              border: '1px solid #3e3e3e',
              borderRadius: '6px',
              color: '#cccccc',
              fontSize: '12px',
              resize: 'none',
              fontFamily: 'inherit'
            }}
          />
          
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isTyping || (activeTab === 'agents' && !selectedAgent)}
            style={{
              padding: '10px 16px',
              background: (!inputValue.trim() || isTyping || (activeTab === 'agents' && !selectedAgent)) ? '#666666' : '#007acc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (!inputValue.trim() || isTyping || (activeTab === 'agents' && !selectedAgent)) ? 'not-allowed' : 'pointer',
              fontSize: '12px'
            }}
          >
            Send
          </button>
        </div>
      </div>
      
      <style>{`
        .typing-indicator {
          display: flex;
          gap: 2px;
        }
        
        .typing-indicator span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #8c8c8c;
          animation: typing 1.4s infinite ease-in-out;
        }
        
        .typing-indicator span:nth-child(1) {
          animation-delay: -0.32s;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: -0.16s;
        }
        
        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default UserInteraction;
