/**
 * AI Family Service Integration for BuildSpaces
 * 
 * Connects to the AI Family Service which provides 11 distinct AI personalities:
 * - Elara: Primary AI Tutor
 * - Themba: System Architect
 * - Kofi: Hardware Engineer
 * - Jabari: Security Guardian
 * - Naledi: Data Scientist
 * - Zola: Creative Director
 * - Abeni: Community Manager
 * - Sankofa: Code Historian
 * - Amara: Performance Expert
 * - Thembo: DevOps Master
 * - Nexus: Integration Specialist
 * 
 * Reuses services/ai-family-service/
 */

// Agent personality types
export type AgentPersonality =
    | 'elara' | 'themba' | 'kofi' | 'jabari' | 'naledi'
    | 'zola' | 'abeni' | 'sankofa' | 'amara' | 'thembo' | 'nexus';

// Agent profile
export interface AgentProfile {
    id: AgentPersonality;
    name: string;
    role: string;
    specialties: string[];
    avatar?: string;
    color: string;
    greeting: string;
}

// Agent profiles
export const AGENT_PROFILES: Record<AgentPersonality, AgentProfile> = {
    elara: {
        id: 'elara',
        name: 'Elara',
        role: 'AI Tutor & Guide',
        specialties: ['Teaching', 'Coding', 'Design', 'Debugging', 'Presentations'],
        color: '#FF6B6B',
        greeting: "Hello! I'm Elara, your AI guide. What would you like to learn today?"
    },
    themba: {
        id: 'themba',
        name: 'Themba',
        role: 'System Architect',
        specialties: ['Architecture', 'System Design', 'Code Review', 'Best Practices'],
        color: '#4ECDC4',
        greeting: "I'm Themba, your System Architect. Let's build something solid."
    },
    kofi: {
        id: 'kofi',
        name: 'Kofi',
        role: 'Hardware Engineer',
        specialties: ['IoT', 'Embedded Systems', 'Circuit Design', '3D Printing'],
        color: '#FFD93D',
        greeting: "Kofi here! Ready to bring your hardware ideas to life."
    },
    jabari: {
        id: 'jabari',
        name: 'Jabari',
        role: 'Security Guardian',
        specialties: ['Security', 'Cryptography', 'Penetration Testing', 'Compliance'],
        color: '#6BCB77',
        greeting: "I'm Jabari, your Security Guardian. Let's make your code bulletproof."
    },
    naledi: {
        id: 'naledi',
        name: 'Naledi',
        role: 'Data Scientist',
        specialties: ['Machine Learning', 'Data Analysis', 'Statistics', 'Visualization'],
        color: '#9B59B6',
        greeting: "Naledi at your service! Let's explore your data together."
    },
    zola: {
        id: 'zola',
        name: 'Zola',
        role: 'Creative Director',
        specialties: ['UI/UX Design', 'Branding', 'Animation', 'Prototyping'],
        color: '#FF69B4',
        greeting: "I'm Zola, your creative partner. Let's design something beautiful!"
    },
    abeni: {
        id: 'abeni',
        name: 'Abeni',
        role: 'Community Manager',
        specialties: ['Documentation', 'Collaboration', 'Communication', 'Mentoring'],
        color: '#3498DB',
        greeting: "Abeni here! Let me help coordinate your team."
    },
    sankofa: {
        id: 'sankofa',
        name: 'Sankofa',
        role: 'Code Historian',
        specialties: ['Code Archaeology', 'Refactoring', 'Legacy Systems', 'Documentation'],
        color: '#E67E22',
        greeting: "I'm Sankofa, keeper of code history. Let's learn from the past."
    },
    amara: {
        id: 'amara',
        name: 'Amara',
        role: 'Performance Expert',
        specialties: ['Optimization', 'Profiling', 'Caching', 'Scalability'],
        color: '#F39C12',
        greeting: "Amara here! Let's make your code fly."
    },
    thembo: {
        id: 'thembo',
        name: 'Thembo',
        role: 'DevOps Master',
        specialties: ['CI/CD', 'Docker', 'Kubernetes', 'Cloud Infrastructure'],
        color: '#1ABC9C',
        greeting: "I'm Thembo, your DevOps specialist. Let's ship confidently."
    },
    nexus: {
        id: 'nexus',
        name: 'Nexus',
        role: 'Integration Specialist',
        specialties: ['APIs', 'Microservices', 'Data Pipelines', 'System Integration'],
        color: '#9B59B6',
        greeting: "Nexus here! I'll help you connect all the pieces."
    }
};

