/**
 * CollaborationServer
 * 
 * WebSocket server for real-time collaboration features including:
 * - User presence tracking
 * - Cursor and selection broadcasting
 * - Multi-workspace support
 * - Connection management
 */

import { EventEmitter } from 'events';
import * as http from 'http';
import * as WebSocket from 'ws';
import { OperationalTransform, TextOperation } from './OperationalTransform';

export interface User {
  id: string;
  name: string;
  email: string;
  color: string;
  avatar?: string;
}

export interface UserPresence {
  userId: string;
  workspaceId: string;
  activeFile?: string;
  cursor?: CursorPosition;
  selection?: SelectionRange;
  lastSeen: Date;
}

export interface CursorPosition {
  line: number;
  column: number;
}

export interface SelectionRange {
  start: CursorPosition;
  end: CursorPosition;
}

export interface CollaborationMessage {
  type: 'join' | 'leave' | 'cursor' | 'selection' | 'edit' | 'presence' | 'ping' | 'pong' | 'comment' | 'comment-reply' | 'comment-edit' | 'comment-delete' | 'comment-resolve' | 'comment-react';
  userId: string;
  workspaceId: string;
  timestamp: Date;
  data?: any;
}

export interface WorkspaceSession {
  workspaceId: string;
  users: Map<string, UserPresence>;
  connections: Map<string, WebSocket>;
}

export interface CollaborationServerOptions {
  port?: number;
  host?: string;
  pingInterval?: number;
  maxConnections?: number;
}

export class CollaborationServer extends EventEmitter {
  private server: http.Server;
  private wss: WebSocket.Server;
  private workspaces: Map<string, WorkspaceSession>;
  private userConnections: Map<string, WebSocket>;
  private options: Required<CollaborationServerOptions>;
  private pingIntervalId?: NodeJS.Timeout;
  private ot: OperationalTransform;

  constructor(options: CollaborationServerOptions = {}) {
    super();
    
    this.options = {
      port: options.port || 8765,
      host: options.host || 'localhost',
      pingInterval: options.pingInterval || 30000,
      maxConnections: options.maxConnections || 100
    };

    this.workspaces = new Map();
    this.userConnections = new Map();
    this.ot = new OperationalTransform();
    
    // Create HTTP server
    this.server = http.createServer();
    
    // Create WebSocket server
    this.wss = new WebSocket.Server({ server: this.server });
    
    this.setupWebSocketHandlers();
  }

  /**
   * Start the collaboration server
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server.listen(this.options.port, this.options.host, () => {
          console.log(`Collaboration server listening on ${this.options.host}:${this.options.port}`);
          this.startPingInterval();
          this.emit('started', { host: this.options.host, port: this.options.port });
          resolve();
        });

        this.server.on('error', (error) => {
          console.error('Server error:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop the collaboration server
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.pingIntervalId) {
        clearInterval(this.pingIntervalId);
      }

      // Close all WebSocket connections
      this.wss.clients.forEach((ws) => {
        ws.close(1000, 'Server shutting down');
      });

      // Close WebSocket server
      this.wss.close(() => {
        // Close HTTP server
        this.server.close(() => {
          console.log('Collaboration server stopped');
          this.emit('stopped');
          resolve();
        });
      });
    });
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupWebSocketHandlers(): void {
    this.wss.on('connection', (ws: WebSocket, _request: http.IncomingMessage) => {
      console.log('New WebSocket connection');

      // Check max connections
      if (this.wss.clients.size > this.options.maxConnections) {
        ws.close(1008, 'Maximum connections reached');
        return;
      }

      let userId: string | null = null;
      let workspaceId: string | null = null;

      ws.on('message', (data: WebSocket.Data) => {
        try {
          const message: CollaborationMessage = JSON.parse(data.toString());
          
          // Handle different message types
          switch (message.type) {
            case 'join':
              ({ userId, workspaceId } = this.handleJoin(ws, message));
              break;
            
            case 'leave':
              this.handleLeave(message);
              break;
            
            case 'cursor':
              this.handleCursor(message);
              break;
            
            case 'selection':
              this.handleSelection(message);
              break;
            
            case 'edit':
              this.handleEdit(message);
              break;
            
            case 'presence':
              this.handlePresence(message);
              break;
            
            case 'ping':
              this.handlePing(ws, message);
              break;
            
            case 'comment':
              this.handleComment(message);
              break;
            
            case 'comment-reply':
              this.handleCommentReply(message);
              break;
            
            case 'comment-edit':
              this.handleCommentEdit(message);
              break;
            
            case 'comment-delete':
              this.handleCommentDelete(message);
              break;
            
            case 'comment-resolve':
              this.handleCommentResolve(message);
              break;
            
            case 'comment-react':
              this.handleCommentReact(message);
              break;
            
            default:
              console.warn('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error processing message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            error: 'Invalid message format'
          }));
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        if (userId && workspaceId) {
          this.removeUserFromWorkspace(userId, workspaceId);
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  /**
   * Handle user joining a workspace
   */
  private handleJoin(ws: WebSocket, message: CollaborationMessage): { userId: string; workspaceId: string } {
    const { userId, workspaceId, data } = message;
    
    // Get or create workspace session
    let workspace = this.workspaces.get(workspaceId);
    if (!workspace) {
      workspace = {
        workspaceId,
        users: new Map(),
        connections: new Map()
      };
      this.workspaces.set(workspaceId, workspace);
    }

    // Add user to workspace
    const presence: UserPresence = {
      userId,
      workspaceId,
      activeFile: data?.activeFile,
      lastSeen: new Date()
    };
    
    workspace.users.set(userId, presence);
    workspace.connections.set(userId, ws);
    this.userConnections.set(userId, ws);

    // Notify other users in workspace
    this.broadcastToWorkspace(workspaceId, {
      type: 'join',
      userId,
      workspaceId,
      timestamp: new Date(),
      data: {
        user: data?.user,
        presence
      }
    }, userId);

    // Send current workspace state to joining user
    const workspaceState = {
      users: Array.from(workspace.users.values())
    };
    
    ws.send(JSON.stringify({
      type: 'workspace-state',
      workspaceId,
      timestamp: new Date(),
      data: workspaceState
    }));

    this.emit('user-joined', { userId, workspaceId, presence });
    
    return { userId, workspaceId };
  }

