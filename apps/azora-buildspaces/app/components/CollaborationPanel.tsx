"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import {
    Users, Circle, User, MessageSquare, Eye, Edit3,
    Video, Mic, MicOff, VideoOff, Share2
} from "lucide-react";

// Collaboration types
interface Collaborator {
    id: string;
    name: string;
    avatar?: string;
    color: string;
    cursor?: { line: number; column: number; file?: string };
    isOnline: boolean;
    role: 'owner' | 'editor' | 'viewer';
}

interface CollaborationMessage {
    id: string;
    userId: string;
    userName: string;
    content: string;
    timestamp: Date;
}

interface CollaborationContextType {
    collaborators: Collaborator[];
    messages: CollaborationMessage[];
    isConnected: boolean;
    sessionId: string | null;
    currentUser: Collaborator | null;
    sendMessage: (content: string) => void;
    updateCursor: (line: number, column: number, file: string) => void;
    inviteUser: (email: string) => void;
    startSession: () => void;
    endSession: () => void;
}

const CollaborationContext = createContext<CollaborationContextType | null>(null);

// Generate random color for cursor
function getRandomColor() {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
        '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Simulated collaborators for demo
const demoCollaborators: Collaborator[] = [
    {
        id: 'demo-1',
        name: 'Themba AI',
        color: '#4ECDC4',
        isOnline: true,
        role: 'editor',
        cursor: { line: 5, column: 12, file: '/my-project/src/index.ts' }
    },
    {
        id: 'demo-2',
        name: 'Elara AI',
        color: '#FF6B6B',
        isOnline: true,
        role: 'viewer',
    }
];

// Provider component
export function CollaborationProvider({ children }: { children: ReactNode }) {
    const [collaborators, setCollaborators] = useState<Collaborator[]>(demoCollaborators);
    const [messages, setMessages] = useState<CollaborationMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<Collaborator | null>(null);

    const startSession = () => {
        const newSessionId = `session-${Date.now().toString(36)}`;
        setSessionId(newSessionId);
        setIsConnected(true);
        setCurrentUser({
            id: 'current-user',
            name: 'You',
            color: getRandomColor(),
            isOnline: true,
            role: 'owner'
        });
    };

    const endSession = () => {
        setSessionId(null);
        setIsConnected(false);
        setCurrentUser(null);
    };

    const sendMessage = (content: string) => {
        if (!currentUser) return;

        const newMessage: CollaborationMessage = {
            id: Date.now().toString(),
            userId: currentUser.id,
            userName: currentUser.name,
            content,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
    };

    const updateCursor = (line: number, column: number, file: string) => {
        if (!currentUser) return;

        setCurrentUser(prev => prev ? {
            ...prev,
            cursor: { line, column, file }
        } : null);
    };

    const inviteUser = (email: string) => {
        console.log(`Invitation sent to: ${email}`);
        // In production, this would send an email/link
    };

    return (
        <CollaborationContext.Provider value={{
            collaborators,
            messages,
            isConnected,
            sessionId,
            currentUser,
            sendMessage,
            updateCursor,
            inviteUser,
            startSession,
            endSession
        }}>
            {children}
        </CollaborationContext.Provider>
    );
}

// Hook to use collaboration
export function useCollaboration() {
    const context = useContext(CollaborationContext);
    if (!context) {
        throw new Error('useCollaboration must be used within a CollaborationProvider');
    }
    return context;
}

// Collaboration Panel Component
interface CollaborationPanelProps {
    onClose?: () => void;
}

export default function CollaborationPanel({ onClose }: CollaborationPanelProps) {
    const {
        collaborators,
        messages,
        isConnected,
        sessionId,
        currentUser,
        sendMessage,
        inviteUser,
        startSession,
        endSession
    } = useCollaboration();

    const [messageInput, setMessageInput] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [showInvite, setShowInvite] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(false);

    const handleSendMessage = () => {
        if (messageInput.trim()) {
            sendMessage(messageInput);
            setMessageInput('');
        }
    };

    const handleInvite = () => {
        if (inviteEmail.trim()) {
            inviteUser(inviteEmail);
            setInviteEmail('');
            setShowInvite(false);
        }
    };

    const copySessionLink = () => {
        const link = `${window.location.origin}/room/code-chamber/${sessionId}`;
        navigator.clipboard.writeText(link);
        alert('Session link copied!');
    };

    if (!isConnected) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <Users className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-bold mb-2">Start Collaborating</h3>
                <p className="text-sm text-muted-foreground mb-6">
                    Work together in real-time with your team
                </p>
                <button
                    onClick={startSession}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2"
                >
                    <Share2 className="w-4 h-4" />
                    Start Session
                </button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Live Session</span>
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-1.5 rounded ${isMuted ? 'bg-muted' : 'bg-primary/10 text-primary'}`}
                    >
                        {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => setIsVideoOn(!isVideoOn)}
                        className={`p-1.5 rounded ${!isVideoOn ? 'bg-muted' : 'bg-primary/10 text-primary'}`}
                    >
                        {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={copySessionLink}
                        className="p-1.5 rounded hover:bg-muted"
                        title="Copy session link"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Collaborators */}
            <div className="p-3 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                        Collaborators ({collaborators.length + 1})
                    </span>
                    <button
                        onClick={() => setShowInvite(!showInvite)}
                        className="text-xs text-primary hover:underline"
                    >
                        + Invite
                    </button>
                </div>

                {showInvite && (
                    <div className="flex gap-2 mb-2">
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="email@example.com"
                            className="flex-1 bg-muted border border-border rounded px-2 py-1 text-sm"
                        />
                        <button
                            onClick={handleInvite}
                            className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm"
                        >
                            Send
                        </button>
                    </div>
                )}

                <div className="space-y-2">
                    {/* Current user */}
                    {currentUser && (
                        <div className="flex items-center gap-2 text-sm">
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                style={{ backgroundColor: currentUser.color }}
                            >
                                {currentUser.name.charAt(0)}
                            </div>
                            <span>{currentUser.name} (you)</span>
                            <span className="ml-auto text-xs bg-primary/10 text-primary px-1.5 rounded">
                                {currentUser.role}
                            </span>
                        </div>
                    )}

                    {/* Other collaborators */}
                    {collaborators.map((collab) => (
                        <div key={collab.id} className="flex items-center gap-2 text-sm">
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white relative"
                                style={{ backgroundColor: collab.color }}
                            >
                                {collab.name.charAt(0)}
                                {collab.isOnline && (
                                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-card" />
                                )}
                            </div>
                            <span className={!collab.isOnline ? 'text-muted-foreground' : ''}>
                                {collab.name}
                            </span>
                            <span className="ml-auto text-xs text-muted-foreground">
                                {collab.cursor ? `L${collab.cursor.line}` : ''}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="p-2 border-b border-border">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        Session Chat
                    </span>
                </div>

                <div className="flex-1 overflow-auto p-3 space-y-2">
                    {messages.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">
                            No messages yet. Start the conversation!
                        </p>
                    )}
                    {messages.map((msg) => (
                        <div key={msg.id} className="text-sm">
                            <span className="font-medium text-primary">{msg.userName}: </span>
                            <span>{msg.content}</span>
                        </div>
                    ))}
                </div>

                <div className="p-2 border-t border-border flex gap-2">
                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 bg-muted border border-border rounded px-2 py-1.5 text-sm"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </div>

            {/* End session */}
            <div className="p-3 border-t border-border">
                <button
                    onClick={endSession}
                    className="w-full py-2 text-sm text-red-500 hover:bg-red-500/10 rounded"
                >
                    End Session
                </button>
            </div>
        </div>
    );
}
