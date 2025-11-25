/**
 * WebSocket Client for Real-Time Features
 * Handles mining updates, notifications, and live sessions
 */

import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4001';

class WebSocketClient {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    connect(userId: string) {
        if (this.socket?.connected) return;

        this.socket = io(WS_URL, {
            auth: { userId },
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        this.setupListeners();
    }

    private setupListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('✅ WebSocket connected');
            this.reconnectAttempts = 0;
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ WebSocket disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            this.reconnectAttempts++;

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('Max reconnection attempts reached');
                this.socket?.disconnect();
            }
        });
    }

    // Mining events
    onMiningUpdate(callback: (data: any) => void) {
        this.socket?.on('mining:update', callback);
    }

    onMiningStarted(callback: (data: any) => void) {
        this.socket?.on('mining:started', callback);
    }

    onMiningStopped(callback: (data: any) => void) {
        this.socket?.on('mining:stopped', callback);
    }

    // Notification events
    onNotification(callback: (data: any) => void) {
        this.socket?.on('notification', callback);
    }

    // Session events
    onSessionUpdate(callback: (data: any) => void) {
        this.socket?.on('session:update', callback);
    }

    onParticipantJoined(callback: (data: any) => void) {
        this.socket?.on('session:participant-joined', callback);
    }

    onParticipantLeft(callback: (data: any) => void) {
        this.socket?.on('session:participant-left', callback);
    }

    // Chat events
    onChatMessage(callback: (data: any) => void) {
        this.socket?.on('chat:message', callback);
    }

    sendChatMessage(sessionId: string, message: string) {
        this.socket?.emit('chat:send', { sessionId, message });
    }

    // Cleanup
    disconnect() {
        this.socket?.disconnect();
        this.socket = null;
    }

    // Remove specific listener
    off(event: string, callback?: any) {
        this.socket?.off(event, callback);
    }
}

export const wsClient = new WebSocketClient();
export default wsClient;