  /**
   * Handle user leaving a workspace
   */
  private handleLeave(message: CollaborationMessage): void {
    const { userId, workspaceId } = message;
    this.removeUserFromWorkspace(userId, workspaceId);
  }

  /**
   * Handle cursor position update
   */
  private handleCursor(message: CollaborationMessage): void {
    const { userId, workspaceId, data } = message;
    
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return;

    const presence = workspace.users.get(userId);
    if (presence) {
      presence.cursor = data.cursor;
      presence.activeFile = data.activeFile;
      presence.lastSeen = new Date();
    }

    // Broadcast cursor position to other users
    this.broadcastToWorkspace(workspaceId, message, userId);
    
    this.emit('cursor-update', { userId, workspaceId, cursor: data.cursor });
  }

  /**
   * Handle selection range update
   */
  private handleSelection(message: CollaborationMessage): void {
    const { userId, workspaceId, data } = message;
    
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return;

    const presence = workspace.users.get(userId);
    if (presence) {
      presence.selection = data.selection;
      presence.activeFile = data.activeFile;
      presence.lastSeen = new Date();
    }

    // Broadcast selection to other users
    this.broadcastToWorkspace(workspaceId, message, userId);
    
    this.emit('selection-update', { userId, workspaceId, selection: data.selection });
  }

  /**
   * Handle edit operation with OT
   */
  private handleEdit(message: CollaborationMessage): void {
    const { userId, workspaceId, data } = message;
    
    const docId = `${workspaceId}:${data.fileId}`;
    
    // Initialize document if not exists
    if (this.ot.getVersion(docId) === -1) {
      this.ot.initDocument(docId, data.initialContent || '');
    }

    // Apply operation with OT
    const operation: TextOperation = data.operation;
    const result = this.ot.applyOperation(docId, operation);

    if (result.success && result.transformedOp) {
      // Broadcast transformed operation to other users
      this.broadcastToWorkspace(workspaceId, {
        type: 'edit',
        userId,
        workspaceId,
        timestamp: new Date(),
        data: {
          fileId: data.fileId,
          operation: result.transformedOp,
          version: result.newVersion
        }
      }, userId);

      this.emit('edit', { 
        userId, 
        workspaceId, 
        fileId: data.fileId,
        operation: result.transformedOp,
        version: result.newVersion
      });
    } else {
      // Send error back to user
      this.sendToUser(userId, {
        type: 'edit-error',
        error: 'Failed to apply operation',
        data: { fileId: data.fileId }
      });
    }
  }

