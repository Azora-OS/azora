/**
 * CollaborationPanel
 * 
 * UI component for real-time collaboration features:
 * - Display active users list
 * - Show user avatars and colors
 * - Display remote cursors and selections
 * - Highlight remote changes
 */

import React, { useState, useEffect } from 'react';
import './CollaborationPanel.css';

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  color: string;
  avatar?: string;
  activeFile?: string;
  cursor?: { line: number; column: number };
  lastSeen: Date;
}

interface CollaborationPanelProps {
  workspaceId: string;
  currentUserId: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  workspaceId,
  currentUserId,
  onConnect,
  onDisconnect
}) => {
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Connect to collaboration server
    const websocket = new WebSocket('ws://localhost:8765');

    websocket.onopen = () => {
      console.log('Connected to collaboration server');
      setIsConnected(true);
      
      // Send join message
      websocket.send(JSON.stringify({
        type: 'join',
        userId: currentUserId,
        workspaceId,
        timestamp: new Date(),
        data: {
          user: {
            id: currentUserId,
            name: 'Current User',
            email: 'user@example.com',
            color: generateUserColor(currentUserId)
          }
        }
      }));

      onConnect?.();
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'workspace-state':
          setUsers(message.data.users.filter((u: CollaborationUser) => u.id !== currentUserId));
          break;

        case 'join':
          if (message.userId !== currentUserId) {
            setUsers(prev => [...prev, message.data.presence]);
          }
          break;

        case 'leave':
          setUsers(prev => prev.filter(u => u.id !== message.userId));
          break;

        case 'cursor':
        case 'selection':
        case 'presence':
          setUsers(prev => prev.map(u => 
            u.id === message.userId 
              ? { ...u, ...message.data }
              : u
          ));
          break;
      }
    };

    websocket.onclose = () => {
      console.log('Disconnected from collaboration server');
      setIsConnected(false);
      onDisconnect?.();
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(websocket);

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: 'leave',
          userId: currentUserId,
          workspaceId,
          timestamp: new Date()
        }));
      }
      websocket.close();
    };
  }, [workspaceId, currentUserId, onConnect, onDisconnect]);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatLastSeen = (lastSeen: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(lastSeen).getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className="collaboration-panel">
      <div className="collaboration-header">
        <h3>Collaboration</h3>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="active-users">
        <div className="users-header">
          <span>Active Users ({users.length})</span>
        </div>

        <div className="users-list">
          {users.length === 0 ? (
            <div className="no-users">
              <p>No other users in this workspace</p>
            </div>
          ) : (
            users.map(user => (
              <div key={user.id} className="user-item">
                <div 
                  className="user-avatar" 
                  style={{ backgroundColor: user.color }}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span>{getInitials(user.name)}</span>
                  )}
                </div>
                
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-status">
                    {user.activeFile ? (
                      <span className="editing">
                        Editing {user.activeFile.split('/').pop()}
                      </span>
                    ) : (
                      <span className="idle">Idle</span>
                    )}
                  </div>
                  <div className="user-last-seen">
                    {formatLastSeen(user.lastSeen)}
                  </div>
                </div>

                <div 
                  className="user-indicator" 
                  style={{ backgroundColor: user.color }}
                ></div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Generate a consistent color for a user based on their ID
 */
function generateUserColor(userId: string): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B739', '#52B788', '#E76F51', '#2A9D8F'
  ];
  
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

export default CollaborationPanel;
