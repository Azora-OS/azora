import { MasterPrompt } from './types';

export class BridgePromptGenerator {
    /**
     * Generate a bridge prompt connecting two topics
     */
    generate(currentTopic: string, previousTopic: string): MasterPrompt | null {
        if (!previousTopic || currentTopic === previousTopic) {
            return null;
        }

        const systemPrompt = `You are the Azora Predictive Engine. The user has switched topics from "${previousTopic}" to "${currentTopic}".
    
Your goal is to bridge these two topics to maintain conversation continuity and help the user see connections.
    
Generate a JSON response that includes:
1. The direct answer to the user's query about "${currentTopic}"
2. A "bridge" section explaining how "${currentTopic}" relates to "${previousTopic}"
3. Predicted follow-up questions that explore this connection
    
Output strictly in JSON format.`;

        const userPrompt = `Context:
- Previous Topic: ${previousTopic}
- Current Topic: ${currentTopic}
    
Generate response with:
{
  "directAnswer": "...",
  "bridge": "Here is how ${currentTopic} relates to ${previousTopic}...",
  "predictions": [
    {
      "question": "Bridge question 1",
      "answer": "...",
      "topic": "Intersection of ${currentTopic} and ${previousTopic}",
      "type": "bridge",
      "confidence": 0.85
    }
  ]
}`;

        return {
            systemPrompt,
            userPrompt,
            expectedFormat: 'json'
        };
    }
}
