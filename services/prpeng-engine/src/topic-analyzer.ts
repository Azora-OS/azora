import { TopicAnalysis } from './types';

export class TopicAnalyzer {
    /**
     * Analyze a user query to extract topic information
     * In a real implementation, this would use NLP or a lightweight local model
     */
    analyze(query: string): TopicAnalysis {
        const lowerQuery = query.toLowerCase();

        // Simple heuristic-based analysis for MVP
        // This will be replaced by more sophisticated NLP later

        const complexity = this.determineComplexity(lowerQuery);
        const intent = this.determineIntent(lowerQuery);
        const mainTopic = this.extractMainTopic(query);

        return {
            mainTopic,
            subTopics: [], // To be filled by more advanced logic
            intent,
            complexity,
            relatedDomains: this.getRelatedDomains(mainTopic)
        };
    }

    private determineComplexity(query: string): 'beginner' | 'intermediate' | 'advanced' {
        const advancedTerms = ['optimize', 'architecture', 'implementation', 'theory', 'analysis', 'compare', 'vs', 'difference'];
        const intermediateTerms = ['how to', 'example', 'use', 'create', 'build'];

        if (advancedTerms.some(term => query.includes(term))) return 'advanced';
        if (intermediateTerms.some(term => query.includes(term))) return 'intermediate';
        return 'beginner';
    }

    private determineIntent(query: string): 'learning' | 'problem-solving' | 'exploration' | 'comparison' {
        if (query.includes('vs') || query.includes('compare') || query.includes('difference')) return 'comparison';
        if (query.includes('fix') || query.includes('error') || query.includes('solve') || query.includes('bug')) return 'problem-solving';
        if (query.includes('what is') || query.includes('explain') || query.includes('define')) return 'learning';
        return 'exploration';
    }

    private extractMainTopic(query: string): string {
        // Very basic extraction - removing common stop words and question phrases
        // Real implementation would use Named Entity Recognition (NER)
        const stopPhrases = ['what is', 'how to', 'explain', 'tell me about', 'describe', 'compare', 'vs', 'difference between'];
        let topic = query;

        for (const phrase of stopPhrases) {
            const regex = new RegExp(`^${phrase}\\s+`, 'i');
            topic = topic.replace(regex, '');
        }

        return topic.replace(/[?.,!]/g, '').trim();
    }

    private getRelatedDomains(topic: string): string[] {
        // Placeholder for domain mapping logic
        // In production, this would query a knowledge graph
        return [];
    }
}
