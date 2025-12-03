import { PredictedQA, PredictionResponse } from './types';
import { v4 as uuidv4 } from 'uuid';

export class ResponseParser {
    /**
     * Parse the raw AI response into structured predictions
     */
    parse(rawResponse: string, originalQuery: string, mainTopic: string): PredictionResponse {
        const startTime = Date.now();
        let parsedJson: any;

        try {
            // Attempt to parse JSON, handling potential markdown code blocks
            const jsonString = this.extractJson(rawResponse);
            parsedJson = JSON.parse(jsonString);
        } catch (error) {
            console.error('Failed to parse AI response as JSON:', error);
            throw new Error('Invalid response format from AI model');
        }

        // Validate structure
        if (!parsedJson.predictions || !Array.isArray(parsedJson.predictions)) {
            throw new Error('Response missing predictions array');
        }

        const predictions: PredictedQA[] = parsedJson.predictions.map((p: any) => ({
            question: p.question,
            answer: p.answer,
            topic: p.topic || mainTopic,
            confidence: p.confidence || 0.8,
            type: p.type || 'follow-up'
        }));

        return {
            originalQuery,
            mainTopic: parsedJson.mainTopic || mainTopic,
            predictions,
            metadata: {
                generatedAt: new Date(),
                modelUsed: 'gpt-4', // Placeholder, would come from actual response metadata
                totalTokens: 0, // Placeholder
                processingTimeMs: Date.now() - startTime
            }
        };
    }

    /**
     * Extract JSON from potential markdown blocks or raw text
     */
    private extractJson(text: string): string {
        text = text.trim();

        // Check for markdown code blocks
        const codeBlockRegex = /```json\s*([\s\S]*?)\s*```/;
        const match = text.match(codeBlockRegex);

        if (match) {
            return match[1];
        }

        // Check if it starts with {
        if (text.startsWith('{')) {
            return text;
        }

        return text;
    }
}