// Room to agent mapping
export const ROOM_AGENTS: Record<string, AgentPersonality[]> = {
    'code-chamber': ['themba', 'elara', 'jabari', 'sankofa'],
    'maker-lab': ['kofi', 'elara', 'thembo'],
    'ai-studio': ['naledi', 'elara', 'amara'],
    'design-studio': ['zola', 'elara', 'abeni'],
    'collaboration-pod': ['abeni', 'elara', 'nexus'],
    'deep-focus': ['elara', 'amara'],
    'innovation-theater': ['elara', 'zola', 'abeni']
};

// Message to AI Family
export interface AIFamilyMessage {
    agent: AgentPersonality;
    message: string;
    context?: {
        roomType?: string;
        currentCode?: string;
        language?: string;
        history?: Array<{ role: string; content: string }>;
    };
}

// Response from AI Family
export interface AIFamilyResponse {
    agentId: AgentPersonality;
    agentName: string;
    response: string;
    suggestions?: string[];
    codeBlocks?: Array<{ language: string; code: string }>;
    references?: string[];
}

/**
 * AI Family Service Client
 */
export class AIFamilyServiceClient {
    private static instance: AIFamilyServiceClient;
    private baseUrl: string;
    private apiKey: string | null;

    private constructor() {
        this.baseUrl = process.env.AI_FAMILY_URL || 'http://localhost:3005';
        this.apiKey = process.env.AI_FAMILY_API_KEY || null;
    }

    static getInstance(): AIFamilyServiceClient {
        if (!AIFamilyServiceClient.instance) {
            AIFamilyServiceClient.instance = new AIFamilyServiceClient();
        }
        return AIFamilyServiceClient.instance;
    }

    /**
     * Get all agent profiles
     */
    getAgentProfiles(): AgentProfile[] {
        return Object.values(AGENT_PROFILES);
    }

    /**
     * Get agent profile by ID
     */
    getAgentProfile(agentId: AgentPersonality): AgentProfile | undefined {
        return AGENT_PROFILES[agentId];
    }

    /**
     * Get recommended agents for a room
     */
    getAgentsForRoom(roomType: string): AgentProfile[] {
        const agentIds = ROOM_AGENTS[roomType] || ['elara'];
        return agentIds.map(id => AGENT_PROFILES[id]).filter(Boolean);
    }

    /**
     * Send message to an agent
     */
    async chat(message: AIFamilyMessage): Promise<AIFamilyResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
                },
                body: JSON.stringify(message)
            });

            if (!response.ok) {
                throw new Error(`Chat failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[AIFamily] Chat error:', error);
            return this.getFallbackResponse(message.agent, message.message);
        }
    }

    /**
     * Get agent collaboration (multiple agents discussing)
     */
    async swarm(
        agents: AgentPersonality[],
        topic: string,
        context?: Record<string, unknown>
    ): Promise<AIFamilyResponse[]> {
        try {
            const response = await fetch(`${this.baseUrl}/api/swarm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
                },
                body: JSON.stringify({ agents, topic, context })
            });

            if (!response.ok) {
                throw new Error(`Swarm failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[AIFamily] Swarm error:', error);
            return agents.map(agent => this.getFallbackResponse(agent, topic));
        }
    }

    /**
     * Fallback response when service is unavailable
     */
    private getFallbackResponse(agentId: AgentPersonality, message: string): AIFamilyResponse {
        const profile = AGENT_PROFILES[agentId] || AGENT_PROFILES.elara;

        return {
            agentId: profile.id,
            agentName: profile.name,
            response: `${profile.greeting}\n\nI received your message about "${message.slice(0, 50)}...". The AI Family Service is currently offline, but I'm here to help in a limited capacity. Please check back soon for full functionality.`,
            suggestions: [
                'Check AI_FAMILY_URL environment variable',
                'Ensure the AI Family Service is running',
                'Try restarting the service'
            ]
        };
    }

    /**
     * Check if AI Family Service is available
     */
    async isAvailable(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}

// Export singleton getter
export function getAIFamilyService(): AIFamilyServiceClient {
    return AIFamilyServiceClient.getInstance();
}
