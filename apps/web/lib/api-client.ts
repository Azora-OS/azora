/**
 * API Client for Azora Sapiens (Elara AI) Service
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_SAPIENS_URL || 'http://localhost:3001';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: Date;
}

export interface ChatResponse {
    message: string;
    success: boolean;
    error?: string;
}

class AzoraAPIClient {
    private baseURL: string;

    constructor(baseURL: string = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    /**
     * Send a message to Elara AI
     */
    async sendMessage(message: string, conversationHistory: ChatMessage[] = []): Promise<ChatResponse> {
        try {
            const response = await fetch(`${this.baseURL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    history: conversationHistory,
                }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                message: data.response || data.message,
                success: true,
            };
        } catch (error) {
            console.error('Error sending message to Elara:', error);
            return {
                message: '',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Check if the Elara service is healthy
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return response.ok;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }

    /**
     * Get learning recommendations
     */
    async getRecommendations(topic: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/api/recommendations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ topic }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting recommendations:', error);
            return null;
        }
    }
}

// Export singleton instance
export const apiClient = new AzoraAPIClient();

// Export class for custom instances
export default AzoraAPIClient;
