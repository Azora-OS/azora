import { TopicAnalysis } from './types';

interface ConversationState {
    userId: string;
    sessionId: string;
    currentTopic: string | null;
    topicHistory: string[];
    messageCount: number;
    lastActivity: Date;
    topicGraph: Map<string, string[]>; // Topic -> Related Topics
}

export class ConversationContextManager {
    private contexts: Map<string, ConversationState> = new Map();
    private readonly SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

    /**
     * Get or create conversation context
     */
    getContext(userId: string, sessionId: string): ConversationState {
        const key = this.getContextKey(userId, sessionId);
        let context = this.contexts.get(key);

        if (!context || this.isSessionExpired(context)) {
            context = {
                userId,
                sessionId,
                currentTopic: null,
                topicHistory: [],
                messageCount: 0,
                lastActivity: new Date(),
                topicGraph: new Map()
            };
            this.contexts.set(key, context);
        }

        return context;
    }

    /**
     * Update context with new topic analysis
     */
    updateContext(userId: string, sessionId: string, analysis: TopicAnalysis): void {
        const context = this.getContext(userId, sessionId);

        // Update activity timestamp
        context.lastActivity = new Date();
        context.messageCount++;

        // Detect topic pivot
        if (context.currentTopic && context.currentTopic !== analysis.mainTopic) {
            // Record transition in graph
            if (!context.topicGraph.has(context.currentTopic)) {
                context.topicGraph.set(context.currentTopic, []);
            }
            context.topicGraph.get(context.currentTopic)!.push(analysis.mainTopic);
        }

        // Update current topic
        context.currentTopic = analysis.mainTopic;
        context.topicHistory.push(analysis.mainTopic);
    }

    /**
     * Check if session has expired
     */
    private isSessionExpired(context: ConversationState): boolean {
        const now = new Date().getTime();
        return (now - context.lastActivity.getTime()) > this.SESSION_TIMEOUT_MS;
    }

    /**
     * Generate unique key for context
     */
    private getContextKey(userId: string, sessionId: string): string {
        return `${userId}:${sessionId}`;
    }

    /**
     * Get previous topics
     */
    getPreviousTopics(userId: string, sessionId: string): string[] {
        const context = this.getContext(userId, sessionId);
        // Return unique topics, excluding current
        return [...new Set(context.topicHistory)].filter(t => t !== context.currentTopic);
    }
}