  /**
   * Handle presence update
   */
  private handlePresence(message: CollaborationMessage): void {
    const { userId, workspaceId, data } = message;
    
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return;

    const presence = workspace.users.get(userId);
    if (presence) {
      presence.activeFile = data.activeFile;
      presence.lastSeen = new Date();
    }

    // Broadcast presence update
    this.broadcastToWorkspace(workspaceId, message, userId);
    
    this.emit('presence-update', { userId, workspaceId, presence: data });
  }

  /**
   * Handle ping message
   */
  private handlePing(ws: WebSocket, _message: CollaborationMessage): void {
    ws.send(JSON.stringify({
      type: 'pong',
      timestamp: new Date()
    }));
  }

  /**
   * Handle new comment creation
   */
  private handleComment(message: CollaborationMessage): void {
    const { workspaceId } = message;
    
    // Broadcast comment to all users in workspace
    this.broadcastToWorkspace(workspaceId, message);
    
    this.emit('comment-created', message.data);
  }

  /**
   * Handle comment reply
   */
  private handleCommentReply(message: CollaborationMessage): void {
    const { workspaceId } = message;
    
    // Broadcast reply to all users in workspace
    this.broadcastToWorkspace(workspaceId, message);
    
    this.emit('comment-reply', message.data);
  }

  /**
   * Handle comment edit
   */
  private handleCommentEdit(message: CollaborationMessage): void {
    const { workspaceId } = message;
    
    // Broadcast edit to all users in workspace
    this.broadcastToWorkspace(workspaceId, message);
    
    this.emit('comment-edited', message.data);
  }

  /**
   * Handle comment deletion
   */
  private handleCommentDelete(message: CollaborationMessage): void {
    const { workspaceId } = message;
    
    // Broadcast deletion to all users in workspace
    this.broadcastToWorkspace(workspaceId, message);
    
    this.emit('comment-deleted', message.data);
  }

  /**
   * Handle comment resolution
   */
  private handleCommentResolve(message: CollaborationMessage): void {
    const { workspaceId } = message;
    
    // Broadcast resolution to all users in workspace
    this.broadcastToWorkspace(workspaceId, message);
    
    this.emit('comment-resolved', message.data);
  }

  /**
   * Handle comment reaction
   */
  private handleCommentReact(message: CollaborationMessage): void {
    const { workspaceId } = message;
    
    // Broadcast reaction to all users in workspace
    this.broadcastToWorkspace(workspaceId, message);
    
    this.emit('comment-reacted', message.data);
  }

  /**
   * Remove user from workspace
   */
  private removeUserFromWorkspace(userId: string, workspaceId: string): void {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return;

    workspace.users.delete(userId);
    workspace.connections.delete(userId);
    this.userConnections.delete(userId);

    // Notify other users
    this.broadcastToWorkspace(workspaceId, {
      type: 'leave',
      userId,
      workspaceId,
      timestamp: new Date()
    });

    // Remove workspace if empty
    if (workspace.users.size === 0) {
      this.workspaces.delete(workspaceId);
    }

    this.emit('user-left', { userId, workspaceId });
  }

  /**
   * Broadcast message to all users in a workspace except sender
   */
  private broadcastToWorkspace(
    workspaceId: string,
    message: CollaborationMessage | any,
    excludeUserId?: string
  ): void {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return;

    const messageStr = JSON.stringify(message);
    
    workspace.connections.forEach((ws, userId) => {
      if (userId !== excludeUserId && ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }

  /**
   * Start ping interval to keep connections alive
   */
  private startPingInterval(): void {
    this.pingIntervalId = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      });
    }, this.options.pingInterval);
  }

  /**
   * Get all active workspaces
   */
  getWorkspaces(): WorkspaceSession[] {
    return Array.from(this.workspaces.values());
  }

  /**
   * Get users in a workspace
   */
  getWorkspaceUsers(workspaceId: string): UserPresence[] {
    const workspace = this.workspaces.get(workspaceId);
    return workspace ? Array.from(workspace.users.values()) : [];
  }

  /**
   * Get user presence
   */
  getUserPresence(userId: string, workspaceId: string): UserPresence | null {
    const workspace = this.workspaces.get(workspaceId);
    return workspace?.users.get(userId) || null;
  }

  /**
   * Send message to specific user
   */
  sendToUser(userId: string, message: any): boolean {
    const ws = this.userConnections.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  /**
   * Get server statistics
   */
  getStats(): {
    totalConnections: number;
    totalWorkspaces: number;
    totalUsers: number;
  } {
    return {
      totalConnections: this.wss.clients.size,
      totalWorkspaces: this.workspaces.size,
      totalUsers: this.userConnections.size
    };
  }
}
