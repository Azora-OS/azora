// Real-Time Collaboration Features for AzStudio Multi-Agent Mode
// Agent cursors, activity feed, task progress board, and live collaboration

import React, { useState, useEffect, useRef } from 'react';
import { MultiAgentRuntime, AgentSession, AgentMessage } from '../services/MultiAgentRuntime';
import { ElaraOrchestrator, ProgressReport } from '../services/ElaraOrchestrator';
import { GenesisStation, ProjectContext } from '../services/GenesisStation';

interface AgentCursor {
  agentName: string;
  color: string;
  file: string;
  line: number;
  column: number;
  label: string;
  isActive: boolean;
  lastUpdate: Date;
}

interface AgentActivity {
  id: string;
  timestamp: Date;
  agent: string;
  action: 'file_created' | 'file_modified' | 'file_deleted' | 'test_run' | 'commit' | 'comment' | 'task_complete' | 'error';
  details: string;
  file?: string;
  line?: number;
  severity: 'info' | 'warning' | 'error' | 'success';
  metadata?: Record<string, any>;
}

interface TaskBoard {
  columns: {
    todo: Array<{
      id: string;
      title: string;
      assignedTo: string;
      priority: 'critical' | 'high' | 'medium' | 'low';
      estimatedDuration: number;
      createdAt: Date;
    }>;
    inProgress: Array<{
      id: string;
      title: string;
      assignedTo: string;
      priority: 'critical' | 'high' | 'medium' | 'low';
      progress: number;
      startedAt: Date;
    }>;
    review: Array<{
      id: string;
      title: string;
      assignedTo: string;
      priority: 'critical' | 'high' | 'medium' | 'low';
      completedAt: Date;
    }>;
    done: Array<{
      id: string;
      title: string;
      assignedTo: string;
      priority: 'critical' | 'high' | 'medium' | 'low';
      completedAt: Date;
    }>;
  };
}

interface RealTimeCollaborationProps {
  projectId: string;
  multiAgentRuntime: MultiAgentRuntime;
  elaraOrchestrator: ElaraOrchestrator;
  genesisStation: GenesisStation;
  onAgentClick?: (agentName: string) => void;
  onTaskClick?: (taskId: string) => void;
  onFileClick?: (filePath: string) => void;
}

