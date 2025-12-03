import { MasterPrompt, TopicAnalysis, PrPEngConfig } from './types';

export class MasterPromptGenerator {
    private config: PrPEngConfig;

    constructor(config: PrPEngConfig) {
        this.config = config;
    }

    /**
     * Generate a Master Prompt for the given query and topic analysis
     */
    generate(query: string, analysis: TopicAnalysis): MasterPrompt {
        const scopeInstruction = this.getScopeInstruction(this.config.predictionScope);
        const count = this.config.predictionsPerQuery;

        const systemPrompt = `You are the Azora Predictive Engine. Your goal is to anticipate what a user will ask next about a topic and provide comprehensive coverage in a single response.
    
You must generate a JSON response containing the direct answer to the user's query PLUS ${count} predicted follow-up Q&A pairs.
    
Your predictions should cover:
1. Logical follow-up questions (next steps in learning)
2. Related concepts (horizontal expansion)
3. Practical applications (how to use this)
4. Comparisons (this vs that)
5. Common misconceptions
    
Output strictly in JSON format.`;

        const userPrompt = `User Query: "${query}"
    
Context Analysis:
- Main Topic: ${analysis.mainTopic}
- Complexity: ${analysis.complexity}
- Intent: ${analysis.intent}
    
${scopeInstruction}
    
Generate the response with the following structure:
{
  "directAnswer": "The immediate answer to the user's query...",
  "mainTopic": "${analysis.mainTopic}",
  "predictions": [
    {
      "question": "Predicted question 1",
      "answer": "Detailed answer...",
      "topic": "Sub-topic name",
      "type": "follow-up",
      "confidence": 0.95
    },
    ...
  ]
}`;

        return {
            systemPrompt,
            userPrompt,
            expectedFormat: 'json'
        };
    }

    /**
     * Get specific instructions based on prediction scope
     */
    private getScopeInstruction(scope: 'narrow' | 'medium' | 'wide'): string {
        switch (scope) {
            case 'narrow':
                return 'Focus strictly on the immediate topic and direct follow-ups. Do not stray into tangentially related fields.';
            case 'wide':
                return 'Explore the topic broadly. Include interdisciplinary connections, historical context, and future implications. Connect to other domains.';
            case 'medium':
            default:
                return 'Balance between direct follow-ups and related concepts. Cover the core topic comprehensively before branching out.';
        }
    }
}
