import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3100';

class SocketClient {
    private socket: Socket | null = null;
    private projectId: string | null = null;

    connect() {
        if (this.socket) return;

        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
        });

        this.socket.on('connect', () => {
            console.log('Connected to WebSocket server');
            if (this.projectId) {
                this.joinProject(this.projectId);
            }
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinProject(projectId: string) {
        this.projectId = projectId;
        if (this.socket?.connected) {
            this.socket.emit('join:project', projectId);
        }
    }

    leaveProject() {
        if (this.projectId && this.socket?.connected) {
            this.socket.emit('leave:project', this.projectId);
            this.projectId = null;
        }
    }

    // Event listeners
    onAgentActivity(callback: (activity: any) => void) {
        this.socket?.on('agent:activity', callback);
        return () => this.socket?.off('agent:activity', callback);
    }

    onAgentCursor(callback: (cursor: any) => void) {
        this.socket?.on('agent:cursor', callback);
        return () => this.socket?.off('agent:cursor', callback);
    }

    onTaskUpdate(callback: (task: any) => void) {
        this.socket?.on('task:update', callback);
        return () => this.socket?.off('task:update', callback);
    }

    onTextChange(callback: (change: any) => void) {
        this.socket?.on('text:change', callback);
        return () => this.socket?.off('text:change', callback);
    }

    onAgentStatusUpdate(callback: (status: any) => void) {
        this.socket?.on('agent:status-update', callback);
        return () => this.socket?.off('agent:status-update', callback);
    }

    // Actions
    instructAgent(agentName: string, instruction: string) {
        if (this.projectId) {
            this.socket?.emit('agent:instruct', {
                projectId: this.projectId,
                agentName,
                instruction,
            });
        }
    }
}

export const socketClient = new SocketClient();