const RealTimeCollaboration: React.FC<RealTimeCollaborationProps> = ({
  projectId,
  multiAgentRuntime,
  elaraOrchestrator,
  genesisStation,
  onAgentClick,
  onTaskClick,
  onFileClick
}) => {
  const [agentCursors, setAgentCursors] = useState<Map<string, AgentCursor>>(new Map());
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([]);
  const [taskBoard, setTaskBoard] = useState<TaskBoard>({ columns: { todo: [], inProgress: [], review: [], done: [] } });
  const [activeAgents, setActiveAgents] = useState<AgentSession[]>([]);
  const [progressReport, setProgressReport] = useState<ProgressReport | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState<'all' | 'errors' | 'files' | 'tasks'>('all');
  
  const wsConnection = useRef<WebSocket | null>(null);
  const activityContainerRef = useRef<HTMLDivElement>(null);

  // Agent color mapping
  const agentColors: Record<string, string> = {
    'Zola': '#3b82f6',      // Blue
    'Jabari': '#ef4444',    // Red
    'Kofi': '#10b981',      // Green
    'Abeni': '#f59e0b',     // Yellow
    'Nexus': '#8b5cf6'      // Purple
  };

  // Initialize WebSocket connection and data fetching
  useEffect(() => {
    initializeCollaboration();
    
    return () => {
      if (wsConnection.current) {
        wsConnection.current.close();
      }
    };
  }, [projectId]);

  // Auto-scroll activity feed to bottom
  useEffect(() => {
    if (activityContainerRef.current) {
      activityContainerRef.current.scrollTop = activityContainerRef.current.scrollHeight;
    }
  }, [agentActivities]);

  const initializeCollaboration = async () => {
    try {
      // Set up WebSocket connection for real-time updates
      setupWebSocket();
      
      // Load initial data
      await loadInitialData();
      
      // Start periodic updates
      startPeriodicUpdates();
      
    } catch (error) {
      console.error('Failed to initialize real-time collaboration:', error);
    }
  };

  const setupWebSocket = () => {
    const wsUrl = `ws://localhost:3000/agent-stream/${projectId}`;
    wsConnection.current = new WebSocket(wsUrl);
    
    wsConnection.current.onopen = () => {
      console.log('🔌 Connected to agent stream WebSocket');
    };
    
    wsConnection.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    wsConnection.current.onclose = () => {
      console.log('🔌 Disconnected from agent stream WebSocket');
      // Attempt to reconnect after 3 seconds
      setTimeout(setupWebSocket, 3000);
    };
    
    wsConnection.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'agent_cursor_update':
        handleCursorUpdate(data.data);
        break;
      case 'agent_activity':
        handleActivityUpdate(data.data);
        break;
      case 'task_update':
        handleTaskUpdate(data.data);
        break;
      case 'agent_status_change':
        handleAgentStatusChange(data.data);
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  };

  const handleCursorUpdate = (cursorData: any) => {
    const cursor: AgentCursor = {
      agentName: cursorData.agentName,
      color: agentColors[cursorData.agentName] || '#666666',
      file: cursorData.file,
      line: cursorData.line,
      column: cursorData.column,
      label: cursorData.label || `${cursorData.agentName} is working...`,
      isActive: true,
      lastUpdate: new Date()
    };
    
    setAgentCursors(prev => new Map(prev.set(cursorData.agentName, cursor)));
  };

  const handleActivityUpdate = (activityData: any) => {
    const activity: AgentActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(activityData.timestamp),
      agent: activityData.agent,
      action: activityData.action,
      details: activityData.details,
      file: activityData.file,
      line: activityData.line,
      severity: activityData.severity || 'info',
      metadata: activityData.metadata
    };
    
    setAgentActivities(prev => [activity, ...prev.slice(0, 99)]); // Keep last 100 activities
  };

  const handleTaskUpdate = (taskData: any) => {
    // Update task board based on task status changes
    setTaskBoard(prev => {
      const updated = { ...prev };
      
      // Remove task from all columns first
      (['todo', 'inProgress', 'review', 'done'] as const).forEach(column => {
        updated.columns[column] = updated.columns[column].filter(task => task.id !== taskData.id) as any;
      });
      
      // Add task to appropriate column based on status
      if (taskData.status === 'pending') {
        updated.columns.todo.push({
          ...taskData,
          priority: taskData.priority || 'medium',
          estimatedDuration: taskData.estimatedDuration || 60,
          createdAt: taskData.createdAt || new Date()
        });
      } else if (taskData.status === 'in_progress') {
        updated.columns.inProgress.push({
          ...taskData,
          priority: taskData.priority || 'medium',
          progress: taskData.progress || 0,
          startedAt: taskData.startedAt || new Date()
        });
      } else if (taskData.status === 'review') {
        updated.columns.review.push({
          ...taskData,
          priority: taskData.priority || 'medium',
          completedAt: taskData.completedAt || new Date()
        });
      } else if (taskData.status === 'completed') {
        updated.columns.done.push({
          ...taskData,
          priority: taskData.priority || 'medium',
          completedAt: taskData.completedAt || new Date()
        });
      }
      
      return updated;
    });
  };

  const handleAgentStatusChange = (agentData: any) => {
    setActiveAgents(prev => 
      prev.map(agent => 
        agent.agentName === agentData.agentName
          ? { ...agent, status: agentData.status, currentTask: agentData.currentTask }
          : agent
      )
    );
  };

  const getTaskColumn = (status: string): keyof TaskBoard['columns'] | null => {
    switch (status) {
      case 'pending': return 'todo';
      case 'in_progress': return 'inProgress';
      case 'review': return 'review';
      case 'completed': return 'done';
      default: return null;
    }
  };

  const loadInitialData = async () => {
    try {
      // Load active agents
      const agents = await multiAgentRuntime.getAllAgentSessions(projectId);
      setActiveAgents(agents);
      
      // Load progress report
      const report = await elaraOrchestrator.monitorProgress(projectId);
      setProgressReport(report);
      
      // Load current tasks
      const projectContext = await genesisStation.getProjectContext(projectId);
      if (projectContext) {
        const tasks = projectContext.activeContext.activeTasks;
        const initialTaskBoard: TaskBoard = { columns: { todo: [], inProgress: [], review: [], done: [] } };
        
        tasks.forEach(task => {
          const column = getTaskColumn(task.status);
          if (column) {
            initialTaskBoard.columns[column].push({
              id: task.id,
              title: task.title,
              assignedTo: task.assignedTo,
              priority: 'medium', // Default, would come from actual task data
              progress: task.progress || 0,
              estimatedDuration: 60, // Default, would come from actual task data
              createdAt: new Date(),
              startedAt: task.status === 'in_progress' ? new Date() : undefined,
              completedAt: task.status === 'completed' ? new Date() : undefined
            } as any);
          }
        });
        
        setTaskBoard(initialTaskBoard);
      }
      
    } catch (error) {
      console.error('Failed to load initial collaboration data:', error);
    }
  };

  const startPeriodicUpdates = () => {
    // Update progress report every 30 seconds
    const progressInterval = setInterval(async () => {
      try {
        const report = await elaraOrchestrator.monitorProgress(projectId);
        setProgressReport(report);
      } catch (error) {
        console.error('Failed to update progress report:', error);
      }
    }, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(progressInterval);
  };

  const formatActivityTimestamp = (timestamp: Date): string => {
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

  const getActivityIcon = (action: AgentActivity['action']): string => {
    const icons = {
      'file_created': '📄',
      'file_modified': '✏️',
      'file_deleted': '🗑️',
      'test_run': '🧪',
      'commit': '📦',
      'comment': '💬',
      'task_complete': '✅',
      'error': '❌'
    };
    return icons[action] || '📝';
  };

  const getPriorityColor = (priority: string): string => {
    const colors = {
      'critical': '#dc2626',
      'high': '#ea580c',
      'medium': '#d97706',
      'low': '#65a30d'
    };
    return colors[priority as keyof typeof colors] || '#6b7280';
  };

  const filteredActivities = agentActivities.filter(activity => {
    switch (activityFilter) {
      case 'errors': return activity.severity === 'error';
      case 'files': return ['file_created', 'file_modified', 'file_deleted'].includes(activity.action);
      case 'tasks': return ['task_complete', 'comment'].includes(activity.action);
      default: return true;
    }
  });

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '300px 1fr 350px', 
      gap: '16px', 
      height: '100%',
      padding: '16px',
      background: '#1e1e1e'
    }}>
      
      {/* Agent Status Panel */}
      <div style={{ 
        background: '#252526', 
        borderRadius: '8px', 
        padding: '16px',
        overflow: 'auto'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#007acc', fontSize: '14px' }}>
          👥 Active Agents
        </h3>
        
        {activeAgents.map(agent => (
          <div
            key={agent.id}
            className={`agent-card ${selectedAgent === agent.agentName ? 'selected' : ''}`}
            onClick={() => {
              setSelectedAgent(agent.agentName);
              onAgentClick?.(agent.agentName);
            }}
            style={{
              padding: '12px',
              marginBottom: '8px',
              background: selectedAgent === agent.agentName ? '#007acc20' : '#2d2d2d',
              border: `1px solid ${selectedAgent === agent.agentName ? '#007acc' : '#3e3e3e'}`,
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: agentColors[agent.agentName] || '#666666',
                  marginRight: '8px'
                }}
              />
              <span style={{ color: '#cccccc', fontWeight: 'bold' }}>
                {agent.agentName}
              </span>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: agent.status === 'idle' ? '#10b981' : 
                             agent.status === 'coding' ? '#3b82f6' : '#f59e0b',
                  marginLeft: 'auto'
                }}
              />
            </div>
            
            <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: '4px' }}>
              Status: <span style={{ color: '#cccccc' }}>{agent.status}</span>
            </div>
            
            {agent.currentTask && (
              <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                Task: <span style={{ color: '#cccccc' }}>{agent.currentTask.title}</span>
              </div>
            )}
            
            {agentCursors.has(agent.agentName) && (
              <div style={{ fontSize: '10px', color: '#007acc', marginTop: '4px' }}>
                📍 {agentCursors.get(agent.agentName)?.file}:{agentCursors.get(agent.agentName)?.line}
              </div>
            )}
          </div>
        ))}
        
        {progressReport && (
          <div style={{ marginTop: '16px', padding: '12px', background: '#2d2d2d', borderRadius: '6px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#cccccc', fontSize: '12px' }}>
              📊 Overall Progress
            </h4>
            <div style={{ 
              height: '8px', 
              background: '#3e3e3e', 
              borderRadius: '4px', 
              overflow: 'hidden',
              marginBottom: '8px'
            }}>
              <div
                style={{
                  height: '100%',
                  background: '#007acc',
                  width: `${progressReport.overallProgress}%`,
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <div style={{ fontSize: '11px', color: '#8c8c8c', textAlign: 'center' }}>
              {progressReport.overallProgress.toFixed(1)}% Complete
            </div>
          </div>
        )}
      </div>

      {/* Task Progress Board */}
      <div style={{ 
        background: '#252526', 
        borderRadius: '8px', 
        padding: '16px',
        overflow: 'auto'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#007acc', fontSize: '14px' }}>
          📋 Task Progress Board
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '12px',
          height: 'calc(100% - 40px)'
        }}>
          {Object.entries(taskBoard.columns).map(([column, tasks]) => (
            <div key={column} style={{
              background: '#2d2d2d',
              borderRadius: '6px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h4 style={{ 
                margin: '0 0 12px 0', 
                color: '#cccccc', 
                fontSize: '12px',
                textTransform: 'uppercase',
                borderBottom: '1px solid #3e3e3e',
                paddingBottom: '8px'
              }}>
                {column.replace(/([A-Z])/g, ' $1').trim()}
                <span style={{ 
                  float: 'right', 
                  background: '#3e3e3e', 
                  padding: '2px 6px', 
                  borderRadius: '3px',
                  fontSize: '10px'
                }}>
                  {tasks.length}
                </span>
              </h4>
              
              <div style={{ flex: 1, overflow: 'auto' }}>
                {tasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick?.(task.id)}
                    style={{
                      padding: '8px',
                      marginBottom: '8px',
                      background: '#1e1e1e',
                      border: `1px solid ${getPriorityColor(task.priority)}`,
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#cccccc', 
                      marginBottom: '4px',
                      fontWeight: 'bold'
                    }}>
                      {task.title}
                    </div>
                    
                    <div style={{ 
                      fontSize: '10px', 
                      color: '#8c8c8c', 
                      marginBottom: '4px'
                    }}>
                      👤 {task.assignedTo}
                    </div>
                    
                    {task.progress !== undefined && (
                      <div style={{ marginBottom: '4px' }}>
                        <div style={{ 
                          height: '4px', 
                          background: '#3e3e3e', 
                          borderRadius: '2px', 
                          overflow: 'hidden'
                        }}>
                          <div
                            style={{
                              height: '100%',
                              background: '#007acc',
                              width: `${task.progress}%`
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div style={{ fontSize: '9px', color: '#8c8c8c' }}>
                      {task.estimatedDuration}min
                    </div>
                  </div>
                ))}
                
                {tasks.length === 0 && (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#8c8c8c', 
                    fontSize: '10px',
                    padding: '20px 0'
                  }}>
                    No tasks
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div style={{ 
        background: '#252526', 
        borderRadius: '8px', 
        padding: '16px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: '#007acc', fontSize: '14px' }}>
            📡 Live Activity Feed
          </h3>
          
          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value as any)}
            style={{
              background: '#2d2d2d',
              color: '#cccccc',
              border: '1px solid #3e3e3e',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '11px'
            }}
          >
            <option value="all">All</option>
            <option value="errors">Errors</option>
            <option value="files">Files</option>
            <option value="tasks">Tasks</option>
          </select>
        </div>
        
        <div 
          ref={activityContainerRef}
          style={{ 
            flex: 1, 
            overflow: 'auto',
            background: '#1e1e1e',
            borderRadius: '4px',
            padding: '8px'
          }}
        >
          {filteredActivities.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#8c8c8c', 
              fontSize: '11px',
              padding: '40px 0'
            }}>
              No recent activity
            </div>
          ) : (
            filteredActivities.map(activity => (
              <div
                key={activity.id}
                style={{
                  padding: '8px',
                  marginBottom: '6px',
                  background: activity.severity === 'error' ? '#dc262620' : '#2d2d2d',
                  border: `1px solid ${activity.severity === 'error' ? '#dc2626' : '#3e3e3e'}`,
                  borderRadius: '4px',
                  fontSize: '11px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <span style={{ marginRight: '6px' }}>{getActivityIcon(activity.action)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      color: agentColors[activity.agent] || '#cccccc',
                      fontWeight: 'bold',
                      marginBottom: '2px'
                    }}>
                      {activity.agent}
                    </div>
                    <div style={{ color: '#cccccc', marginBottom: '2px' }}>
                      {activity.details}
                    </div>
                    {activity.file && (
                      <div 
                        style={{ 
                          color: '#007acc', 
                          cursor: 'pointer',
                          fontSize: '10px'
                        }}
                        onClick={() => onFileClick?.(activity.file!)}
                      >
                        📁 {activity.file}
                        {activity.line && `:${activity.line}`}
                      </div>
                    )}
                  </div>
                  <div style={{ 
                    color: '#8c8c8c', 
                    fontSize: '9px',
                    whiteSpace: 'nowrap',
                    marginLeft: '8px'
                  }}>
                    {formatActivityTimestamp(activity.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RealTimeCollaboration;
