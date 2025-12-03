import axios from 'axios';
import { SYSTEM_PROMPT, ACTION_EVALUATION_PROMPT, BIAS_DETECTION_PROMPT } from './prompts';

export interface LLMResponse {
    content: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
    };
}

export interface LLMAdapter {
    complete(prompt: string, systemPrompt?: string): Promise<LLMResponse>;
}

export class MockAdapter implements LLMAdapter {
    async complete(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
        console.log('[MockLLM] Processing prompt:', prompt.substring(0, 50) + '...');

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Simple heuristic simulation for dev
        if (prompt.includes('bias')) {
            return {
                content: JSON.stringify({
                    hasBias: false,
                    confidence: 0.9,
                    explanation: "Mock analysis: No obvious bias detected in this text."
                })
            };
        }

        // Default "Allowed" response for actions
        return {
            content: JSON.stringify({
                isAllowed: true,
                score: 95,
                critique: "Action aligns with Ubuntu principles. No violations detected.",
                violations: []
            })
        };
    }
}

export class OpenAIAdapter implements LLMAdapter {
    private apiKey: string;
    private model: string;

    constructor(apiKey: string, model: string = 'gpt-4') {
        this.apiKey = apiKey;
        this.model = model;
    }

    async complete(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
        try {
            const messages = [
                { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
                { role: 'user', content: prompt }
            ];

            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: this.model,
                    messages: messages,
                    temperature: 0.2, // Low temperature for consistent rule enforcement
                    response_format: { type: "json_object" } // Force JSON output
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                content: response.data.choices[0].message.content,
                usage: response.data.usage
            };
        } catch (error: any) {
            console.error('OpenAI API Error:', error.response?.data || error.message);
            throw new Error('Failed to get completion from OpenAI');
        }
    }
}

export class LLMService {
    private adapter: LLMAdapter;

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (apiKey && apiKey !== 'mock') {
            console.log('🔌 Initializing LLM Service with OpenAI Adapter');
            this.adapter = new OpenAIAdapter(apiKey);
        } else {
            console.log('⚠️ Initializing LLM Service with Mock Adapter (Dev Mode)');
            this.adapter = new MockAdapter();
        }
    }

    async evaluateAction(action: any): Promise<any> {
        const prompt = ACTION_EVALUATION_PROMPT
            .replace('{{TYPE}}', action.type)
            .replace('{{ACTOR}}', action.actorId)
            .replace('{{PAYLOAD}}', JSON.stringify(action.payload))
            .replace('{{CONTEXT}}', action.context || 'None');

        const response = await this.adapter.complete(prompt, SYSTEM_PROMPT);
        try {
            return JSON.parse(response.content);
        } catch (e) {
            console.error('Failed to parse LLM JSON response:', response.content);
            return { isAllowed: false, score: 0, critique: "System Error: Invalid LLM Response", violations: ["Internal Error"] };
        }
    }

    async detectBias(text: string): Promise<any> {
        const prompt = BIAS_DETECTION_PROMPT.replace('{{TEXT}}', text);
        const response = await this.adapter.complete(prompt, SYSTEM_PROMPT);
        try {
            return JSON.parse(response.content);
        } catch (e) {
            return { hasBias: true, confidence: 0, explanation: "System Error: Failed to parse analysis." };
        }
    }
}
